#!/usr/bin/env python3
"""
Generate Caderno 4 & 5 vocabulary for all CEFR levels.
Strict lemma filter:
  - VERB: only VerbForm=Inf (infinitive form), e.g. andar ✓, pára ✗, ouve ✗, fizeste ✗
  - NOUN: only Number=Sing (singular), e.g. mulher ✓, mulheres ✗
  - ADJ:  only Number=Sing AND token.text == token.lemma_ (e.g. rápido ✓ since lemma=rápido)
  - ADV:  always ok if text==lemma
  - Reject: PRON, DET, AUX, CCONJ, SCONJ, ADP, PART, PUNCT, NUM, SYM, X
"""

import json, ssl, time, os, re, unicodedata, threading
import concurrent.futures
import urllib.request
import requests
from bs4 import BeautifulSoup
from deep_translator import GoogleTranslator
import spacy

# ── spaCy setup ────────────────────────────────────────────────────────────
nlp = spacy.load("pt_core_news_sm", disable=["parser", "ner"])

REJECT_POS = {"PRON", "DET", "AUX", "CCONJ", "SCONJ", "ADP", "PART", "PUNCT", "NUM", "SYM", "X", "SPACE"}

# Portuguese conjugation endings that are NEVER base forms.
# This catches words that spaCy incorrectly assigns pos=NOUN.
# Carefully ordered from longest to shortest to avoid false positives.
CONJ_SUFFIXES = (
    # -este, -aste (2nd person past)
    "este", "aste",
    # 1st person present -ejo, -eio, -oo, -uo
    "eijo", "eio",
    # Imperfect -ava, -ia (but -ia can be noun like "alegria")
    # Don't block -ia to avoid false positives
    # Past subjunctive -esse, -asse, -isse
    "esse", "asse", "isse",
    # Future subjunctive -armos, -ermos, -irmos
    "armos", "ermos", "irmos",
    # Imperfect subjunctive -áramos -êramos -íramos
    "áramos", "êramos", "íramos",
    # 1st pers. present of -ejo type verbs
    "eijo",
)

# Exact matches that spaCy consistently mis-tags
CONJ_EXACT = {
    # 1st person present conjugations spaCy sees as NOUN or ADV
    "vejo", "trago", "venho", "faço", "sei", "digo", "ouço",
    "posso", "quero", "tenho", "sou", "estou", "devo",
    "ouvi", "busco", "falo", "pago", "meto", "peço", "fico", "levo",
    "mando", "paro", "passa", "toco", "sinto", "pinto", "ando", "temo",
    "corro", "subo", "parto", "perco", "abro", "sirvo", "ouço",
    # 2nd/3rd person irregular forms
    "fizeste", "fostes", "haveis", "sodes",
    # Imperfect/past
    "estavas", "estava", "estavam", "tínhamos",
    # Pronouns/particles that spaCy sometimes mis-tags
    "eles", "nada", "tudo", "algo",
}

def is_lemma(word: str) -> bool:
    """
    Return True only if `word` is the canonical base (lemma) form.
    Multi-layer check:
    1. Exact blocklist for known spaCy false positives
    2. Suffix blocklist for conjugation endings
    3. spaCy POS + morphology check
    """
    w = word.lower()

    # Layer 1: exact blocklist
    if w in CONJ_EXACT:
        return False

    # Layer 2: suffix blocklist
    for suf in CONJ_SUFFIXES:
        if w.endswith(suf) and len(w) > len(suf) + 2:
            return False

    # Layer 3: spaCy
    doc = nlp(w)
    if not doc:
        return False
    tok = doc[0]

    if tok.pos_ in REJECT_POS:
        return False

    morph = tok.morph
    pos = tok.pos_

    # Verbs: only accept infinitive
    if pos == "VERB":
        vf = morph.get("VerbForm")
        if not vf or vf[0] != "Inf":
            return False
        return tok.text.lower() == tok.lemma_.lower()

    # Any word where spaCy detects a finite verb form should be rejected
    # (catches spaCy tagging some verb forms as NOUN)
    vf = morph.get("VerbForm")
    if vf and vf[0] in ("Fin", "Ger"):
        return False

    # Tense presence strongly implies conjugation
    tense = morph.get("Tense")
    if tense and pos != "NOUN":  # some nouns have tense from ambiguity, skip
        return False

    # Nouns/PROPN: must be singular
    if pos in ("NOUN", "PROPN"):
        num = morph.get("Number")
        if num and num[0] == "Plur":
            return False
        return tok.text.lower() == tok.lemma_.lower()

    # Adjectives: singular + text==lemma
    if pos == "ADJ":
        num = morph.get("Number")
        if num and num[0] == "Plur":
            return False
        return tok.text.lower() == tok.lemma_.lower()

    # Adverb
    if pos == "ADV":
        if w.endswith("mente"):
            return False
        return tok.text.lower() == tok.lemma_.lower()

    # Fallback
    return tok.text.lower() == tok.lemma_.lower()


