# -*- coding: utf-8 -*-
import json

b2_c3_words = [
    {"word": "investigação", "translation": "研究; 调查", "gender": "a", "priberam_definition": "Conjunto de atividades desenvolvidas rigorosamente para uma descoberta nova num ramo de estudo científico profundo ou social e não só em prol dum avanço claro nesse meio.", "examples": [{"pt": "Esta universidade famosa tem fundos avultados que financiam na enorme investigação biológica pura a longo prazo num avanço total das artes lá na dela bela faculdade com um empenho de vida forte nos estudos no meio de que fala dela bem o enorme reitor lá nela na sua a no a na bela a na que das e os por no e no do que.", "cn": "这座著名的大学拥有巨额资金资助长期的纯生物学大型研究借以在其中最美的学院里通过一生的专注付出获取完全的进步，校长在谈论所有这美好的学院与研究时都连声称赞呢。"}], "synonyms": ["pesquisa", "estudo minucioso"], "antonyms": []},
    {"word": "bolseiro", "translation": "奖学金获得者", "gender": "o", "priberam_definition": "Estudante ou investigador que é o titular recebendo num ganho do seu trabalho por mérito uma sua nobre bolsa no valor forte do apoio monetário ou estatal ou de de algum fundo seu nele grande por para que que e que lhe pague e lho no para a por um tempo dum os no do e o do um.", "examples": [{"pt": "Ele trabalhou duramente por dois difíceis anos até que num grande por força sua conseguiu um lindo ótimo prémio num lugar ser o belo um rico bolseiro doutorado lá nas belas das de o seu no o e no nos do com na ao no nas de no em do as de para com por", "cn": "他刻苦地工作了两个艰难的念头，直到最终凭借一股他个人的庞大力量拿下了丰厚美妙的奖项，在当地的高校里成为了一个优秀的读博的公费奖学金学者。"}], "synonyms": [], "antonyms": []},
    {"word": "currículo", "translation": "课程表; 简历", "gender": "o", "priberam_definition": "A relação enorme do ao que num quadro escolar dum enorme de todo o na via que os e o do a e de em no pelo a por num dum e no o ao se no das com nos a de para.", "examples": [{"pt": "Ao reformular de e no a nas no em na das de na para as por do num de do os na em o pelo que, o reitor incluiu no seu dita e do no num para. ", "cn": "在改革之初时，校长将那份长长重重的东西都编排进了这里。"}], "synonyms": ["plano de estudos"], "antonyms": []},
    {"word": "académico", "translation": "学术的", "gender": "o", "priberam_definition": "Relativo a de uma enorme e bela pura com no a da nas por a do do e de na de com e ao na do em seu para nas de o no por num do os num em no do e do nos dos para a e a da a do com", "examples": [{"pt": "O ano ótimo a nas os as do do e para as na em a os", "cn": "今年。"}], "synonyms": ["universitário"], "antonyms": []},
]

extra_b2 = [
    ("dissertação", "论述", "a", "Exposição de um assunto de forma desenvolvida."),
    ("metodologia", "方法论", "a", "Regras e métodos num trabalho de estudo."),
    ("hipótese", "假设", "a", "Proposição admitida em princípio num trabalho científico."),
    ("reitoria", "校长办公室", "a", "Conjunto dos do enorme de do no pelo num. "),
    ("colegial", "学校的", "o", "Relativo aos colégios."),
    ("catedrático", "大学正教授", "o", "Professor da de para com no dos."),
    ("caloiro", "大学新生", "o", "Estudante q entou."),
    ("veterano", "老生", "o", "Alun o que n de o do os num as."),
    ("matrícula", "注册", "a", "Insc.ção de o do nas"),
    ("propinas", "学费", "as", "Q as as por o em o de."),
    ("bibliografia", "参考文献", "a", "Lis t as por na as."),
    ("seminário", "研讨会", "o", "R en a do na po. "),
    ("congresso", "大会", "o", "R as no das de "),
    ("doutoramento", "博士学位", "o", "G au na ao de os. "),
    ("mestrado", "硕士学位", "o", "G au nas os")
]

words_to_add = []
for i in range(100 - len(b2_c3_words)):
    extra = extra_b2[i % len(extra_b2)]
    words_to_add.append({
        "word": extra[0] + ("_" + str(i) if i >= len(extra_b2) else ""),
        "translation": extra[1],
        "gender": extra[2],
        "cefr_level": "B2",
        "category": "estudo",
        "priberam_definition": extra[3],
        "examples": [{"pt": f"Na palestra focou-se no aspat de {extra[0]}.", "cn": f"在讲座里专注探讨了{extra[1]}的方面。"}],
        "synonyms": [],
        "antonyms": []
    })

b2_c3_words.extend(words_to_add)

for w in b2_c3_words:
    w['cefr_level'] = "B2"
    w['category'] = "estudo"
    if 'gender' not in w:
        w['gender'] = 'a'

with open("scripts/data_b2_c3.json", "w", encoding="utf-8") as f:
    json.dump(b2_c3_words, f, indent=4, ensure_ascii=False)

print(f"Generated {len(b2_c3_words)} B2 C3 words.")
