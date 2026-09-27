import os
import json
import time
from preprocess_bc5cdr import process_bc5cdr
from preprocess_ncbi import process_ncbi
from preprocess_biored import process_biored
from build_corpus import build_corpus

def main():
    print("=================================================================")
    print("      HEALTHCARE NLP INTELLIGENCE SYSTEM - DATA PIPELINE         ")
    print("=================================================================")
    
    os.makedirs("results", exist_ok=True)
    os.makedirs("data/processed", exist_ok=True)
    
    start_time = time.time()
    
    print("\n[Step 1/4] Processing BC5CDR (BioCreative V Chemical-Disease Relations)...")
    bc5cdr_stats = process_bc5cdr()
    
    print("\n[Step 2/4] Processing NCBI Disease Corpus...")
    ncbi_stats = process_ncbi()
    
    print("\n[Step 3/4] Processing BioRED (Biomedical Relation Extraction Dataset)...")
    biored_stats = process_biored()
    
    print("\n[Step 4/4] Building Unified Biomedical Information Retrieval Corpus...")
    corpus_stats = build_corpus()
    
    # Compile comprehensive dataset statistics
    combined_stats = {
        "metadata": {
            "title": "NLP-Based Healthcare Text Intelligence System",
            "group": "Group 6",
            "datasets_processed": ["BC5CDR", "NCBI Disease", "BioRED"],
            "corpus_total_documents": corpus_stats["total_docs"],
            "generated_at": time.strftime("%Y-%m-%d %H:%M:%S")
        },
        "bc5cdr": {
            "description": "BioCreative V Chemical Disease Relation Dataset",
            "splits": bc5cdr_stats,
            "total_documents": sum(s["num_documents"] for s in bc5cdr_stats.values()),
            "total_sentences": sum(s["num_sentences"] for s in bc5cdr_stats.values()),
            "total_entities": sum(s["num_entities"] for s in bc5cdr_stats.values()),
            "total_relations": sum(s["num_relations"] for s in bc5cdr_stats.values())
        },
        "ncbi_disease": {
            "description": "NCBI Disease Corpus with SpecificDisease, DiseaseClass, Modifier, and Composite mentions",
            "splits": ncbi_stats,
            "total_documents": sum(s["num_documents"] for s in ncbi_stats.values()),
            "total_sentences": sum(s["num_sentences"] for s in ncbi_stats.values()),
            "total_entities": sum(s["num_entities"] for s in ncbi_stats.values()),
            "total_relations": 0
        },
        "biored": {
            "description": "BioRED Multi-entity and Multi-relation Biomedical Dataset",
            "splits": biored_stats,
            "total_documents": sum(s["num_documents"] for s in biored_stats.values()),
            "total_sentences": sum(s["num_sentences"] for s in biored_stats.values()),
            "total_entities": sum(s["num_entities"] for s in biored_stats.values()),
            "total_relations": sum(s["num_relations"] for s in biored_stats.values())
        }
    }
    
    stats_out_path = "results/dataset_statistics.json"
    with open(stats_out_path, 'w', encoding='utf-8') as f:
        json.dump(combined_stats, f, indent=2)
        
    elapsed = round(time.time() - start_time, 2)
    print("\n=================================================================")
    print(f"SUCCESS: Preprocessing complete in {elapsed} seconds.")
    print(f"Dataset statistics saved to: {stats_out_path}")
    print("=================================================================")
    
    # Print clean terminal report table
    print("\nDATASET SUMMARY TABLE:")
    print("-" * 75)
    print(f"{'Dataset':<15} | {'Train Docs':<10} | {'Dev Docs':<10} | {'Test Docs':<10} | {'Total Entities':<14} | {'Relations':<10}")
    print("-" * 75)
    print(f"{'BC5CDR':<15} | {bc5cdr_stats['train']['num_documents']:<10} | {bc5cdr_stats['dev']['num_documents']:<10} | {bc5cdr_stats['test']['num_documents']:<10} | {combined_stats['bc5cdr']['total_entities']:<14} | {combined_stats['bc5cdr']['total_relations']:<10}")
    print(f"{'NCBI Disease':<15} | {ncbi_stats['train']['num_documents']:<10} | {ncbi_stats['dev']['num_documents']:<10} | {ncbi_stats['test']['num_documents']:<10} | {combined_stats['ncbi_disease']['total_entities']:<14} | {'N/A':<10}")
    print(f"{'BioRED':<15} | {biored_stats['train']['num_documents']:<10} | {biored_stats['dev']['num_documents']:<10} | {biored_stats['test']['num_documents']:<10} | {combined_stats['biored']['total_entities']:<14} | {combined_stats['biored']['total_relations']:<10}")
    print("-" * 75)
    print(f"{'Total Corpus':<15} | {corpus_stats['total_docs']} unique PubMed clinical/biomedical abstracts indexed.")
    print("-" * 75)

if __name__ == "__main__":
    main()
