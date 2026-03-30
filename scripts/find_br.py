import json
import collections

filepath = '/Users/caoyicheng/.gemini/antigravity/playground/velvet-equinox/src/data/vocabulary.json'
with open(filepath, 'r', encoding='utf-8') as f:
    vocab = json.load(f)

# Group by translation
grouped = collections.defaultdict(list)
for item in vocab:
    t = item.get('translation', '').strip()
    if t:
        # ignore domain prefixes like [Viagem], [Ciência] effectively making them the same meaning
        clean_t = t.split('] ')[-1] if '] ' in t else t
        grouped[clean_t].append(item)

duplicates = {k: v for k, v in grouped.items() if len(v) > 1}

print(f"Found {len(duplicates)} semantics that have multiple words.")

# Known PT-BR -> PT-PT replacements
# If a semantic group has a PT-BR word and a PT-PT word, we flag it.
BR_WORDS = ["ônibus", "trem", "celular", "tela", "esporte", "time", "banheiro", "geladeira", "suco", "xícara", "café da manhã", "legal", "valeu"]

to_remove_ids = []

for trans, items in duplicates.items():
    words = [i['word'].lower() for i in items]
    print(f"Semantic: {trans}")
    print(f"Words: {words}")

# Alternatively, find BR words that don't have duplicates and replace them.
br_singles = [item for item in vocab if item['word'].lower() in BR_WORDS and item['id'] not in to_remove_ids]
for item in br_singles:
    print(f"Standalone PT-BR word found: {item['word']} (ID: {item['id']}) - meaning: {item['translation']}")

