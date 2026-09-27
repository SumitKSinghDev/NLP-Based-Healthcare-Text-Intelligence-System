import os
import sys
import json
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app.services.similarity import similarity_service
from backend.app.services.retrieval import retrieval_service

def main():
    print("=================================================================")
    print("      BUILDING BIOMEDICAL RETRIEVAL & SIMILARITY INDICES         ")
    print("=================================================================")
    
    start_time = time.time()
    
    print("[1/2] Initializing BM25 and TF-IDF Search Indices...")
    retrieval_service.initialize_index()
    print(f"       -> Indexed {len(retrieval_service.corpus_docs)} documents.")
    
    print("[2/2] Initializing Dense SVD Semantic Embeddings & Similarity Matrix...")
    similarity_service.initialize_models()
    print(f"       -> Embedded {len(similarity_service.corpus_docs)} documents.")
    
    elapsed = round(time.time() - start_time, 2)
    print("=================================================================")
    print(f"SUCCESS: Search indices ready in {elapsed} seconds.")
    print("=================================================================")

if __name__ == "__main__":
    main()
