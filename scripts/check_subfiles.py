import os
import zipfile

with zipfile.ZipFile("data/raw/bc5cdr/CDR_Data.zip", 'r') as z:
    for f in z.namelist():
        if "Corpus" in f and not f.endswith('/'):
            print(f"BC5CDR: {f} ({z.getinfo(f).file_size} bytes)")

with zipfile.ZipFile("data/raw/biored/BIORED.zip", 'r') as z:
    for f in z.namelist():
        if not f.endswith('/'):
            print(f"BioRED: {f} ({z.getinfo(f).file_size} bytes)")
