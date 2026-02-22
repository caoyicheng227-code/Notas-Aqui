import json
import os

def clean_vocabulary(file_path):
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 1. Deduplication (Lowest Level Principle)
    # Rank levels for comparison: A1 < A2 < B1 < B2 < C1 < C2
    level_rank = {'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6}
    
    unique_words = {} # word -> best_entry
    
    for entry in data:
        word = entry['word'].lower().strip()
        current_level = entry['cefr_level']
        
        if word not in unique_words:
            unique_words[word] = entry
        else:
            # Keep the one with the lowest level rank
            existing_level = unique_words[word]['cefr_level']
            if level_rank[current_level] < level_rank[existing_level]:
                # If the new one is lower level, it might be a collision. 
                # According to PRD: "向上原则" (Upward Principle)
                # "对重复的单词从高等级词库中删除，只保留在最低等级"
                # So we update to the lower level one.
                unique_words[word] = entry
            # If current level is higher or same, we discard (Upward Principle)

    cleaned_data = list(unique_words.values())

    # 2. Format Standardization
    for entry in cleaned_data:
        # Standardize translation (分号隔离)
        # Assuming entries might have different separators like '/' or ' ' if they were messy
        translation = entry['translation'].replace('/', ';').replace('；', ';').replace(' ', ';')
        # Clean up double semicolons and trailing/leading
        parts = [p.strip() for p in translation.split(';') if p.strip()]
        entry['translation'] = '; '.join(parts)

        # Remove phonetics (无音标清洗)
        if 'phonetic' in entry:
            del entry['phonetic']

    # 3. Sort by ID or Level? Keeping current order or sorting by Level then ID
    cleaned_data.sort(key=lambda x: (level_rank[x['cefr_level']], x['id']))

    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, ensure_ascii=False, indent=4)

    print(f"Cleaning complete. Reduced from {len(data)} to {len(cleaned_data)} unique words.")

if __name__ == "__main__":
    vocab_path = "/Users/caoyicheng/.gemini/antigravity/playground/velvet-equinox/src/data/vocabulary.json"
    clean_vocabulary(vocab_path)
