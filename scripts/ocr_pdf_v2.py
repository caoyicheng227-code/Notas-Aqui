import sys
import fitz
from ocrmac import ocrmac
from PIL import Image
import io

def ocr_pdf(filepath):
    print(f"--- OCR for {filepath} ---")
    try:
        doc = fitz.open(filepath)
        for page_num in range(len(doc)):
            page = doc[page_num]
            pix = page.get_pixmap(dpi=150)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            
            # Save to tmp
            tmp_path = f"/tmp/ocr_page_{page_num}.png"
            img.save(tmp_path)
            
            print(f"\\n--- PAGE {page_num + 1} ---")
            annotations = ocrmac.OCR(tmp_path).recognize()
            
            if annotations:
                # annotations is a list of tuples: (text, confidence, bbox)
                # Sort by Y descending, then X ascending (bbox is [x, y, w, h])
                # Note: vision framework might return y from bottom-left
                sorted_ann = sorted(annotations, key=lambda x: (-x[2][1], x[2][0]))
                for text, conf, bbox in sorted_ann:
                    print(text)
            else:
                print("No text recognized.")
    except Exception as e:
        print("ERROR:", e)

if __name__ == "__main__":
    for f in sys.argv[1:]:
        ocr_pdf(f)
