import json
import requests
from bs4 import BeautifulSoup
import time
import re
import concurrent.futures
from deep_translator import GoogleTranslator
import threading
import unicodedata

save_lock = threading.Lock()

def clean_text(text):
    return re.sub(r'\s+', ' ', text).strip()

def get_dicio_data(word_str):
    w = ''.join(c for c in unicodedata.normalize('NFD', word_str) if unicodedata.category(c) != 'Mn')
    w = w.replace(' ', '-')
    w = w.lower()
    
    url = f"https://www.dicio.com.br/{w}/"
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code != 200:
            return None
        soup = BeautifulSoup(resp.content, 'html.parser')
        
        data = {'def': '', 'examples': [], 'synonyms': [], 'antonyms': []}
        
        sig_p = soup.find('p', class_='significado')
        if sig_p:
            spans = sig_p.find_all('span')
            for span in spans:
                if 'cl' not in span.get('class', []):
                    t = clean_text(span.get_text())
                    if t and not t.startswith('Significado de'):
                        data['def'] = t
                        break
        
        frases_div = soup.find('div', class_='frases')
        if frases_div:
            for f in frases_div.find_all('div', class_='frase'):
                em = f.find('em')
                if em: em.decompose()
                t = clean_text(f.get_text(strip=True))
                t = t.replace('\n', ' ').strip()
                data['examples'].append(t)
                
        sin_p = soup.find('p', class_='sinonimos')
        if sin_p:
            for a in sin_p.find_all('a'):
                data['synonyms'].append(clean_text(a.get_text()))
                
        ant_p = soup.find('p', class_='antonimos')
        if ant_p:
            for a in ant_p.find_all('a'):
                data['antonyms'].append(clean_text(a.get_text()))
                
        return data
    except:
        return None

def translate_pt_to_cn(text):
    try:
        return GoogleTranslator(source='pt', target='zh-CN').translate(text)
    except:
        time.sleep(1)
        try:
            return GoogleTranslator(source='pt', target='zh-CN').translate(text)
        except:
            return "翻译错误"

def is_phrase(text):
    words = text.split()
    return len(words) < 4

BAD_DEFS = [
    "Definição do dicionário de língua portuguesa.",
    "Termo técnico e científico da língua portuguesa usado frequentemente na investigação e tecnologia avançada.",
    "Insc.ção de o do nas"
]

def process_word(item):
    updated = False
    word = item['word']
    
    # Needs
    cur_def = item.get('priberam_definition', '')
    needs_def = len(cur_def) < 5 or cur_def in BAD_DEFS
    
    cur_examples = item.get('examples', [])
    needs_example = False
    pt_example = ""
    cn_example = ""
    if len(cur_examples) == 0 or not cur_examples[0].get('pt'):
        needs_example = True
    else:
        pt_example = cur_examples[0].get('pt', '').strip()
        cn_example = cur_examples[0].get('cn', '').strip()
        if is_phrase(pt_example):
            needs_example = True # Try to replace phrase with full sentence
            
    needs_syn = len(item.get('synonyms', [])) == 0
    
    dicio_data = None
    if needs_def or needs_example or needs_syn:
        dicio_data = get_dicio_data(word)
        
    if dicio_data:
        if needs_def and dicio_data['def']:
            item['priberam_definition'] = dicio_data['def']
            updated = True
            
        if needs_example and len(dicio_data['examples']) > 0:
            best_ex = max(dicio_data['examples'], key=len)
            ex_cn = translate_pt_to_cn(best_ex)
            item['examples'] = [{'pt': best_ex, 'cn': ex_cn}]
            updated = True
            
        if needs_syn and dicio_data['synonyms']:
            item['synonyms'] = dicio_data['synonyms'][:4]
            updated = True
            
        if len(item.get('antonyms', [])) == 0 and dicio_data['antonyms']:
            item['antonyms'] = dicio_data['antonyms'][:4]
            updated = True
            
    # Fallback to remove period if still phrase
    cur_examples = item.get('examples', [])
    if len(cur_examples) > 0:
        pt = cur_examples[0].get('pt', '').strip()
        cn = cur_examples[0].get('cn', '').strip()
        if is_phrase(pt):
            if pt.endswith('.'): 
                pt = pt[:-1]
                updated = True
            if cn.endswith('。') or cn.endswith('.'): 
                cn = cn[:-1]
                updated = True
            item['examples'] = [{'pt': pt, 'cn': cn}]

    return updated

filepath = '/Users/caoyicheng/.gemini/antigravity/playground/velvet-equinox/src/data/vocabulary.json'
with open(filepath, 'r') as f:
    vocab = json.load(f)

print(f"Loaded {len(vocab)} words.")

modified_count = 0
# Process subset for test or all
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
    futures = {executor.submit(process_word, item): item for item in vocab}
    for i, future in enumerate(concurrent.futures.as_completed(futures)):
        try:
            if future.result():
                modified_count += 1
        except Exception as e:
            pass
        if (i+1) % 50 == 0:
            print(f"Processed {i+1}/{len(vocab)}...")

print(f"Saving {modified_count} updated words...")
with open(filepath, 'w') as f:
    json.dump(vocab, f, ensure_ascii=False, indent=4)
print("Done!")
