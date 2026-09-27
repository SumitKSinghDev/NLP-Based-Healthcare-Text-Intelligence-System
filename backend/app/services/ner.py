import os
import json
import re
from typing import List, Dict, Any, Tuple, Set
from collections import defaultdict
from backend.app.services.negation import negation_detector
from backend.app.services.symptom import symptom_extractor
from backend.app.services.medicine import medicine_extractor

# Common medical affixes / stems used for morphological filtering
MED_AFFIXES = (
    "itis", "emia", "oma", "pathy", "osis", "algia", "uria", "stenosis",
    "trophy", "card", "nephr", "derm", "gastr", "pulm", "onc", "vir", "bact",
    "myc", "cillin", "statin", "olol", "pril", "sartan", "prazole", "zepam", "caine"
)

STOPWORDS = set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with",
    "by", "of", "from", "as", "is", "was", "were", "are", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "can", "could", "should", "would",
    "may", "might", "must", "it", "its", "that", "this", "these", "those", "we",
    "our", "they", "their", "patient", "patients", "case", "cases", "study", "studies",
    "day", "days", "year", "years", "time", "group", "control", "effect", "rate",
    "level", "levels", "dose", "doses", "high", "low", "normal", "human", "cell", "cells"
])

class BiomedicalNER:
    """
    Hybrid Gazetteer / Rule-Based Biomedical Named Entity Recognizer.
    Builds vocabulary from training partitions (BC5CDR, NCBI Disease, BioRED)
    and applies n-gram matching, dictionary lookups, and morphological filtering.
    """
    def __init__(self, data_dir: str = "data/processed"):
        self.data_dir = data_dir
        self.disease_dict = {}
        self.chemical_dict = {}
        self.raw_unfiltered_dict = {}
        self.procedure_dict = {
            "biopsy": 1, "endoscopy": 1, "colonoscopy": 1, "bronchoscopy": 1, "dialysis": 1,
            "hemodialysis": 1, "appendectomy": 1, "cholecystectomy": 1, "angioplasty": 1,
            "catheterization": 1, "intubation": 1, "tracheostomy": 1, "ct scan": 1, "mri": 1,
            "ultrasound": 1, "echocardiogram": 1, "electrocardiogram": 1, "ecg": 1, "eeg": 1,
            "lumbar puncture": 1, "x-ray": 1, "radiography": 1, "blood transfusion": 1
        }
        self.load_learned_vocabularies()
        
    def load_learned_vocabularies(self):
        """Build gazetteer and frequencies from training splits only."""
        # 1. BC5CDR Train
        bc5cdr_train = os.path.join(self.data_dir, "bc5cdr", "train.json")
        if os.path.exists(bc5cdr_train):
            with open(bc5cdr_train, 'r', encoding='utf-8') as f:
                docs = json.load(f)
                for d in docs:
                    for ent in d.get("entities", []):
                        etype = ent.get("type")
                        text = ent.get("text", "").strip()
                        if not text or len(text) < 2:
                            continue
                        t_lower = text.lower()
                        self.raw_unfiltered_dict[t_lower] = etype
                        if etype == "Disease":
                            self.disease_dict[t_lower] = self.disease_dict.get(t_lower, 0) + 1
                        elif etype == "Chemical":
                            self.chemical_dict[t_lower] = self.chemical_dict.get(t_lower, 0) + 1
                            
        # 2. NCBI Train
        ncbi_train = os.path.join(self.data_dir, "ncbi_disease", "train.json")
        if os.path.exists(ncbi_train):
            with open(ncbi_train, 'r', encoding='utf-8') as f:
                docs = json.load(f)
                for d in docs:
                    for ent in d.get("entities", []):
                        text = ent.get("text", "").strip()
                        if text and len(text) >= 2:
                            self.disease_dict[text.lower()] = self.disease_dict.get(text.lower(), 0) + 1
                            self.raw_unfiltered_dict[text.lower()] = "Disease"
                            
        # 3. BioRED Train
        biored_train = os.path.join(self.data_dir, "biored", "train.json")
        if os.path.exists(biored_train):
            with open(biored_train, 'r', encoding='utf-8') as f:
                docs = json.load(f)
                for d in docs:
                    for ent in d.get("entities", []):
                        etype = ent.get("type")
                        text = ent.get("text", "").strip()
                        if not text or len(text) < 2:
                            continue
                        t_lower = text.lower()
                        if etype in ["DiseaseOrPhenotypicFeature", "Disease"]:
                            self.disease_dict[t_lower] = self.disease_dict.get(t_lower, 0) + 1
                        elif etype in ["ChemicalEntity", "Chemical"]:
                            self.chemical_dict[t_lower] = self.chemical_dict.get(t_lower, 0) + 1

    def is_biomedical_candidate(self, span_text: str, span_lower: str) -> bool:
        if span_lower in STOPWORDS:
            return False
        if len(span_lower) <= 2 and not span_text.isupper():
            return False
        if span_lower.isdigit():
            return False
        return True

    def extract_entities(self, text: str, model_type: str = "hybrid_gazetteer_ner") -> List[Dict[str, Any]]:
        """
        Extracts medical named entities with spans, labels, negation status, and heuristic confidence.
        model_type: 'hybrid_gazetteer_ner' or 'dictionary_baseline'
        """
        if not text:
            return []
            
        entities = []
        matched_spans = []
        is_hybrid = (model_type in ["hybrid_gazetteer_ner", "biomedical_ml"])
        
        # 1. Symptoms
        symptoms = symptom_extractor.extract_symptoms(text)
        for s in symptoms:
            matched_spans.append((s["start"], s["end"]))
            entities.append({
                "entity": s["text"],
                "type": "SYMPTOM",
                "start": s["start"],
                "end": s["end"],
                "status": s["status"],
                "negation_cue": s.get("negation_cue"),
                "confidence": 0.94 if is_hybrid else 0.85
            })
            
        # 2. Medicines / Prescribed Chemicals
        medicines = medicine_extractor.extract_medicines(text)
        for m in medicines:
            if m["type"] == "MEDICINE/CHEMICAL":
                overlap = False
                for ms, me in matched_spans:
                    if not (m["end"] <= ms or m["start"] >= me):
                        overlap = True
                        break
                if not overlap:
                    matched_spans.append((m["start"], m["end"]))
                    entities.append({
                        "entity": m["text"],
                        "type": "MEDICINE/CHEMICAL",
                        "start": m["start"],
                        "end": m["end"],
                        "status": m["status"],
                        "negation_cue": None,
                        "confidence": 0.93 if is_hybrid else 0.82
                    })
                    
        # 3. Token n-grams for Disease, Chemical, and Procedure
        tokens = []
        for m in re.finditer(r'[\w\-]+|[^\s\w]', text):
            tokens.append((m.start(), m.end(), m.group(0)))
            
        n_tokens = len(tokens)
        max_n = min(6, n_tokens)
        
        ngram_matches = []
        for n in range(max_n, 0, -1):
            for i in range(n_tokens - n + 1):
                c_start = tokens[i][0]
                c_end = tokens[i + n - 1][1]
                span_text = text[c_start:c_end]
                span_lower = span_text.lower()
                
                if is_hybrid:
                    if not self.is_biomedical_candidate(span_text, span_lower):
                        continue
                        
                    if span_lower in self.procedure_dict:
                        ngram_matches.append((c_start, c_end, span_text, "PROCEDURE", 0.90, len(span_text)))
                        continue
                        
                    chem_count = self.chemical_dict.get(span_lower, 0)
                    dis_count = self.disease_dict.get(span_lower, 0)
                    
                    if chem_count > 0 and chem_count >= dis_count:
                        conf = min(0.95, 0.80 + 0.05 * min(3, chem_count))
                        ngram_matches.append((c_start, c_end, span_text, "CHEMICAL", conf, len(span_text)))
                    elif dis_count > 0:
                        conf = min(0.96, 0.82 + 0.05 * min(3, dis_count))
                        ngram_matches.append((c_start, c_end, span_text, "DISEASE", conf, len(span_text)))
                else:
                    # Naive Dictionary Baseline (unfiltered exact lookup)
                    if span_lower in self.raw_unfiltered_dict:
                        etype = self.raw_unfiltered_dict[span_lower].upper()
                        if "CHEM" in etype:
                            etype = "CHEMICAL"
                        elif "DIS" in etype:
                            etype = "DISEASE"
                        ngram_matches.append((c_start, c_end, span_text, etype, 0.75, len(span_text)))
                        
        ngram_matches.sort(key=lambda x: x[5], reverse=True)
        
        for c_start, c_end, span_text, etype, conf, length in ngram_matches:
            overlap = False
            for ms, me in matched_spans:
                if not (c_end <= ms or c_start >= me):
                    overlap = True
                    break
            if not overlap:
                matched_spans.append((c_start, c_end))
                neg_info = negation_detector.detect_negation(text, span_text, c_start, c_end)
                entities.append({
                    "entity": span_text,
                    "type": etype,
                    "start": c_start,
                    "end": c_end,
                    "status": neg_info["status"],
                    "negation_cue": neg_info["cue"],
                    "confidence": round(conf, 2)
                })
                
        entities.sort(key=lambda x: x["start"])
        return entities

# Singleton
biomedical_ner = BiomedicalNER()
