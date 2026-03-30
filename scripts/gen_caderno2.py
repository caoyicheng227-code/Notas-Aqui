import json

domains = {
    'A1': 'Viagem',
    'A2': 'Viagem',
    'B1': 'Trabalho',
    'B2': 'Trabalho',
    'C1': 'Política e Economia',
    'C2': 'Política e Economia'
}

path = 'src/data/vocabulary.json'
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_data = list(data)
max_id = max(w['id'] for w in data)

levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
for lvl in levels:
    basico_words = [w for w in data if w['cefr_level'] == lvl][:100]
    domain_name = domains[lvl]
    
    for word in basico_words:
        max_id += 1
        new_word = word.copy()
        new_word['id'] = max_id
        new_word['translation'] = f"[{domain_name}] {word['translation']}"
        new_data.append(new_word)

with open(path, 'w', encoding='utf-8') as f:
    json.dump(new_data, f, ensure_ascii=False, indent=4)

print(f"Generated Caderno 2 words. Total words: {len(new_data)}")
