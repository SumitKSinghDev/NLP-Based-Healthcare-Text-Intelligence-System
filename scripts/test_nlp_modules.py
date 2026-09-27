import sys, os
sys.path.insert(0, os.path.abspath('.'))

from backend.app.services.negation import negation_detector
from backend.app.services.symptom import symptom_extractor
from backend.app.services.ner import biomedical_ner
from backend.app.services.relation import relation_service

test_texts = [
    "The patient has fever, persistent cough and headache. No chest pain or shortness of breath. Paracetamol was prescribed.",
    "Patient denies chest pain and dizziness.",
    "No evidence of pneumonia. Patient reports mild cough.",
    "The patient does not report headache.",
    "Chest pain and shortness of breath are absent.",
    "Patient has no fever.",
    "Denies fever, but complains of shortness of breath.",
    "Patient without nausea or vomiting."
]

for t in test_texts:
    print("\n" + "="*70)
    print("TEXT:", t)
    ents = biomedical_ner.extract_entities(t)
    for e in ents:
        print(f"  -> Entity: {e['entity']:<20} | Type: {e['type']:<15} | Status: {e['status']:<10} | Cue: {e['negation_cue']}")

print("\n" + "="*70)
print("TESTING SYMPTOM-DISEASE ASSOCIATIONS:")
symptoms = symptom_extractor.extract_symptoms("The patient has fever, persistent cough and headache. No chest pain or shortness of breath.")
assocs = relation_service.get_associations(symptoms)
for a in assocs:
    print(f"  -> Symptom: {a['symptom_entity']:<25} | Status: {a['status']:<8} | Diseases: {a['associated_diseases']} (Score: {a['association_score']})")
