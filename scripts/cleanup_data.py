import json

path = 'src/data/vocabulary.json'
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Keep only the original Caderno 1 words (first 100 of each level)
# Which are exactly the 600 original words.
new_data = [w for w in data if not (w['translation'].startswith('[Viagem]') or 
                                    w['translation'].startswith('[Trabalho]') or 
                                    w['translation'].startswith('[Política e Economia]'))]

# Double check that we only have 600 words
if len(new_data) != 600:
    print(f"Warning: expected 600 words, got {len(new_data)}")
    new_data = new_data[:600]

with open(path, 'w', encoding='utf-8') as f:
    json.dump(new_data, f, ensure_ascii=False, indent=4)

print(f"Cleaned vocabulary.json. Remaining words: {len(new_data)}")
