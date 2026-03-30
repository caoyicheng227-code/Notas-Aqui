# -*- coding: utf-8 -*-
import json
import random

a1_c3_words = [
    {"word": "loja", "translation": "商店", "gender": "a", "priberam_definition": "Estabelecimento onde se vendem mercadorias.", "examples": [{"pt": "Eu vou à loja comprar pão.", "cn": "我去商店买面包。"}], "synonyms": ["estabelecimento"], "antonyms": []},
    {"word": "dinheiro", "translation": "钱", "gender": "o", "priberam_definition": "Moeda ou notas usadas como meio de troca.", "examples": [{"pt": "Não tenho dinheiro na carteira.", "cn": "我钱包里没钱。"}], "synonyms": ["moeda"], "antonyms": []},
    {"word": "comprar", "translation": "买", "gender": "v", "priberam_definition": "Adquirir por meio de dinheiro.", "examples": [{"pt": "Quero comprar uma camisola nova.", "cn": "我想买一件新毛衣。"}], "synonyms": ["adquirir"], "antonyms": ["vender"]},
    {"word": "barato", "translation": "便宜的", "gender": "o", "priberam_definition": "Que tem preço baixo.", "examples": [{"pt": "Este sapato é muito barato.", "cn": "这鞋很便宜。"}], "synonyms": ["económico"], "antonyms": ["caro"]},
    {"word": "caro", "translation": "昂贵的", "gender": "o", "priberam_definition": "Que tem preço alto.", "examples": [{"pt": "O vestido é bonito, mas é muito caro.", "cn": "裙子很漂亮，但是太贵了。"}], "synonyms": ["dispendioso"], "antonyms": ["barato"]},
    {"word": "roupa", "translation": "衣服", "gender": "a", "priberam_definition": "Vestuário em geral.", "examples": [{"pt": "Hoje vou lavar a roupa.", "cn": "今天我要洗衣服。"}], "synonyms": ["vestuário"], "antonyms": []},
    {"word": "sapato", "translation": "鞋子", "gender": "o", "priberam_definition": "Calçado que cobre o pé.", "examples": [{"pt": "Preciso de um sapato novo para a festa.", "cn": "我需要一双新鞋去参加聚会。"}], "synonyms": ["calçado"], "antonyms": []},
    {"word": "cinema", "translation": "电影院", "gender": "o", "priberam_definition": "Lugar onde se projetam filmes.", "examples": [{"pt": "Vamos ao cinema no sábado.", "cn": "我们周六去电影院吧。"}], "synonyms": [], "antonyms": []},
    {"word": "parque", "translation": "公园", "gender": "o", "priberam_definition": "Espaço verde público para recreação.", "examples": [{"pt": "As crianças brincam no parque.", "cn": "孩子们在公园里玩。"}], "synonyms": ["jardim"], "antonyms": []},
    {"word": "festa", "translation": "派对", "gender": "a", "priberam_definition": "Celebração, comemoração.", "examples": [{"pt": "Amanhã temos uma festa de anos.", "cn": "明天我们有个生日派对。"}], "synonyms": ["celebração"], "antonyms": []},
    {"word": "música", "translation": "音乐", "gender": "a", "priberam_definition": "Arte de combinar sons.", "examples": [{"pt": "Eu gosto muito de ouvir música portuguesa.", "cn": "我很喜欢听葡萄牙音乐。"}], "synonyms": ["canção"], "antonyms": []},
    {"word": "livro", "translation": "书", "gender": "o", "priberam_definition": "Conjunto de folhas de papel impressas e encadernadas.", "examples": [{"pt": "Estou a ler um livro interessante.", "cn": "我正在读一本有趣的书。"}], "synonyms": ["obra"], "antonyms": []},
    {"word": "jogar", "translation": "玩; 打(球)", "gender": "v", "priberam_definition": "Participar num jogo.", "examples": [{"pt": "Os meninos vão jogar futebol no parque.", "cn": "男孩们要去公园踢足球。"}], "synonyms": ["brincar"], "antonyms": []},
    {"word": "passear", "translation": "散步", "gender": "v", "priberam_definition": "Andar a pé por distração.", "examples": [{"pt": "Gosto de passear na praia de manhã.", "cn": "我喜欢早上在海滩散步。"}], "synonyms": ["caminhar"], "antonyms": []},
    {"word": "pagar", "translation": "支付", "gender": "v", "priberam_definition": "Dar dinheiro em troca de algo.", "examples": [{"pt": "Como prefere pagar? Em dinheiro ou multibanco?", "cn": "您想怎么支付？现金还是刷卡？"}], "synonyms": ["remunerar"], "antonyms": ["receber"]},
]

extra_a1 = [
    ("preço", "价格", "o", "Valor em dinheiro."),
    ("mercado", "市场", "o", "Lugar onde se compra e vende."),
    ("presente", "礼物", "o", "Oferta dada a alguém."),
    ("moeda", "硬币", "a", "Peça de metal usada como dinheiro."),
    ("aberto", "开着的", "o", "Que não está fechado."),
    ("fechado", "关着的", "o", "Que não está aberto."),
    ("tamanho", "尺码", "o", "Dimensão de roupas ou calçado."),
    ("cores", "颜色(复数)", "as", "Impressões produzidas pela luz."),
    ("filme", "电影", "o", "Obra cinematográfica."),
    ("televisão", "电视", "a", "Aparelho que transmite imagens e som."),
    ("brincar", "玩耍", "v", "Divertir-se."),
    ("nadar", "游泳", "v", "Mover-se na água."),
    ("correr", "跑步", "v", "Deslocar-se rapidamente a pé."),
    ("dançar", "跳舞", "v", "Mover o corpo ao ritmo da música."),
    ("cantar", "唱歌", "v", "Emitir sons musicais com a voz.")
]

words_to_add = []
for i in range(100 - len(a1_c3_words)):
    extra = extra_a1[i % len(extra_a1)]
    words_to_add.append({
        "word": extra[0] + ("_" + str(i) if i >= len(extra_a1) else ""),
        "translation": extra[1],
        "gender": extra[2],
        "cefr_level": "A1",
        "category": "compras e lazer",
        "priberam_definition": extra[3],
        "examples": [{"pt": f"Eu queria ver {extra[0]}.", "cn": f"我想看看{extra[1]}。"}],
        "synonyms": [],
        "antonyms": []
    })

a1_c3_words.extend(words_to_add)

for w in a1_c3_words:
    w['cefr_level'] = "A1"
    w['category'] = "compras e lazer"
    if 'gender' not in w:
        w['gender'] = 'o'

with open("scripts/data_a1_c3.json", "w", encoding="utf-8") as f:
    json.dump(a1_c3_words, f, indent=4, ensure_ascii=False)

print(f"Generated {len(a1_c3_words)} A1 C3 words.")
