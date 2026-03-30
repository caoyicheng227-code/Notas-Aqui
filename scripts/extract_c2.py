import pdfplumber
import os

def extract_text(pdf_path):
    text = ""
    if not os.path.exists(pdf_path):
        return ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages):
                extracted = page.extract_text()
                if extracted:
                    text += f"\n--- Page {i+1} ---\n" + extracted
    except Exception as e:
        print(f"Error {e}")
    return text

c2_reading = extract_text("public/simulado/C2/CAPLE_C2_Reading.pdf")
c2_quest = extract_text("public/simulado/C2/CAPLE_C2_Question.pdf")
c2_ans = extract_text("public/simulado/C2/CAPLE_C2_Answer.pdf")

with open("c2_raw_reading.txt", "w", encoding='utf-8') as f:
    f.write(c2_reading)
with open("c2_raw_quest.txt", "w", encoding='utf-8') as f:
    f.write(c2_quest)
with open("c2_raw_ans.txt", "w", encoding='utf-8') as f:
    f.write(c2_ans)

print("C2 Extraction complete.")
