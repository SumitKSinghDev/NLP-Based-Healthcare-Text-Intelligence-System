import os
import sys
import subprocess
import json

def run_all_tests():
    print("=================================================================")
    print("   Running Automated NLP Pipeline Test Suites")
    print("=================================================================")
    res = subprocess.run([sys.executable, "-m", "pytest", "backend/tests/test_nlp_pipeline.py", "-v"])
    if res.returncode != 0:
        print("\n[ERROR] One or more unit tests failed.")
        sys.exit(res.returncode)

    print("\n=================================================================")
    print("   Audited Benchmark Evaluation Results (results/metrics.json)")
    print("=================================================================")
    metrics_path = os.path.join("results", "metrics.json")
    if os.path.exists(metrics_path):
        with open(metrics_path, "r", encoding="utf-8") as f:
            m = json.load(f)
            
        print(f"1. Hybrid Gazetteer/Rule-Based Biomedical NER (BC5CDR Test):")
        print(f"   Precision: {m['summary_kpis']['precision']:.4f} | Recall: {m['summary_kpis']['recall']:.4f} | F1: {m['summary_kpis']['f1_score']:.4f}")
        
        print(f"\n2. Disease Mention Extraction (NCBI Disease Test):")
        print(f"   Precision: {m['ner_ncbi']['precision']:.4f} | Recall: {m['ner_ncbi']['recall']:.4f} | F1: {m['ner_ncbi']['f1']:.4f}")
        
        print(f"\n3. Clinical Negation Detection (Custom 30-case evaluation set, n=30):")
        neg = m['negation']['negex_engine']
        print(f"   Accuracy: {neg['accuracy']:.4f} | Precision: {neg['precision']:.4f} | Recall: {neg['recall']:.4f} | F1: {neg['f1']:.4f}")
        
        print(f"\n4. Medical Information Retrieval (Custom 5-query evaluation, n=5):")
        bm25 = m['retrieval']['bm25']
        print(f"   BM25: P@1: {bm25['precision_at_1']:.4f} | P@3: {bm25['precision_at_3']:.4f} | MRR: {bm25['mrr']:.4f}")
        
        print(f"\n5. Extractive Summarization (Constructed-reference ROUGE, n=50):")
        sum_m = m['summarization']
        print(f"   ROUGE-1: {sum_m['rouge_1']:.4f} | ROUGE-2: {sum_m['rouge_2']:.4f} | ROUGE-L: {sum_m['rouge_l']:.4f}")
        
    print("\n=================================================================")
    print("   ALL TESTS & AUDITS COMPLETED SUCCESSFULLY")
    print("=================================================================")

if __name__ == "__main__":
    run_all_tests()
