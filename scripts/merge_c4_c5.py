import json
import os

vocab_file = 'src/data/vocabulary.json'
new_words_file = 'scripts/new_c4_c5.json'

with open(vocab_file, 'r', encoding='utf-8') as f:
    vocab = json.load(f)
    
if not os.path.exists(new_words_file):
    print(f"Error: {new_words_file} not found.")
    exit(1)
    
with open(new_words_file, 'r', encoding='utf-8') as f:
    new_words = json.load(f)

# The new_words list has dictionaries with: word, translation, gender, cefr_level, category, priberam_definition, examples, synonyms, antonyms
# Ensure they all have 'id' fields. We will strictly reassign IDs linearly

all_words = vocab + new_words

# Sort primarily by level (A1 -> C2), then by category, then alphabetically?
# The original vocabulary was somewhat ordered, but let's just append the new words and rebuild IDs.
# Or better, we can group them by CEFR level so A1 is all together, A2 is all together, etc.
# Then within CEFR level, group by category (Caderno 1-5).
# The user's original data had Cadernos 1, 2, 3 ordered. 
# We'll just append and re-ID, preserving the order of the original so progress isn't lost for existing IDs?
# Wait! If we change IDs of existing words, user progress in localStorage might get mismatched!
# User progress is stored by ID (`learningProgress`). We MUST NOT change existing IDs!
# We find the max ID in the existing vocab and start assigning new IDs from there.

max_id = max(item['id'] for item in vocab) if vocab else 0

for item in new_words:
    max_id += 1
    item['id'] = max_id
    # Ensure structure matches exactly
    item['examples'] = item.get('examples', [])
    item['synonyms'] = item.get('synonyms', [])
    item['antonyms'] = item.get('antonyms', [])

vocab.extend(new_words)

# Write back to vocabulary.json
with open(vocab_file, 'w', encoding='utf-8') as f:
    json.dump(vocab, f, ensure_ascii=False, indent=4)

print(f"Successfully merged {len(new_words)} words. Total vocabulary size is now {len(vocab)}.")