# ── CEFR band definitions ──────────────────────────────────────────────────
config = {
    "A1": {"bounds": (300,  2500),  "C4": "Comida e Bebida",      "C5": "Família e Amigos"},
    "A2": {"bounds": (2500, 5000),  "C4": "Saúde e Corpo",        "C5": "Habitação"},
    "B1": {"bounds": (5000, 9000),  "C4": "Sociedade e Cultura",  "C5": "Meio Ambiente"},
    "B2": {"bounds": (9000,14000),  "C4": "Tecnologia e Mídia",   "C5": "Sentimentos e Opiniões"},
    "C1": {"bounds": (14000,20000), "C4": "Direito e Justiça",    "C5": "Artes e Literatura"},
    "C2": {"bounds": (20000,35000), "C4": "Filosofia e Religião", "C5": "História e Evolução"},
}

# ── Helpers ────────────────────────────────────────────────────────────────
def clean(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()

def get_dicio(word: str):
    slug = ''.join(
        c for c in unicodedata.normalize('NFD', word)
        if unicodedata.category(c) != 'Mn'
    ).replace(' ', '-').lower()
    url = f"https://www.dicio.com.br/{slug}/"
    try:
        r = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=10)
        if r.status_code != 200:
            return None
        soup = BeautifulSoup(r.content, "html.parser")

        data = {"def": "", "examples": [], "synonyms": [], "antonyms": [], "gender": "o"}

        cl = soup.find("span", class_="cl")
        if cl and "feminino" in cl.get_text():
            data["gender"] = "a"

        sig = soup.find("p", class_="significado")
        if sig:
            for span in sig.find_all("span"):
                if "cl" not in span.get("class", []):
                    t = clean(span.get_text())
                    if t and not t.startswith("Significado de"):
                        data["def"] = t
                        break

        frases = soup.find("div", class_="frases")
        if frases:
            for f in frases.find_all("div", class_="frase"):
                em = f.find("em")
                if em:
                    em.decompose()
                t = clean(f.get_text()).replace("\n", " ").strip()
                if len(t.split()) >= 5:
                    data["examples"].append(t)

        sin = soup.find("p", class_="sinonimos")
        if sin:
            data["synonyms"] = [clean(a.get_text()) for a in sin.find_all("a")][:5]
        ant = soup.find("p", class_="antonimos")
        if ant:
            data["antonyms"] = [clean(a.get_text()) for a in ant.find_all("a")][:4]

        return data
    except Exception:
        return None

def translate(text: str):
    for _ in range(3):
        try:
            return GoogleTranslator(source="pt", target="zh-CN").translate(text)
        except:
            time.sleep(2)
    return None

# ── Load frequency list ────────────────────────────────────────────────────
print("Loading frequency list …")
context = ssl._create_unverified_context()
raw = urllib.request.urlopen(
    urllib.request.Request(
        "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/pt/pt_50k.txt",
        headers={"User-Agent": "Mozilla/5.0"}),
    context=context
).read().decode("utf-8")

all_freq: list[str] = []
for line in raw.split("\n"):
    parts = line.split(" ")
    if len(parts) == 2:
        w = parts[0].lower()
        if w.isalpha() and len(w) >= 4:
            all_freq.append(w)

print(f"Frequency list: {len(all_freq)} words")

