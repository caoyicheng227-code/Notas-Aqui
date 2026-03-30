import pdfplumber
import json
import os

def extract_text(pdf_path):
    text = ""
    if not os.path.exists(pdf_path):
        return ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted: text += extracted + "\n"
    except Exception as e: pass
    return text

c1_ans = extract_text("public/simulado/C1/CAPLE_C1_Answer.pdf")

with open("c1_raw_ans.txt", "w", encoding='utf-8') as f:
    f.write(c1_ans)

print("Extraction complete.")
