import os
import csv
import re
from typing import List, Dict, Any
from backend.app.services.negation import negation_detector

class SymptomExtractor:
    def __init__(self, lexicon_path: str = "data/resources/symptom_lexicon.csv"):
        self.lexicon_path = lexicon_path
        self.symptoms = {}
        self.load_lexicon()
        
    def load_lexicon(self):
        if not os.path.exists(self.lexicon_path):
            return
        with open(self.lexicon_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                sym = row["symptom"].strip().lower()
                self.symptoms[sym] = {
                    "canonical_name": row.get("canonical_name", sym.title()),
                    "category": row.get("category", "General"),
                    "severity_weight": float(row.get("severity_weight", 1.0))
                }
        # Sort keys descending by length to prefer longest phrase match
        self.sorted_symptom_phrases = sorted(self.symptoms.keys(), key=len, reverse=True)
        
    def extract_symptoms(self, text: str) -> List[Dict[str, Any]]:
        """
        Extracts symptoms with exact character offsets, categories, negation status,
        and severity weighting.
        """
        if not text:
            return []
            
        results = []
        text_lower = text.lower()
        matched_spans = [] # list of (start, end) to avoid overlapping sub-matches
        
        for phrase in self.sorted_symptom_phrases:
            pattern = r'\b' + re.escape(phrase) + r'\b'
            for match in re.finditer(pattern, text_lower):
                start, end = match.start(), match.end()
                
                # Check overlap with already matched longer phrases
                overlap = False
                for ms, me in matched_spans:
                    if not (end <= ms or start >= me):
                        overlap = True
                        break
                if overlap:
                    continue
                    
                matched_spans.append((start, end))
                original_phrase = text[start:end]
                sym_meta = self.symptoms[phrase]
                
                # Detect negation status
                neg_info = negation_detector.detect_negation(text, original_phrase, start, end)
                
                results.append({
                    "text": original_phrase,
                    "canonical_name": sym_meta["canonical_name"],
                    "category": sym_meta["category"],
                    "severity_weight": sym_meta["severity_weight"],
                    "start": start,
                    "end": end,
                    "type": "SYMPTOM",
                    "status": neg_info["status"], # PRESENT or NEGATED
                    "negation_cue": neg_info["cue"],
                    "confidence": 0.94 if phrase in self.symptoms else 0.88
                })
                
        # Sort by occurrence order in text
        results.sort(key=lambda x: x["start"])
        return results

# Singleton
symptom_extractor = SymptomExtractor()
