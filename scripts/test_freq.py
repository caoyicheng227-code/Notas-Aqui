import json
import urllib.request
import re
import ssl

url = "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/pt/pt_50k.txt"
print("Downloading frequency list...")
context = ssl._create_unverified_context()
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, context=context) as response:
    content = response.read().decode('utf-8')

words = []
for line in content.split('\n'):
    if line:
        parts = line.split(' ')
        if len(parts) == 2:
            word = parts[0].lower()
            if word.isalpha() and len(word) >= 4:
                words.append(word)

print(f"Loaded {len(words)} valid words from frequency list.")

vocab_path = 'src/data/vocabulary.json'
with open(vocab_path, 'r', encoding='utf-8') as f:
    vocab = json.load(f)

used_words = set(v['word'].lower() for v in vocab)

new_words = [w for w in words if w not in used_words and not w.endswith('mente') and not (w.endswith('ndo') and len(w) > 5)]

print(f"Available new words after filtering: {len(new_words)}")
print(f"Sample: {new_words[:20]}")
