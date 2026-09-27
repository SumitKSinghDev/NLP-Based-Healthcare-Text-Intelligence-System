import os
import sys
import subprocess

def run_full_rebuild():
    print("=================================================================")
    print("   Full Healthcare NLP System Rebuild (Group 6 Case Study)")
    print("=================================================================")
    
    # 1. Preprocess Datasets
    print("\n[Step 1/5] Preprocessing raw benchmark datasets (BC5CDR, NCBI, BioRED)...")
    subprocess.check_call([sys.executable, "scripts/preprocess_all.py"])
    
    # 2. Build Unified Corpus, Associations & Search Indexes
    print("\n[Step 2/5] Building unified PubMed corpus, associations & BM25/LSA indexes...")
    subprocess.check_call([sys.executable, "scripts/build_corpus.py"])
    
    # 3. Run Benchmark Evaluations
    print("\n[Step 3/5] Running audited benchmark evaluations across test partitions...")
    subprocess.check_call([sys.executable, "scripts/evaluate.py"])
    
    # 4. Build Frontend Bundle
    print("\n[Step 4/5] Building React + TypeScript + Tailwind frontend bundle...")
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    subprocess.check_call([npm_cmd, "run", "build"], cwd="frontend")
    
    # 5. Run Automated Tests
    print("\n[Step 5/5] Running automated verification test suites...")
    subprocess.check_call([sys.executable, "-m", "pytest", "backend/tests/test_nlp_pipeline.py", "-v"])
    
    print("\n=================================================================")
    print("   REBUILD COMPLETE: All datasets, indexes, models, and UI ready.")
    print("   Run 'python run_app.py' or 'run_app.bat' to start the system.")
    print("=================================================================")

if __name__ == "__main__":
    run_full_rebuild()
