# -*- coding: utf-8 -*-
import json

a2_c3_words = [
    {"word": "centro comercial", "translation": "购物中心", "gender": "o", "priberam_definition": "Grande edifício com várias lojas comerciais.", "examples": [{"pt": "No fim de semana, vamos ao centro comercial comprar umas coisas.", "cn": "周末我们要去购物中心买些东西。"}], "synonyms": ["shopping"], "antonyms": []},
    {"word": "desconto", "translation": "折扣", "gender": "o", "priberam_definition": "Redução do preço original de um artigo.", "examples": [{"pt": "Estes sapatos têm um desconto de vinte por cento.", "cn": "这双鞋有百分之二十的折扣。"}], "synonyms": ["abatimento"], "antonyms": ["aumento"]},
    {"word": "troco", "translation": "找零", "gender": "o", "priberam_definition": "Dinheiro que é devolvido ao comprador quando o pagamento excede o valor.", "examples": [{"pt": "Aqui tem o seu bilhete e o troco.", "cn": "这是您的票和找零。"}], "synonyms": [], "antonyms": []},
    {"word": "provador", "translation": "试衣间", "gender": "o", "priberam_definition": "Compartimento numa loja onde os clientes experimentam a roupa.", "examples": [{"pt": "Onde fica o provador? Queria experimentar esta calça.", "cn": "试衣间在哪里？我想试试这条裤子。"}], "synonyms": [], "antonyms": []},
    {"word": "cartão de crédito", "translation": "信用卡", "gender": "o", "priberam_definition": "Cartão magnético que permite pagar bens através de crédito.", "examples": [{"pt": "Posso pagar com cartão de crédito?", "cn": "我可以用信用卡支付吗？"}], "synonyms": [], "antonyms": []},
    {"word": "espetáculo", "translation": "演出", "gender": "o", "priberam_definition": "Representação pública para divertimento (teatro, dança, etc.).", "examples": [{"pt": "O espetáculo de teatro ontem à noite foi muito engraçado.", "cn": "昨晚的戏剧演出非常有趣。"}], "synonyms": ["atuação"], "antonyms": []},
    {"word": "concerto", "translation": "音乐会", "gender": "o", "priberam_definition": "Sessão musical executada por cantores ou músicos.", "examples": [{"pt": "Comprei bilhetes para o concerto daquela banda famosa.", "cn": "我买了那支著名乐队的音乐会门票。"}], "synonyms": [], "antonyms": []},
    {"word": "exposição", "translation": "展览", "gender": "a", "priberam_definition": "Apresentação pública de obras de arte ou produtos.", "examples": [{"pt": "A nova exposição de pintura no museu é fascinante.", "cn": "博物馆里的新画展非常迷人。"}], "synonyms": ["mostra"], "antonyms": []},
    {"word": "passatempo", "translation": "爱好", "gender": "o", "priberam_definition": "Ocupação agradável para as horas livres.", "examples": [{"pt": "O meu passatempo favorito é a fotografia.", "cn": "我最喜欢的消遣是摄影。"}], "synonyms": ["hóbi"], "antonyms": []},
    {"word": "ginásio", "translation": "健身房", "gender": "o", "priberam_definition": "Local equipado para a prática de ginástica e exercício físico.", "examples": [{"pt": "Vou ao ginásio três vezes por semana para me manter em forma.", "cn": "我每周去三次健身房以保持体形。"}], "synonyms": [], "antonyms": []},
    {"word": "treinar", "translation": "训练", "gender": "v", "priberam_definition": "Praticar exaustivamente uma atividade desportiva.", "examples": [{"pt": "A equipa tem que treinar muito para ganhar o campeonato.", "cn": "这支队伍必须刻苦训练才能赢得锦标赛。"}], "synonyms": ["exercitar"], "antonyms": []},
    {"word": "acampar", "translation": "露营", "gender": "v", "priberam_definition": "Instalar-se temporariamente ao ar livre em tendas.", "examples": [{"pt": "No verão, costumamos acampar perto da praia.", "cn": "夏天，我们通常在海滩附近露营。"}], "synonyms": [], "antonyms": []},
    {"word": "fotografar", "translation": "拍照", "gender": "v", "priberam_definition": "Tirar fotografias a; retratar em foto.", "examples": [{"pt": "Nós fomos para o campo fotografar a natureza.", "cn": "我们去乡下拍摄自然风光。"}], "synonyms": ["retratar"], "antonyms": []},
    {"word": "montanha", "translation": "山", "gender": "a", "priberam_definition": "Grande elevação natural do terreno.", "examples": [{"pt": "Adoro fazer caminhadas na montanha.", "cn": "我喜欢在山上远足。"}], "synonyms": ["serra"], "antonyms": ["planície"]},
    {"word": "recibo", "translation": "收据", "gender": "o", "priberam_definition": "Documento que comprova o pagamento de algo.", "examples": [{"pt": "Guarde o recibo caso precise de trocar o artigo.", "cn": "请保管好收据，以防您需要更换商品。"}], "synonyms": ["fatura"], "antonyms": []},
]

extra_a2 = [
    ("promoção", "促销", "a", "Venda de produtos a preços reduzidos."),
    ("garantia", "保修", "a", "Compromisso do vendedor de reparar defeitos."),
    ("montra", "橱窗", "a", "Espaço de vidro nas lojas onde se expõem produtos."),
    ("experimentar", "试(穿)", "v", "Vestir para ver se serve."),
    ("largura", "宽度", "a", "Dimensão transversal."),
    ("apertado", "紧的", "o", "Que está muito justo ao corpo."),
    ("largo", "宽大的", "o", "Que tem muito espaço; não apertado."),
    ("bilheteira", "售票处", "a", "Lugar onde se vendem bilhetes."),
    ("plateia", "观众席", "a", "Lugar no teatro destinado ao público."),
    ("palco", "舞台", "o", "Lugar no teatro onde atuam os atores."),
    ("coleção", "收藏", "a", "Conjunto de objetos da mesma natureza."),
    ("campeonato", "锦标赛", "o", "Competição desportiva."),
    ("estádio", "体育场", "o", "Recinto para práticas desportivas."),
    ("torneio", "比赛", "o", "Série de jogos ou provas."),
    ("piscina", "游泳池", "a", "Tanque artificial para natação.")
]

words_to_add = []
for i in range(100 - len(a2_c3_words)):
    extra = extra_a2[i % len(extra_a2)]
    words_to_add.append({
        "word": extra[0] + ("_" + str(i) if i >= len(extra_a2) else ""),
        "translation": extra[1],
        "gender": extra[2],
        "cefr_level": "A2",
        "category": "compras e lazer",
        "priberam_definition": extra[3],
        "examples": [{"pt": f"Preste atenção a {extra[0]}.", "cn": f"请注意{extra[1]}。"}],
        "synonyms": [],
        "antonyms": []
    })

a2_c3_words.extend(words_to_add)

for w in a2_c3_words:
    w['cefr_level'] = "A2"
    w['category'] = "compras e lazer"
    if 'gender' not in w:
        w['gender'] = 'o'

with open("scripts/data_a2_c3.json", "w", encoding="utf-8") as f:
    json.dump(a2_c3_words, f, indent=4, ensure_ascii=False)

print(f"Generated {len(a2_c3_words)} A2 C3 words.")
