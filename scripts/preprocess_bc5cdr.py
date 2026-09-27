import os
import zipfile
import json
import re
from collections import defaultdict

def split_sentences(text):
    # Regex sentence splitter preserving positions
    sentences = []
    # Split by standard sentence delimiters (. ! ?) followed by space and uppercase or end
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

def parse_bc5cdr_pubtator_content(content):
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
        relations = []
        
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
                if len(cols) == 6:
                    # Entity line: pmid, start, end, text, type, mesh
                    entities.append({
                        "pmid": cols[0],
                        "start": int(cols[1]),
                        "end": int(cols[2]),
                        "text": cols[3],
                        "type": cols[4], # Chemical or Disease
                        "mesh_id": cols[5]
                    })
                elif len(cols) == 4 and cols[1] == 'CID':
                    # Relation line: pmid, CID, chem_mesh, disease_mesh
                    relations.append({
                        "pmid": cols[0],
                        "type": "Chemical-Induced-Disease",
                        "chemical_mesh": cols[2],
                        "disease_mesh": cols[3]
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
                "relations": relations
            })
            
    return documents

def process_bc5cdr(zip_path="data/raw/bc5cdr/CDR_Data.zip", output_dir="data/processed/bc5cdr"):
    os.makedirs(output_dir, exist_ok=True)
    stats = {}
    
    file_mapping = {
        "train": "CDR_Data/CDR.Corpus.v010516/CDR_TrainingSet.PubTator.txt",
        "dev": "CDR_Data/CDR.Corpus.v010516/CDR_DevelopmentSet.PubTator.txt",
        "test": "CDR_Data/CDR.Corpus.v010516/CDR_TestSet.PubTator.txt"
    }
    
    with zipfile.ZipFile(zip_path, 'r') as z:
        for split_name, inner_file in file_mapping.items():
            content = z.read(inner_file).decode('utf-8', errors='ignore')
            docs = parse_bc5cdr_pubtator_content(content)
            
            # Compute statistics
            num_docs = len(docs)
            num_sentences = sum(len(d["sentences"]) for d in docs)
            num_entities = sum(len(d["entities"]) for d in docs)
            num_relations = sum(len(d["relations"]) for d in docs)
            
            entity_types = defaultdict(int)
            for d in docs:
                for e in d["entities"]:
                    entity_types[e["type"]] += 1
                    
            out_file = os.path.join(output_dir, f"{split_name}.json")
            with open(out_file, 'w', encoding='utf-8') as f:
                json.dump(docs, f, indent=2)
                
            stats[split_name] = {
                "num_documents": num_docs,
                "num_sentences": num_sentences,
                "num_entities": num_entities,
                "entity_types": dict(entity_types),
                "num_relations": num_relations,
                "example_entity": docs[0]["entities"][0] if docs and docs[0]["entities"] else None,
                "example_relation": docs[0]["relations"][0] if docs and docs[0]["relations"] else None
            }
            print(f"[BC5CDR {split_name}] Docs: {num_docs}, Sents: {num_sentences}, Entities: {num_entities}, Relations: {num_relations}")
            
    stats_file = os.path.join(output_dir, "stats.json")
    with open(stats_file, 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2)
        
    return stats

if __name__ == "__main__":
    process_bc5cdr()
