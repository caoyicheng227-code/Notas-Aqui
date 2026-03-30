import json
import os

BASE_DIR = "/Users/caoyicheng/.gemini/antigravity/playground/velvet-equinox/src/data"
SCRIPTS_DIR = "/Users/caoyicheng/.gemini/antigravity/playground/velvet-equinox/scripts"

with open(os.path.join(BASE_DIR, "vocabulary.json"), "r", encoding="utf-8") as f:
    vocab = json.load(f)

# Re-group by CEFR level
levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
vocab_by_level = {lvl: [] for lvl in levels}
for w in vocab:
    vocab_by_level[w['cefr_level']].append(w)

new_vocab = []

for lvl in levels:
    # Get the original 100 words (Caderno 1 Básico)
    original_words = vocab_by_level[lvl]
    
    # Load Caderno 2 words for this level
    try:
        with open(os.path.join(SCRIPTS_DIR, f"data_{lvl.lower()}.json"), "r", encoding="utf-8") as f:
            caderno2_words = json.load(f)
    except FileNotFoundError:
        print(f"File not found: data_{lvl.lower()}.json. Skipping.")
        caderno2_words = []
        
    print(f"Level {lvl}: {len(original_words)} original words, {len(caderno2_words)} new words")
    
    # Let's ensure caderno_id is assigned properly if not already there, 
    # but the logic uses index in overall array to map to caderno.
    # So we just append the Caderno 2 words after Caderno 1 words for this level.
    new_vocab.extend(original_words)
    new_vocab.extend(caderno2_words)

# Set global word_id correctly
for i, w in enumerate(new_vocab):
    w['id'] = i + 1

with open(os.path.join(BASE_DIR, "vocabulary.json"), "w", encoding="utf-8") as f:
    json.dump(new_vocab, f, indent=4, ensure_ascii=False)

print(f"Successfully merged data. Total words in vocabulary.json: {len(new_vocab)}")
