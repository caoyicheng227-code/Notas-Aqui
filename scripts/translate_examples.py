import json
import os
import time
from deep_translator import GoogleTranslator

# Rate limit workaround by sleeping if necessary
def translate_text(text):
    if not text:
        return ""
    try:
        translated = GoogleTranslator(source='pt', target='zh-CN').translate(text)
        return translated
    except Exception as e:
        print(f"Error translating: {text} -> {e}")
        time.sleep(1)
        try:
            return GoogleTranslator(source='pt', target='zh-CN').translate(text)
        except:
            return "翻译错误"

levels = ["a1", "a2", "b1", "b2", "c1", "c2"]

for lvl in levels:
    filepath = f"/Users/caoyicheng/.gemini/antigravity/playground/velvet-equinox/scripts/data_{lvl}_c3.json"
    print(f"Translating {lvl}...")
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        for i, word in enumerate(data):
            for example in word.get("examples", []):
                pt_text = example.get("pt", "")
                if pt_text:
                    cn_text = translate_text(pt_text)
                    example["cn"] = cn_text
            
            if i % 10 == 0:
                print(f"  Translated {i}/100 of {lvl}")
                
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"Finished {lvl}")
    except Exception as e:
        print(f"Failed to process {lvl}: {e}")
