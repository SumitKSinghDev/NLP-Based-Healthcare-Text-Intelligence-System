import zipfile

with zipfile.ZipFile("data/raw/biored/BIORED.zip", 'r') as z:
    content = z.read("BioRED/Train.PubTator").decode('utf-8', errors='ignore')
    lines = content.strip().split('\n')
    print("BioRED lines with tab count > 3 or relation words:")
    for line in lines[30:60]:
        print(line)
