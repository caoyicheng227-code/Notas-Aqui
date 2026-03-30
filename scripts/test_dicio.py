import unicodedata, re, requests
from bs4 import BeautifulSoup
def get_dicio_data(word_str):
    w = ''.join(c for c in unicodedata.normalize('NFD', word_str) if unicodedata.category(c) != 'Mn')
    w = w.replace(' ', '-').lower()
    url = f"https://www.dicio.com.br/{w}/"
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        resp = requests.get(url, headers=headers, timeout=8)
        if resp.status_code != 200: return f"Bad status: {resp.status_code}"
        soup = BeautifulSoup(resp.content, 'html.parser')
        return "Success"
    except Exception as e:
        return f"Exception: {e}"
print(get_dicio_data('gato'))
