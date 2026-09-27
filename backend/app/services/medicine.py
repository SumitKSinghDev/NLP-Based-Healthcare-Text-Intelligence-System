import os
import csv
import re
from typing import List, Dict, Any
from backend.app.services.negation import negation_detector

class MedicineExtractor:
    def __init__(self, lexicon_path: str = "data/resources/medicine_lexicon.csv"):
        self.lexicon_path = lexicon_path
        self.medicines = {}
        self.load_lexicon()
        
        # Regex patterns for clinical dosages, routes, and frequencies
        self.dosage_pattern = re.compile(
            r'\b(\d+(?:\.\d+)?\s*(?:mg|g|mcg|microgram|ug|ml|milliliter|tablets?|capsules?|units?|iu|%|meq|drops?))\b',
            re.IGNORECASE
        )
        self.frequency_pattern = re.compile(
            r'\b(once daily|twice daily|three times daily|four times daily|bid|tid|qid|qhs|q4h|q6h|q8h|q12h|daily|prn|as needed|every\s+\d+\s+hours?|stat)\b',
            re.IGNORECASE
        )
        self.route_pattern = re.compile(
            r'\b(oral|orally|po|iv|intravenous|im|intramuscular|subcutaneous|sc|sq|topical|inhalation|nebulized|rectal|sl|sublingual)\b',
            re.IGNORECASE
        )
        
    def load_lexicon(self):
        if not os.path.exists(self.lexicon_path):
            return
        with open(self.lexicon_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                name = row["medicine_name"].strip().lower()
                self.medicines[name] = {
                    "generic_name": row.get("generic_name", name.title()),
                    "drug_class": row.get("drug_class", "Therapeutic Agent"),
                    "atc_code": row.get("atc_code", "N/A"),
                    "common_indications": row.get("common_indications", "")
                }
        self.sorted_medicine_phrases = sorted(self.medicines.keys(), key=len, reverse=True)
        
    def extract_medicines(self, text: str) -> List[Dict[str, Any]]:
        """
        Extracts chemicals and medicine candidates, extracting associated dosage, frequency, and route.
        Clearly distinguishes CHEMICAL vs MEDICINE CANDIDATE vs DOSAGE.
        """
        if not text:
            return []
            
        results = []
        text_lower = text.lower()
        matched_spans = []
        
        # 1. Extract Medicines from lexicon
        for med_name in self.sorted_medicine_phrases:
            pattern = r'\b' + re.escape(med_name) + r'\b'
            for match in re.finditer(pattern, text_lower):
                start, end = match.start(), match.end()
                
                overlap = False
                for ms, me in matched_spans:
                    if not (end <= ms or start >= me):
                        overlap = True
                        break
                if overlap:
                    continue
                    
                matched_spans.append((start, end))
                original_phrase = text[start:end]
                meta = self.medicines[med_name]
                
                # Check for dosage in nearby window (up to 40 characters ahead or behind)
                window_start = max(0, start - 40)
                window_end = min(len(text), end + 40)
                window_text = text[window_start:window_end]
                
                dosage_match = self.dosage_pattern.search(window_text)
                dosage = dosage_match.group(1) if dosage_match else None
                
                freq_match = self.frequency_pattern.search(window_text)
                frequency = freq_match.group(1) if freq_match else None
                
                route_match = self.route_pattern.search(window_text)
                route = route_match.group(1) if route_match else None
                
                neg_info = negation_detector.detect_negation(text, original_phrase, start, end)
                
                results.append({
                    "text": original_phrase,
                    "type": "MEDICINE/CHEMICAL",
                    "entity_category": "MEDICINE CANDIDATE",
                    "generic_name": meta["generic_name"],
                    "drug_class": meta["drug_class"],
                    "atc_code": meta["atc_code"],
                    "common_indications": meta["common_indications"],
                    "dosage": dosage,
                    "frequency": frequency,
                    "route": route,
                    "start": start,
                    "end": end,
                    "status": neg_info["status"],
                    "confidence": 0.93
                })
                
        # 2. Extract standalone dosages if not already attached
        for match in self.dosage_pattern.finditer(text):
            d_start, d_end = match.start(), match.end()
            # Check if this dosage was matched near any medicine
            attached = False
            for r in results:
                if r.get("dosage") and match.group(1).lower() in r["dosage"].lower():
                    attached = True
                    break
            if not attached:
                results.append({
                    "text": match.group(1),
                    "type": "DOSAGE",
                    "entity_category": "DOSAGE",
                    "generic_name": None,
                    "drug_class": "Dosage Quantity",
                    "atc_code": "N/A",
                    "common_indications": "",
                    "dosage": match.group(1),
                    "frequency": None,
                    "route": None,
                    "start": d_start,
                    "end": d_end,
                    "status": "PRESENT",
                    "confidence": 0.96
                })
                
        results.sort(key=lambda x: x["start"])
        return results

# Singleton
medicine_extractor = MedicineExtractor()
