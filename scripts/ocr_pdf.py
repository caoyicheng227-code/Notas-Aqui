import sys
from ocrmac import ocrmac

def ocr_pdf(filepath):
    print(f"--- OCR for {filepath} ---")
    try:
        annotations = ocrmac.OCR(filepath).recognize()
        if annotations:
            for text, confidence, bbox in annotations:
                print(text)
        else:
            print("No text recognized.")
    except Exception as e:
        print("ERROR:", e)

if __name__ == "__main__":
    for f in sys.argv[1:]:
        ocr_pdf(f)
