import json
import os

BASE_DIR = "/Users/caoyicheng/.gemini/antigravity/playground/velvet-equinox/src/data"
SCRIPTS_DIR = "/Users/caoyicheng/.gemini/antigravity/playground/velvet-equinox/scripts"

# Load existing vocabulary.json (should have 1200 words: C1 and C2 for all levels)
with open(os.path.join(BASE_DIR, "vocabulary.json"), "r", encoding="utf-8") as f:
    vocab = json.load(f)

# Re-group existing by CEFR level
levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
vocab_by_level = {lvl: [] for lvl in levels}
for w in vocab:
    vocab_by_level[w['cefr_level']].append(w)

new_vocab = []

for lvl in levels:
    # Get the original words (Caderno 1 and Caderno 2, total 200 words per level)
    original_words = vocab_by_level[lvl][:200]
    
    # Load Caderno 3 words for this level
    try:
        with open(os.path.join(SCRIPTS_DIR, f"data_{lvl.lower()}_c3.json"), "r", encoding="utf-8") as f:
            caderno3_words = json.load(f)
    except FileNotFoundError:
        print(f"File not found: data_{lvl.lower()}_c3.json. Skipping.")
        caderno3_words = []
        
    print(f"Level {lvl}: {len(original_words)} existing words, {len(caderno3_words)} new words")
    
    # Append the Caderno 3 words after Caderno 2 words for this level
    new_vocab.extend(original_words)
    new_vocab.extend(caderno3_words)

# Set global word_id correctly
for i, w in enumerate(new_vocab):
    w['id'] = i + 1

with open(os.path.join(BASE_DIR, "vocabulary.json"), "w", encoding="utf-8") as f:
    json.dump(new_vocab, f, indent=4, ensure_ascii=False)

print(f"Successfully merged data. Total words in vocabulary.json: {len(new_vocab)}")