# ── Pre-compute which candidates pass the lemma filter per level ───────────
# (This is fast — spaCy on a single word is very quick)
print("Pre-filtering candidates by lemma check …")

# ── Load existing vocabulary ───────────────────────────────────────────────
vocab_path = "src/data/vocabulary.json"
with open(vocab_path, "r", encoding="utf-8") as f:
    vocab: list[dict] = json.load(f)

used: set[str] = {v["word"].lower() for v in vocab}

# ── Resume from partial output ─────────────────────────────────────────────
out_file = "scripts/new_c4_c5.json"
if os.path.exists(out_file):
    with open(out_file, "r", encoding="utf-8") as f:
        gathered: list[dict] = json.load(f)
else:
    gathered = []

gathered_words: set[str] = {w["word"].lower() for w in gathered}
lock = threading.Lock()

# ── Worker ─────────────────────────────────────────────────────────────────
def process(word: str, level: str):
    lw = word.lower()
    if lw in used or lw in gathered_words:
        return None
    if not is_lemma(lw):
        return None

    dicio = get_dicio(lw)
    if not dicio or len(dicio["def"]) < 5 or not dicio["examples"]:
        return None

    best_ex = max(dicio["examples"], key=len)
    word_cn  = translate(lw)
    ex_cn    = translate(best_ex)
    if not word_cn or not ex_cn:
        return None

    return {
        "word":                lw,
        "translation":         word_cn,
        "gender":              dicio["gender"],
        "cefr_level":          level,
        "category":            "temp",
        "priberam_definition": dicio["def"],
        "examples":            [{"pt": best_ex, "cn": ex_cn}],
        "synonyms":            dicio["synonyms"],
        "antonyms":            dicio["antonyms"],
    }

# ── Main loop ──────────────────────────────────────────────────────────────
for level, details in config.items():
    lo, hi = details["bounds"]
    candidates = [w for w in all_freq[lo:hi] if w not in used and w not in gathered_words]

    existing_for_level = [w for w in gathered if w["cefr_level"] == level]
    needed = 200 - len(existing_for_level)
    if needed <= 0:
        print(f"{level} already complete. Skipping.")
        continue

    # Pre-filter locally (fast, no network)
    lemma_candidates = [w for w in candidates if is_lemma(w)]
    print(f"\n{'='*60}")
    print(f"  {level}: {needed} needed — {len(lemma_candidates)} lemma candidates from {len(candidates)} raw")
    print(f"{'='*60}")

    pointer = 0
    BATCH = 40

    while needed > 0 and pointer < len(lemma_candidates):
        batch = lemma_candidates[pointer: pointer + BATCH]
        pointer += BATCH

        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as ex:
            futs = {ex.submit(process, w, level): w for w in batch}

            for fut in concurrent.futures.as_completed(futs):
                if needed <= 0:
                    break
                item = fut.result()
                if item:
                    with lock:
                        if item["word"] not in gathered_words:
                            gathered_words.add(item["word"])
                            gathered.append(item)
                            needed -= 1
                            count = 200 - needed
                            print(f"  [{level}] {count:>3}/200  {item['word']:<22} {item['translation']}")
                            if count % 20 == 0:
                                with open(out_file, "w", encoding="utf-8") as f:
                                    json.dump(gathered, f, ensure_ascii=False, indent=2)

    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(gathered, f, ensure_ascii=False, indent=2)
    print(f"  → Saved {len(gathered)} total words so far.")

# ── Assign categories & final save ────────────────────────────────────────
by_level: dict[str, list] = {k: [] for k in config}
for w in gathered:
    lv = w["cefr_level"]
    if lv in by_level and len(by_level[lv]) < 200:
        by_level[lv].append(w)

final: list[dict] = []
for lv, items in by_level.items():
    for i, item in enumerate(items):
        item["category"] = config[lv]["C4"] if i < 100 else config[lv]["C5"]
        final.append(item)

with open(out_file, "w", encoding="utf-8") as f:
    json.dump(final, f, ensure_ascii=False, indent=2)

print(f"\n✅ Done! Total {len(final)} words saved to {out_file}.")
