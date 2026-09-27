import os
import zipfile
import json
import re
from collections import defaultdict

def split_sentences(text):
    sentences = []
    pattern = re.compile(r'([A-Z0-9][^.!?]*[.!?]+(?:\s+|$)|[^.!?]+$)')
    for m in pattern.finditer(text):
        sent = m.group(0).strip()
        if sent:
            sentences.append({
                "text": sent,
                "start": m.start(),
                "end": m.end()
            })
    if not sentences and text.strip():
        sentences.append({"text": text.strip(), "start": 0, "end": len(text)})
    return sentences

def parse_ncbi_pubtator_content(content):
    documents = []
    blocks = content.strip().split('\n\n')
    
    for block in blocks:
        lines = [line.strip() for line in block.split('\n') if line.strip()]
        if not lines:
            continue
        
        pmid = None
        title = ""
        abstract = ""
        entities = []
        
        for line in lines:
            if '|t|' in line:
                parts = line.split('|t|', 1)
                pmid = parts[0]
                title = parts[1]
            elif '|a|' in line:
                parts = line.split('|a|', 1)
                if not pmid:
                    pmid = parts[0]
                abstract = parts[1]
            elif '\t' in line:
                cols = line.split('\t')
                if len(cols) >= 6:
                    # NCBI: pmid, start, end, text, disease_category, mesh_or_omim_id
                    # Standardize entity type as Disease
                    category = cols[4] # SpecificDisease, DiseaseClass, Modifier, CompositeMention
                    entities.append({
                        "pmid": cols[0],
                        "start": int(cols[1]),
                        "end": int(cols[2]),
                        "text": cols[3],
                        "type": "Disease",
                        "ncbi_category": category,
                        "mesh_id": cols[5]
                    })
        
        full_text = f"{title} {abstract}".strip() if abstract else title
        sentences = split_sentences(full_text)
        
        if pmid:
            documents.append({
                "pmid": pmid,
                "title": title,
                "abstract": abstract,
                "full_text": full_text,
                "sentences": sentences,
                "entities": entities,
                "relations": []
            })
            
    return documents

def process_ncbi(raw_dir="data/raw/ncbi_disease", output_dir="data/processed/ncbi_disease"):
    os.makedirs(output_dir, exist_ok=True)
    stats = {}
    
    file_mapping = {
        "train": ("NCBItrainset_corpus.zip", "NCBItrainset_corpus.txt"),
        "dev": ("NCBIdevelopset_corpus.zip", "NCBIdevelopset_corpus.txt"),
        "test": ("NCBItestset_corpus.zip", "NCBItestset_corpus.txt")
    }
    
    for split_name, (zip_name, inner_file) in file_mapping.items():
        zip_path = os.path.join(raw_dir, zip_name)
        with zipfile.ZipFile(zip_path, 'r') as z:
            content = z.read(inner_file).decode('utf-8', errors='ignore')
            docs = parse_ncbi_pubtator_content(content)
            
            num_docs = len(docs)
            num_sentences = sum(len(d["sentences"]) for d in docs)
            num_entities = sum(len(d["entities"]) for d in docs)
            
            entity_categories = defaultdict(int)
            for d in docs:
                for e in d["entities"]:
                    entity_categories[e["ncbi_category"]] += 1
                    
            out_file = os.path.join(output_dir, f"{split_name}.json")
            with open(out_file, 'w', encoding='utf-8') as f:
                json.dump(docs, f, indent=2)
                
            stats[split_name] = {
                "num_documents": num_docs,
                "num_sentences": num_sentences,
                "num_entities": num_entities,
                "entity_types": {"Disease": num_entities},
                "ncbi_categories": dict(entity_categories),
                "num_relations": 0,
                "example_entity": docs[0]["entities"][0] if docs and docs[0]["entities"] else None
            }
            print(f"[NCBI Disease {split_name}] Docs: {num_docs}, Sents: {num_sentences}, Entities: {num_entities}")
            
    stats_file = os.path.join(output_dir, "stats.json")
    with open(stats_file, 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2)
        
    return stats

if __name__ == "__main__":
    process_ncbi()
