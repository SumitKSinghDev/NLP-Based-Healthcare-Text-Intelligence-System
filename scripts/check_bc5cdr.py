import zipfile

with zipfile.ZipFile("data/raw/bc5cdr/CDR_Data.zip", 'r') as z:
    content = z.read("CDR_Data/CDR.Corpus.v010516/CDR_TrainingSet.PubTator.txt").decode('utf-8', errors='ignore')
    lines = content.strip().split('\n')
    print("BC5CDR lines 1 to 25:")
    for line in lines[:25]:
        print(line)
