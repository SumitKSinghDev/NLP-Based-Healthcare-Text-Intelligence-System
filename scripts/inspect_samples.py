import zipfile
import json

def inspect_pubtator_sample(zip_path, filename):
    print(f"\n================ Sample from {zip_path} / {filename} ================")
    with zipfile.ZipFile(zip_path, 'r') as z:
        content = z.read(filename).decode('utf-8', errors='ignore')
        lines = content.strip().split('\n')
        print(f"Total lines: {len(lines)}")
        for i, line in enumerate(lines[:30]):
            print(f"{i+1}: {line}")

inspect_pubtator_sample("data/raw/bc5cdr/CDR_Data.zip", "CDR_Data/CDR.Corpus.v010516/CDR_TrainingSet.PubTator.txt")
inspect_pubtator_sample("data/raw/ncbi_disease/NCBItrainset_corpus.zip", "NCBItrainset_corpus.txt")
inspect_pubtator_sample("data/raw/biored/BIORED.zip", "BioRED/Train.PubTator")
