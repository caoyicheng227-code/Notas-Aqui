import json
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from deep_translator import GoogleTranslator

# Rate limit workaround by sleeping if necessary
def translate_example(example):
    pt_text = example.get("pt", "")
    if not pt_text:
        return example
    try:
        translated = GoogleTranslator(source='pt', target='zh-CN').translate(pt_text)
        example["cn"] = translated
    except Exception as e:
        time.sleep(1)
        try:
            example["cn"] = GoogleTranslator(source='pt', target='zh-CN').translate(pt_text)
        except:
            example["cn"] = "翻译错误"
    return example

levels = ["a1", "a2", "b1", "b2", "c1", "c2"]

for lvl in levels:
    filepath = f"/Users/caoyicheng/.gemini/antigravity/playground/velvet-equinox/scripts/data_{lvl}_c3.json"
    print(f"Translating {lvl}...")
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        examples_to_translate = []
        # Flatten all examples to pass to thread pool
        for word in data:
            for example in word.get("examples", []):
                examples_to_translate.append(example)
                
        # Use ThreadPoolExecutor for concurrent requests
        with ThreadPoolExecutor(max_workers=10) as executor:
            list(executor.map(translate_example, examples_to_translate))
            
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"Finished {lvl}")
    except Exception as e:
        print(f"Failed to process {lvl}: {e}")
