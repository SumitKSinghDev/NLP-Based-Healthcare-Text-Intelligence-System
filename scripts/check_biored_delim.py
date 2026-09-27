import zipfile

with zipfile.ZipFile("data/raw/biored/BIORED.zip", 'r') as z:
    content = z.read("BioRED/Train.PubTator").decode('utf-8', errors='ignore')
    lines = content.split('\n')
    t_lines = [l for l in lines if '|t|' in l]
    print(f"BioRED Train lines: {len(lines)}, Title lines found (|t|): {len(t_lines)}")
    # check line separators between documents
    for i in range(len(lines)):
        if '|t|' in lines[i]:
            print(f"Line {i-1}: {repr(lines[i-1])}, Line {i}: {lines[i][:50]}")
            if i > 50:
                break
