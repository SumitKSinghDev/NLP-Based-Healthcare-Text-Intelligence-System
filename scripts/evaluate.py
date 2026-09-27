import os
import sys
import json
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app.services.evaluation import evaluation_engine

def main():
    print("=================================================================")
    print("      HEALTHCARE TEXT INTELLIGENCE SYSTEM - EVALUATION AUDIT     ")
    print("=================================================================")
    print("Running evaluation suite across NLP modules...")
    
    start_time = time.time()
    metrics = evaluation_engine.run_all_evaluations()
    elapsed = round(time.time() - start_time, 2)
    
    print("\n" + "="*70)
    print("                   EVALUATION RESULTS SUMMARY                    ")
    print("="*70)
    
    print("\n1. BC5CDR TEST SET NER PERFORMANCE (Held-out Test Split: 500 docs, 9,752 entities):")
    print("-" * 75)
    print(f"{'Model / Category':<35} | {'Precision':<10} | {'Recall':<10} | {'F1 Score':<10}")
    print("-" * 75)
    for cat, vals in metrics["ner_bc5cdr"]["hybrid_gazetteer_ner"].items():
        print(f"Hybrid Gazetteer/Rule NER ({cat:<8}) | {vals['precision']:<10.4f} | {vals['recall']:<10.4f} | {vals['f1']:<10.4f}")
    print("-" * 75)
    for cat, vals in metrics["ner_bc5cdr"]["dictionary_baseline"].items():
        print(f"Dictionary Baseline ({cat:<8})      | {vals['precision']:<10.4f} | {vals['recall']:<10.4f} | {vals['f1']:<10.4f}")
        
    print("\n2. NCBI DISEASE TEST SET EVALUATION (Disease mention extraction evaluation: 100 docs):")
    print("-" * 75)
    ncbi = metrics["ner_ncbi"]
    print(f"NCBI Disease (Disease Mentions)      | {ncbi['precision']:<10.4f} | {ncbi['recall']:<10.4f} | {ncbi['f1']:<10.4f}")
    
    print("\n3. CLINICAL NEGATION DETECTION (Custom 30-case negation evaluation set, n = 30):")
    print("-" * 75)
    negex = metrics["negation"]["negex_engine"]
    kw = metrics["negation"]["keyword_baseline"]
    print(f"{'Method':<35} | {'Accuracy':<10} | {'Precision':<10} | {'Recall':<10} | {'F1 Score':<10}")
    print("-" * 75)
    print(f"NegEx Clinical Engine (n=30)        | {negex['accuracy']:<10.4f} | {negex['precision']:<10.4f} | {negex['recall']:<10.4f} | {negex['f1']:<10.4f}")
    print(f"Simple Keyword Baseline (n=30)      | {kw['accuracy']:<10.4f} | {kw['precision']:<10.4f} | {kw['recall']:<10.4f} | {kw['f1']:<10.4f}")
    
    print("\n4. MEDICAL INFORMATION RETRIEVAL (Custom 5-query retrieval evaluation, n = 5 queries):")
    print("-" * 75)
    bm25 = metrics["retrieval"]["bm25"]
    tfidf = metrics["retrieval"]["tfidf"]
    print(f"{'Method':<25} | {'P@1':<10} | {'P@3':<10} | {'P@5':<10} | {'MRR':<10}")
    print("-" * 75)
    print(f"BM25 Search (n=5)         | {bm25['precision_at_1']:<10.4f} | {bm25['precision_at_3']:<10.4f} | {bm25['precision_at_5']:<10.4f} | {bm25['mrr']:<10.4f}")
    print(f"TF-IDF Search (n=5)       | {tfidf['precision_at_1']:<10.4f} | {tfidf['precision_at_3']:<10.4f} | {tfidf['precision_at_5']:<10.4f} | {tfidf['mrr']:<10.4f}")
    
    print("\n5. EXTRACTIVE SUMMARIZATION (Constructed-reference ROUGE evaluation, n = 50 samples):")
    print("   *Note: Gold reference constructed as title + first abstract sentence (not human-written clinical summary).")
    print("-" * 75)
    rouge = metrics["summarization"]
    print(f"ROUGE-1: {rouge['rouge_1']:.4f}  |  ROUGE-2: {rouge['rouge_2']:.4f}  |  ROUGE-L: {rouge['rouge_l']:.4f}")
    
    print("\n6. RELATION EXTRACTION:")
    print("-" * 75)
    print(f"Status: {metrics['relation_extraction']['status']}")
    
    print("\n" + "="*70)
    print(f"Evaluation completed in {elapsed}s. Saved to results/metrics.json, ner_results.csv, retrieval_results.csv")
    print("="*70)

if __name__ == "__main__":
    main()
