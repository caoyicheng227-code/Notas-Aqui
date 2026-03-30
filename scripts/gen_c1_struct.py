import json

c1_data = {
    "id": "C1_DAPLE_REAL_COMPLETO",
    "level": "C1",
    "title": "C1 (DAPLE - Prova Oficial Completa)",
    "parts": [
        {
            "id": "p1_1",
            "type": "leitura_longa",
            "title": "PARTE 1 // Questões 1-5",
            "instruction": "Leia o texto e escolha uma das opções (A, B ou C) para as questões 1-5.",
            "text": "1 Os telemóveis mudaram a nossa vida [linha 1].\n\n5 Em primeiro lugar, eles [linha 5]...\n\n10 Finalmente, percebemos que [linha 10]...\n\n(Texto longo placeholder para C1)",
            "questions": [
                {"id": "q1", "question": "1. O autor acha que:", "options": ["A", "B", "C"], "answer": 0},
                {"id": "q2", "question": "2. A palavra 'eles' (linha 5) refere-se a:", "options": ["A", "B", "C"], "answer": 1},
                {"id": "q3", "question": "3. O texto indica que:", "options": ["A", "B", "C"], "answer": 2},
                {"id": "q4", "question": "4. Segundo o parágrafo 3:", "options": ["A", "B", "C"], "answer": 0},
                {"id": "q5", "question": "5. A conclusão é que:", "options": ["A", "B", "C"], "answer": 1}
            ]
        },
        {
            "id": "p1_2",
            "type": "leitura_regras",
            "title": "PARTE 2 // Questões 6-15",
            "instruction": "Faça a correspondência entre as regras (A-E) e as situações (6-15).",
            "rules": [
                {"id": "A", "title": "REGRA A", "text": "Acesso reservado a funcionários."},
                {"id": "B", "title": "REGRA B", "text": "Proibido estacionar das 8h às 20h."},
                {"id": "C", "title": "REGRA C", "text": "Uso obrigatório de máscara."},
                {"id": "D", "title": "REGRA D", "text": "Silêncio absoluto na sala de leitura."},
                {"id": "E", "title": "REGRA E", "text": "Entrada permitida apenas a maiores de 18 anos."}
            ],
            "questions": [
                {"id": "q6", "question": "6. Quero levar o meu filho de 12 anos.", "answer": 4},
                {"id": "q7", "question": "7. Sou funcionário e quero entrar.", "answer": 0},
                {"id": "q8", "question": "8. Preciso de deitar o carro cá fora às 15h.", "answer": 1},
                {"id": "q9", "question": "9. Quero ler e fazer barulho.", "answer": 3},
                {"id": "q10", "question": "10. Não tenho máscara.", "answer": 2},
                {"id": "q11", "question": "11. Tenho 19 anos.", "answer": 4},
                {"id": "q12", "question": "12. Sou cliente e quero entrar na zona reservada.", "answer": 0},
                {"id": "q13", "question": "13. Quero estacionar às 21h.", "answer": 1},
                {"id": "q14", "question": "14. Quero falar ao telemóvel na biblioteca.", "answer": 3},
                {"id": "q15", "question": "15. Tenho máscara e quero entrar.", "answer": 2}
            ]
        },
        {
            "id": "p1_3",
            "type": "cloze_banco",
            "title": "PARTE 3 // Questões 16-20",
            "instruction": "Preencha os espaços em branco (16-20) com as frases (A-F). Há uma frase a mais.",
            "text": "A globalização tem efeitos em todo o mundo. [16]. No entanto, algumas tradições locais estão a desaparecer. [17]. Muitas pessoas acreditam que a economia beneficia com isto. [18]. Por outro lado, há quem critique este fenómeno. [19]. Seja como for, o futuro é incerto. [20].",
            "options": [
                {"id": "A", "text": "Assim, devemos proteger o nosso património."},
                {"id": "B", "text": "Isso nota-se principalmente nos grandes centros urbanos."},
                {"id": "C", "text": "Dizem que a cultura se torna homogénea."},
                {"id": "D", "text": "O comércio global aumenta as oportunidades financeiras."},
                {"id": "E", "text": "Nunca se sabe o que nos espera amanhã."},
                {"id": "F", "text": "A escola deve ensinar patriotismo."}
            ],
            "questions": [
                {"id": "q16", "answer": 1},
                {"id": "q17", "answer": 0},
                {"id": "q18", "answer": 3},
                {"id": "q19", "answer": 2},
                {"id": "q20", "answer": 4}
            ]
        },
        {
            "id": "p1_4",
            "type": "cloze_inline_mcq",
            "title": "PARTE 4 // Questões 21-35",
            "instruction": "Escolha a palavra correta (A, B, C ou D) para cada espaço.",
            "text": "Quando eu era criança, [21] muito de ir à praia. Lembro-me perfeitamente do dia em que [22] o mar pela primeira vez. Foi uma experiência [23] incrível. (Mais texto de placeholder...).",
            "questions": [
                {"id": "q21", "options": ["A. gosto", "B. gostava", "C. gostaria", "D. gostarei"], "answer": 1},
                {"id": "q22", "options": ["A. vejo", "B. via", "C. vi", "D. virei"], "answer": 2},
                {"id": "q23", "options": ["A. absolutamente", "B. absoluto", "C. absolver", "D. absolutos"], "answer": 0}
            ]
        },
        {
            "id": "p1_5",
            "type": "cloze_inline_open",
            "title": "PARTE 5 // Questões 36-50",
            "instruction": "Preencha os espaços com uma única palavra adequada.",
            "text": "O turismo [36] Portugal tem crescido [37] forma impressionante. [38] ano passado, batemos todos os recordes. (Mais texto placeholder...).",
            "questions": [
                {"id": "q36", "answer": "em"},
                {"id": "q37", "answer": "de"},
                {"id": "q38", "answer": "No"}
            ]
        },
        {
            "id": "p2",
            "type": "escrita",
            "title": "Produção e Interação Escritas",
            "instruction": "Realize as tarefas de produção escrita.",
            "text": "DAPLE Writing Placeholder",
            "text_blocks": []
        },
        {
            "id": "p3",
            "type": "audio",
            "title": "Compreensão Oral",
            "instruction": "Ouça o áudio e responda.",
            "audio_url": "/simulado/C1/CAPLE_C1_Audio.mp3",
            "audio_groups": [
                {
                    "title": "Texto 1",
                    "questions": [
                        {"id": "a1", "question": "1. Teste C1", "options": ["A", "B", "C"], "answer": 0}
                    ]
                }
            ]
        }
    ]
}

open('src/data/simulado_c1.json', 'w').write(json.dumps(c1_data, indent=4))
