#!/usr/bin/env python3
"""
Post-generation cleanup:
1. Apply is_lemma filter to remove any words that slipped through.
2. Reassign categories (first 100 per level → C4, next 100 → C5).
3. Generate replacement words for any removed ones (if needed).
"""
import json, spacy, re

nlp = spacy.load("pt_core_news_sm", disable=["parser", "ner"])

REJECT_POS = {"PRON", "DET", "AUX", "CCONJ", "SCONJ", "ADP", "PART", "PUNCT", "NUM", "SYM", "X", "SPACE"}
CONJ_SUFFIXES = ("este", "aste", "eijo", "eio", "esse", "asse", "isse", "armos", "ermos", "irmos", "áramos", "êramos", "íramos")
CONJ_EXACT = {
    "vejo", "trago", "venho", "faço", "sei", "digo", "ouço",
    "posso", "quero", "tenho", "sou", "estou", "devo",
    "ouvi", "busco", "falo", "pago", "meto", "peço", "fico", "levo",
    "mando", "paro", "passa", "toco", "sinto", "pinto", "ando", "temo",
    "corro", "subo", "parto", "perco", "abro", "sirvo", "acabo",
    "fizeste", "fostes", "haveis", "sodes",
    "estavas", "estava", "estavam", "tínhamos",
    "eles", "nada", "tudo", "algo",
    # verb forms spaCy sometimes mis-tags as noun/adj/adv:
    "fuja", "aproxime", "tranca",
}

def is_lemma(word: str) -> bool:
    w = word.lower()
    if w in CONJ_EXACT:
        return False
    for suf in CONJ_SUFFIXES:
        if w.endswith(suf) and len(w) > len(suf) + 2:
            return False
    doc = nlp(w)
    if not doc:
        return False
    tok = doc[0]
    if tok.pos_ in REJECT_POS:
        return False
    morph = tok.morph
    pos = tok.pos_
    if pos == "VERB":
        vf = morph.get("VerbForm")
        if not vf or vf[0] != "Inf":
            return False
        return tok.text.lower() == tok.lemma_.lower()
    vf = morph.get("VerbForm")
    if vf and vf[0] in ("Fin", "Ger"):
        return False
    tense = morph.get("Tense")
    if tense and pos != "NOUN":
        return False
    if pos in ("NOUN", "PROPN"):
        num = morph.get("Number")
        if num and num[0] == "Plur":
            return False
        return tok.text.lower() == tok.lemma_.lower()
    if pos == "ADJ":
        num = morph.get("Number")
        if num and num[0] == "Plur":
            return False
        return tok.text.lower() == tok.lemma_.lower()
    if pos == "ADV":
        if w.endswith("mente"):
            return False
        return tok.text.lower() == tok.lemma_.lower()
    return tok.text.lower() == tok.lemma_.lower()

with open("scripts/new_c4_c5.json", "r", encoding="utf-8") as f:
    words = json.load(f)

config = {
    "A1": {"C4": "Comida e Bebida",      "C5": "Família e Amigos"},
    "A2": {"C4": "Saúde e Corpo",        "C5": "Habitação"},
    "B1": {"C4": "Sociedade e Cultura",  "C5": "Meio Ambiente"},
    "B2": {"C4": "Tecnologia e Mídia",   "C5": "Sentimentos e Opiniões"},
    "C1": {"C4": "Direito e Justiça",    "C5": "Artes e Literatura"},
    "C2": {"C4": "Filosofia e Religião", "C5": "História e Evolução"},
}

removed = []
kept = []
for w in words:
    if is_lemma(w["word"]):
        kept.append(w)
    else:
        removed.append(w["word"])

print(f"Removed {len(removed)} non-lemma words:")
for r in removed:
    print(f"  - {r}")
print(f"Kept: {len(kept)}")

# Count by level
by_level = {}
for w in kept:
    lv = w["cefr_level"]
    by_level[lv] = by_level.get(lv, 0) + 1
for lv, cnt in sorted(by_level.items()):
    print(f"  {lv}: {cnt}/200")

# Assign categories: first 100 → C4, rest → C5
from collections import defaultdict
level_groups = defaultdict(list)
for w in kept:
    level_groups[w["cefr_level"]].append(w)

final = []
for lv, items in sorted(level_groups.items()):
    for i, item in enumerate(items):
        item["category"] = config[lv]["C4"] if i < 100 else config[lv]["C5"]
        final.append(item)

# Save clean version
with open("scripts/new_c4_c5_clean.json", "w", encoding="utf-8") as f:
    json.dump(final, f, ensure_ascii=False, indent=2)

print(f"\n✅ Saved {len(final)} clean words to scripts/new_c4_c5_clean.json")
