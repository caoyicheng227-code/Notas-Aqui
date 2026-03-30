import json
import spacy
import os

# Load spaCy
try:
    nlp = spacy.load("pt_core_news_sm")
except:
    os.system("python3 -m spacy download pt_core_news_sm")
    nlp = spacy.load("pt_core_news_sm")

# Strict blocklist of words that are definitely inflected forms or invalid for this corpus
CONJ_EXACT = {
    # 1st person present (-o)
    "fico", "temo", "acabo", "perco", "tranca", "fuja", "aproxime", "levo", "mando", "paro", "passo", "toco",
    "sinto", "pinto", "ando", "corro", "subo", "parto", "abro", "sirvo", "ouço", "vejo", "faço", "digo",
    "trago", "ponho", "valho", "perco", "meço", "peço", "ouço", "durmo", "fujo", "rio", "caio", "saio",
    "estou", "sou", "dou", "vou", "sei", "creio", "leio", "hei", "posso", "quero", "tenho", "venho",
    # 3rd person present (identified as bad in latest batch)
    "invade", "mandaria",
    # Specific problematic forms
    "fizeste", "fiz", "fez", "fomos", "foram", "estavas", "estava", "estive", "estou", "estão",
    "tenho", "tens", "tem", "temos", "tendes", "têm", "tinha", "tinhamos", "tinham", "tive",
    "voos", "páras", "param", "parava", "pararia"
}

def is_lemma(text):
    text = text.lower().strip()
    # ONLY remove if explicitly in the bad list
    if text in CONJ_EXACT:
        return False
    return True

def main():
    with open('src/data/vocabulary.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    original_len = len(data)
    cleaned = []
    removed = []

    # 1. Clean by blocklist
    for item in data:
        word = item['word']
        if is_lemma(word):
            cleaned.append(item)
        else:
            removed.append(word)

    print(f"Removed {len(removed)} specifically blocked words:")
    for w in sorted(removed):
        print(f"  - {w}")

    # 2. Deduplicate by word+level
    final = []
    seen = set()
    dup_count = 0
    for item in cleaned:
        # Use a combination of word and cefr_level as key
        key = (item['word'].lower().strip(), item['cefr_level'])
        if key not in seen:
            final.append(item)
            seen.add(key)
        else:
            dup_count += 1

    with open('src/data/vocabulary.json', 'w', encoding='utf-8') as f:
        json.dump(final, f, ensure_ascii=False, indent=4)

    print(f"Deduplicated: {dup_count} words removed.")
    print(f"\nFinal count: {len(final)} (Total removed: {original_len - len(final)})")

if __name__ == "__main__":
    main()

if __name__ == "__main__":
    main()
