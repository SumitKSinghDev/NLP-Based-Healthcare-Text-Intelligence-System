import os
import zipfile
import json
from collections import defaultdict

def inspect_zip_contents(zip_path):
    print(f"\n==========================================")
    print(f"Inspecting: {zip_path}")
    print(f"==========================================")
    if not os.path.exists(zip_path):
        print(f"File not found: {zip_path}")
        return {}
    
    with zipfile.ZipFile(zip_path, 'r') as z:
        file_list = z.namelist()
        print(f"Total files in zip: {len(file_list)}")
        sample_files = file_list[:15]
        for f in sample_files:
            info = z.getinfo(f)
            print(f"  - {f} ({info.file_size} bytes)")
        if len(file_list) > 15:
            print(f"  ... and {len(file_list) - 15} more files")
        
        # Read small sample text from first text/txt/tsv/xml file found
        sample_text = ""
        for f in file_list:
            if not f.endswith('/') and any(f.endswith(ext) for ext in ['.txt', '.tsv', '.pubtator', '.json', '.xml', '.conll']):
                with z.open(f) as fp:
                    content = fp.read(2048).decode('utf-8', errors='ignore')
                    print(f"\n--- Preview of {f} (first 1000 chars) ---")
                    print(content[:1000])
                    sample_text = content[:1000]
                    break
        return {"files": file_list, "preview": sample_text}

def main():
    paths = {
        "BC5CDR": "data/raw/bc5cdr/CDR_Data.zip",
        "NCBI_Train": "data/raw/ncbi_disease/NCBItrainset_corpus.zip",
        "NCBI_Dev": "data/raw/ncbi_disease/NCBIdevelopset_corpus.zip",
        "NCBI_Test": "data/raw/ncbi_disease/NCBItestset_corpus.zip",
        "BioRED": "data/raw/biored/BIORED.zip",
    }
    
    results = {}
    for name, path in paths.items():
        results[name] = inspect_zip_contents(path)

if __name__ == "__main__":
    main()
