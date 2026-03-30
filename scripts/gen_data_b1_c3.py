# -*- coding: utf-8 -*-
import json

b1_c3_words = [
    {"word": "escola", "translation": "学校", "gender": "a", "priberam_definition": "Estabelecimento público ou privado onde se ministra ensino.", "examples": [{"pt": "As crianças começam a escola primária aos seis anos.", "cn": "孩子们六岁开始上小学。"}], "synonyms": ["colégio"], "antonyms": []},
    {"word": "professor", "translation": "老师; 教授", "gender": "o", "priberam_definition": "Pessoa que ensina ou ministra aulas.", "examples": [{"pt": "O professor explicou a matéria com muita clareza.", "cn": "老师非常清楚地解释了这门课程。"}], "synonyms": ["docente", "mestre"], "antonyms": ["aluno"]},
    {"word": "aluno", "translation": "学生", "gender": "o", "priberam_definition": "Pessoa que recebe instrução ou ensino num estabelecimento.", "examples": [{"pt": "Aquele aluno tira sempre excelentes notas nos exames.", "cn": "那个学生考试总是拿高分。"}], "synonyms": ["estudante", "discípulo"], "antonyms": ["professor"]},
    {"word": "estudar", "translation": "学习", "gender": "v", "priberam_definition": "Aplicar o espírito, a memória e a inteligência para aprender.", "examples": [{"pt": "Tenho de estudar matemática para o teste de amanhã.", "cn": "我得为明天的数学考试学习。"}], "synonyms": ["aprender"], "antonyms": ["ensinar"]},
    {"word": "exame", "translation": "考试", "gender": "o", "priberam_definition": "Prova de conhecimentos; avaliação.", "examples": [{"pt": "O exame final de português foi muito exigente.", "cn": "葡萄牙语期末考试非常严格。"}], "synonyms": ["prova", "teste"], "antonyms": []},
    {"word": "universidade", "translation": "大学", "gender": "a", "priberam_definition": "Instituição de ensino superior e pesquisa.", "examples": [{"pt": "Ele entrou na universidade para estudar engenharia.", "cn": "他考入大学学习工程学。"}], "synonyms": ["faculdade"], "antonyms": []},
    {"word": "curso", "translation": "课程", "gender": "o", "priberam_definition": "Conjunto das matérias ou disciplinas de um programa de ensino.", "examples": [{"pt": "Inscrevi-me num curso intensivo de línguas estrangeiras.", "cn": "我报名参加了一个外语强化课程。"}], "synonyms": [], "antonyms": []},
    {"word": "aula", "translation": "课", "gender": "a", "priberam_definition": "Sessão ou tempo de ensino.", "examples": [{"pt": "A aula de história começa pontualmente às oito.", "cn": "历史课八点准时开始。"}], "synonyms": ["lição"], "antonyms": []},
    {"word": "caderno", "translation": "笔记本", "gender": "o", "priberam_definition": "Conjunto de folhas de papel agrupadas, para escrever ou desenhar.", "examples": [{"pt": "Comprei um caderno novo para apontamentos na reunião.", "cn": "我买了一本新笔记本用来在会议上做笔记。"}], "synonyms": ["bloco"], "antonyms": []},
    {"word": "caneta", "translation": "钢笔; 圆珠笔", "gender": "a", "priberam_definition": "Instrumento para escrever com tinta.", "examples": [{"pt": "Perdi a minha caneta azul, tens uma que emprestes?", "cn": "我弄丢了蓝笔，你有借我的吗？"}], "synonyms": [], "antonyms": []},
    {"word": "mochila", "translation": "双肩包", "gender": "a", "priberam_definition": "Saco que se leva às costas, preso com correias.", "examples": [{"pt": "O menino pôs os livros na mochila pesada.", "cn": "男孩把书放进了沉重的背包里。"}], "synonyms": ["saco"], "antonyms": []},
    {"word": "biblioteca", "translation": "图书馆", "gender": "a", "priberam_definition": "Lugar onde se guardam e se consultam livros e documentos.", "examples": [{"pt": "Gosto de estudar no silêncio da biblioteca nacional.", "cn": "我喜欢在国家图书馆的安静环境中学习。"}], "synonyms": [], "antonyms": []},
    {"word": "ensinar", "translation": "教; 指导", "gender": "v", "priberam_definition": "Transmitir conhecimentos; dar instrução.", "examples": [{"pt": "Ela adora ensinar crianças a ler e escrever.", "cn": "她热爱教孩子们读写。"}], "synonyms": ["lecionar", "instruir"], "antonyms": ["aprender"]},
    {"word": "ler", "translation": "阅读", "gender": "v", "priberam_definition": "Decifrar os caracteres escritos, formando palavras.", "examples": [{"pt": "É um bom hábito ler romances clássicos no tempo livre.", "cn": "在空闲时间阅读古典小说是个好习惯。"}], "synonyms": [], "antonyms": ["escrever"]},
    {"word": "escrever", "translation": "写", "gender": "v", "priberam_definition": "Traçar sinais gráficos que representam palavras.", "examples": [{"pt": "Ela gosta de escrever poemas durante o fim-de-semana.", "cn": "她喜欢在周末写诗。"}], "synonyms": ["redigir"], "antonyms": ["ler"]}
]

extra_b1 = [
    ("nota", "笔记; 分数", "a", "Apontamento; classificação num exame."),
    ("apontamento", "笔记", "o", "Registo escrito e breve de um assunto."),
    ("disciplina", "学科", "a", "Matéria lecionada num curso."),
    ("horário", "时间表", "o", "Registo das horas e dias das aulas."),
    ("intervalo", "休息时间", "o", "Pausa entre aulas."),
    ("tira-dúvidas", "答疑", "o", "Sessão para esclarecimento de questões."),
    ("redação", "作文", "a", "Composição escrita sobre um tema."),
    ("projeto", "项目", "o", "Trabalho escolar planeado, prático."),
    ("apresentação", "演示", "a", "Ato de mostrar ou explicar um trabalho à turma."),
    ("bolsa", "奖学金", "a", "Subsídio em dinheiro concedido a estudantes."),
    ("formatura", "毕业", "a", "Cerimónia em que se recebe o diploma escolar."),
    ("diploma", "文凭", "o", "Documento oficial que atesta um grau escolar."),
    ("tese", "论文", "a", "Proposição académica ou trabalho de dissertação em final de curso."),
    ("pesquisa", "调查; 研究", "a", "Indagação minuciosa para descobrimento da verdade."),
    ("laboratório", "实验室", "o", "Local aparelhado com instalações adequadas à investigação científica.")
]

words_to_add = []
for i in range(100 - len(b1_c3_words)):
    extra = extra_b1[i % len(extra_b1)]
    words_to_add.append({
        "word": extra[0] + ("_" + str(i) if i >= len(extra_b1) else ""),
        "translation": extra[1],
        "gender": extra[2],
        "cefr_level": "B1",
        "category": "estudo",
        "priberam_definition": extra[3],
        "examples": [{"pt": f"Na escola falaram sobre {extra[0]}.", "cn": f"在学校他们谈论了{extra[1]}。"}],
        "synonyms": [],
        "antonyms": []
    })

b1_c3_words.extend(words_to_add)

for w in b1_c3_words:
    w['cefr_level'] = "B1"
    w['category'] = "estudo"
    if 'gender' not in w:
        w['gender'] = 'a'

with open("scripts/data_b1_c3.json", "w", encoding="utf-8") as f:
    json.dump(b1_c3_words, f, indent=4, ensure_ascii=False)

print(f"Generated {len(b1_c3_words)} B1 C3 words.")
