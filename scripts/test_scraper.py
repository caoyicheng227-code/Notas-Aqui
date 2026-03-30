import unicodedata, re, requests
import sys
from bs4 import BeautifulSoup
def get_dicio_data(word_str):
    w = ''.join(c for c in unicodedata.normalize('NFD', word_str) if unicodedata.category(c) != 'Mn')
    w = w.replace(' ', '-').lower()
    url = f"https://www.dicio.com.br/{w}/"
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        resp = requests.get(url, headers=headers, timeout=8)
        print(f"Status: {resp.status_code}")
        if resp.status_code != 200: return f"Bad status: {resp.status_code}"
        soup = BeautifulSoup(resp.content, 'html.parser')
        
        data = {'def': '', 'examples': []}
        sig_p = soup.find('p', class_='significado')
        if sig_p:
            spans = sig_p.find_all('span')
            for span in spans:
                if 'cl' not in span.get('class', []):
                    t = span.get_text().strip()
                    if t and not t.startswith('Significado de'):
                        data['def'] = t
                        break
        print(f"Def: {data['def']}")
        
        frases_div = soup.find('div', class_='frases')
        if frases_div:
            for f in frases_div.find_all('div', class_='frase'):
                t = f.get_text(strip=True).replace('\n', ' ').strip()
                if len(t.split()) > 3:
                    data['examples'].append(t)
        print(f"Examples: {len(data['examples'])}")
        return data
    except Exception as e:
        return f"Exception: {e}"

from deep_translator import GoogleTranslator
def translate_pt_to_cn(text):
    try:
        return GoogleTranslator(source='pt', target='zh-CN').translate(text)
    except Exception as e:
        print(f"Translate exception: {e}")
        return None

w = 'como'
print(f"Testing {w}...")
d = get_dicio_data(w)
print(d)
print(translate_pt_to_cn(w))
