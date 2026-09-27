import os
import json
from typing import List, Dict, Any

class SymptomDiseaseAssociation:
    def __init__(self, associations_path: str = "data/processed/corpus/symptom_disease_associations.json"):
        self.associations_path = associations_path
        self.associations = {}
        self.load_associations()
        
    def load_associations(self):
        if os.path.exists(self.associations_path):
            with open(self.associations_path, 'r', encoding='utf-8') as f:
                self.associations = json.load(f)
                
    def get_associations(self, symptoms: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Takes extracted symptoms and returns literature-derived co-occurrence/PMI associations.
        Values are labeled as Association Score (not clinical diagnostic probabilities).
        """
        # Ensure latest associations are loaded
        if not self.associations and os.path.exists(self.associations_path):
            self.load_associations()
            
        results = []
        for sym in symptoms:
            sym_text = sym.get("text", "").lower().strip()
            sym_status = sym.get("status", "PRESENT")
            canonical = sym.get("canonical_name", sym_text.title())
            canon_lower = canonical.lower()
            
            matched_assocs = self.associations.get(sym_text, [])
            if not matched_assocs:
                matched_assocs = self.associations.get(canon_lower, [])
            if not matched_assocs:
                for k, v in self.associations.items():
                    if k in sym_text or sym_text in k or k in canon_lower or canon_lower in k:
                        matched_assocs = v
                        break
                        
            if matched_assocs:
                top_diseases = [a["disease"] for a in matched_assocs[:3]]
                avg_score = round(sum(a.get("confidence", 0.75) for a in matched_assocs[:3]) / len(matched_assocs[:3]), 2)
                disease_str = ", ".join(top_diseases)
                label = f"{canonical} (negated)" if sym_status == "NEGATED" else canonical
                
                results.append({
                    "symptom_entity": label,
                    "status": sym_status,
                    "associated_diseases": disease_str,
                    "top_predictions": top_diseases,
                    "association_score": avg_score,
                    "confidence": avg_score,
                    "evidence_count": sum(a.get("cooccurrence_count", 1) for a in matched_assocs[:3]),
                    "disclaimer": "NLP-derived association based on corpus statistics; not a diagnosis."
                })
            else:
                label = f"{canonical} (negated)" if sym_status == "NEGATED" else canonical
                results.append({
                    "symptom_entity": label,
                    "status": sym_status,
                    "associated_diseases": "Biomedical finding (literature co-occurrence < threshold)",
                    "top_predictions": ["Non-specific Clinical Finding"],
                    "association_score": 0.50,
                    "confidence": 0.50,
                    "evidence_count": 0,
                    "disclaimer": "NLP-derived association based on corpus statistics; not a diagnosis."
                })
                
        return results

    def lookup_symptom(self, symptom_query: str) -> List[Dict[str, Any]]:
        """Direct lookup for exploring any symptom association in the literature corpus."""
        if not self.associations:
            self.load_associations()
        q = symptom_query.lower().strip()
        matched = self.associations.get(q, [])
        if not matched:
            for k, v in self.associations.items():
                if k in q or q in k:
                    matched = v
                    break
        return matched

# Singleton
relation_service = SymptomDiseaseAssociation()
