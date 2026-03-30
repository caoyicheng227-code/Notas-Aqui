import pdfplumber
import json
import os

def extract_text(pdf_path):
    text = ""
    if not os.path.exists(pdf_path):
        print(f"File not found: {pdf_path}")
        return ""
        
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages):
                extracted = page.extract_text()
                if extracted:
                    text += f"\n--- Page {i+1} ---\n" + extracted
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
    return text

c1_reading = extract_text("public/simulado/C1/CAPLE_C1_Reading.pdf")
c1_quest = extract_text("public/simulado/C1/CAPLE_C1_Question.pdf")

with open("c1_raw_reading.txt", "w", encoding='utf-8') as f:
    f.write(c1_reading)
with open("c1_raw_quest.txt", "w", encoding='utf-8') as f:
    f.write(c1_quest)

print("Extraction complete.")
