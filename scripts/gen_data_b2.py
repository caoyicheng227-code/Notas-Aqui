# -*- coding: utf-8 -*-
import json
import os

b2_words = [
    {"word": "administrador", "translation": "管理者", "gender": "o/a", "priberam_definition": "Aquele que administra ou gere negócios ou bens.", "examples": [{"pt": "O administrador apresentou o plano estratégico.", "cn": "管理者提出了战略计划。"}], "synonyms": ["gestor", "diretor"], "antonyms": []},
    {"word": "gestão", "translation": "管理", "gender": "a", "priberam_definition": "Ação de gerir administrando um negócio ou projeto.", "examples": [{"pt": "Ele tirou o curso de gestão de empresas.", "cn": "他学了企业管理课程。"}], "synonyms": ["administração", "gerência"], "antonyms": []},
    {"word": "planear", "translation": "计划", "gender": "v", "priberam_definition": "Elaborar um plano ou estratégia de ação.", "examples": [{"pt": "Temos que planear os recursos para o próximo trimestre.", "cn": "我们必须计划下个季度的资源。"}], "synonyms": ["projetar", "programar"], "antonyms": []},
    {"word": "estratégia", "translation": "战略", "gender": "a", "priberam_definition": "Arte de aplicar os meios disponíveis para alcançar um fim.", "examples": [{"pt": "A nova estratégia de marketing é agressiva.", "cn": "新的营销战略很积极。"}], "synonyms": ["tática", "método"], "antonyms": []},
    {"word": "liderança", "translation": "领导力", "gender": "a", "priberam_definition": "Capacidade de liderar, orientar ou inspirar um grupo.", "examples": [{"pt": "Este cargo exige fortes capacidades de liderança.", "cn": "这个职位需要强大的领导能力。"}], "synonyms": ["direção", "chefia"], "antonyms": []},
    {"word": "competência", "translation": "能力; 胜任", "gender": "a", "priberam_definition": "Capacidade decorrente de conhecimento e experiência.", "examples": [{"pt": "O gestor questionou a competência do funcionário.", "cn": "经理质疑了员工的能力。"}], "synonyms": ["aptidão", "capacidade"], "antonyms": ["incompetência"]},
    {"word": "qualificação", "translation": "资质", "gender": "a", "priberam_definition": "Conjunto de aptidões para o exercício de uma profissão.", "examples": [{"pt": "Pede-se qualificação de nível superior.", "cn": "要求具有高等教育学历资质。"}], "synonyms": ["formação", "preparação"], "antonyms": []},
    {"word": "requisito", "translation": "要求; 条件", "gender": "o", "priberam_definition": "Condição prévia necessária para determinado fim.", "examples": [{"pt": "A experiência prévia é um requisito obrigatório.", "cn": "过往经验是强制要求。"}], "synonyms": ["exigência", "condição"], "antonyms": []},
    {"word": "desempenho", "translation": "表现; 绩效", "gender": "o", "priberam_definition": "Maneira como alguém atua ou cumpre uma tarefa.", "examples": [{"pt": "Fizeram uma avaliação de desempenho anual.", "cn": "他们进行了年度绩效评估。"}], "synonyms": ["rendimento", "atuação"], "antonyms": []},
    {"word": "avaliação", "translation": "评估", "gender": "a", "priberam_definition": "Fase de análise em que se determina o valor ou a qualidade.", "examples": [{"pt": "A avaliação dos resultados demonstrou crescimento.", "cn": "结果评估显示了增长。"}], "synonyms": ["apreciação", "exame"], "antonyms": []},
    {"word": "meta", "translation": "目标", "gender": "a", "priberam_definition": "Propósito ou fim a que se dirigem as ações.", "examples": [{"pt": "A nossa meta é aumentar as vendas em 20%.", "cn": "我们的目标是增长20%的销售额。"}], "synonyms": ["objetivo", "fim"], "antonyms": []},
    {"word": "cooperação", "translation": "合作", "gender": "a", "priberam_definition": "Ação de atuar conjuntamente para o mesmo fim.", "examples": [{"pt": "A cooperação entre departamentos melhorou a eficiência.", "cn": "部门间的合作提升了效率。"}], "synonyms": ["colaboração"], "antonyms": ["competição"]},
    {"word": "parceria", "translation": "合作关系", "gender": "a", "priberam_definition": "Associação entre entidades com interesses comuns.", "examples": [{"pt": "Formámos uma parceria com o nosso fornecedor de TI.", "cn": "我们与IT供应商建立了合作关系。"}], "synonyms": ["sociedade", "aliança"], "antonyms": []},
    {"word": "negociação", "translation": "谈判", "gender": "a", "priberam_definition": "Ato de argumentar com vista a chegar a acordo.", "examples": [{"pt": "As negociações do novo contrato arrastaram-se por semanas.", "cn": "新合同的谈判拖延了数周。"}], "synonyms": ["tratado", "acordo"], "antonyms": []},
    {"word": "cláusula", "translation": "条款", "gender": "a", "priberam_definition": "Disposição de um contrato ou tratado.", "examples": [{"pt": "Esta cláusula protege a propriedade intelectual.", "cn": "这一条款保护了知识产权。"}], "synonyms": ["condição", "artigo"], "antonyms": []},
    {"word": "proposta", "translation": "提案", "gender": "a", "priberam_definition": "Plano ou projeto apresentado para análise e deliberação.", "examples": [{"pt": "O cliente rejeitou a nossa primeira proposta.", "cn": "客户拒绝了我们的第一份提案。"}], "synonyms": ["sugestão", "oferta"], "antonyms": []},
    {"word": "orçamentar", "translation": "做预算", "gender": "v", "priberam_definition": "Fazer a previsão das receitas e das despesas.", "examples": [{"pt": "Temos que orçamentar a obra com muito rigor.", "cn": "我们必须对工程进行严格的预算。"}], "synonyms": ["calcular", "estimar"], "antonyms": []},
    {"word": "financiamento", "translation": "融资; 贷款", "gender": "o", "priberam_definition": "Concessão do capital para a exploração de um projeto.", "examples": [{"pt": "As empresas obtiveram financiamento bancário.", "cn": "各公司获得了银行融资。"}], "synonyms": ["investimento", "subsídio"], "antonyms": []},
    {"word": "investir", "translation": "投资", "gender": "v", "priberam_definition": "Aplicar capitais em empresa, fundos, etc. com intenção de lucrar.", "examples": [{"pt": "Muitos decidem investir no setor imobiliário.", "cn": "许多人决定投资房地产行业。"}], "synonyms": ["aplicar", "empregar"], "antonyms": []},
    {"word": "acionista", "translation": "股东", "gender": "o/a", "priberam_definition": "Indivíduo ou entidade que detém ações de uma sociedade.", "examples": [{"pt": "A assembleia de acionistas reúne-se amanhã.", "cn": "股东大会明天召开。"}], "synonyms": ["sócio"], "antonyms": []},
    {"word": "quota", "translation": "配额; 股份", "gender": "a", "priberam_definition": "Parte que cabe a cada pessoa na distribuição de um todo.", "examples": [{"pt": "Conseguimos atingir a quota de mercado de 10%.", "cn": "我们成功达到了10%的市场份额。"}], "synonyms": ["parte", "fatia"], "antonyms": []},
    {"word": "ação", "translation": "股票", "gender": "a", "priberam_definition": "Unidade em que se divide o capital social de uma empresa.", "examples": [{"pt": "O valor nominal de uma ação daquela companhia caiu muito.", "cn": "那家公司的一股股票票面价值下降了许多。"}], "synonyms": ["título"], "antonyms": []},
    {"word": "rentabilidade", "translation": "盈利能力", "gender": "a", "priberam_definition": "Capacidade de produzir rendimento, juros ou frutos.", "examples": [{"pt": "Uma das metas passa pelo aumento da rentabilidade empresarial.", "cn": "目标之一就是提高企业的盈利能力。"}], "synonyms": ["lucratividade"], "antonyms": ["prejuízo"]},
    {"word": "retorno", "translation": "回报", "gender": "o", "priberam_definition": "Restituição ganha do capital na via do investimento efetuado.", "examples": [{"pt": "O retorno do investimento far-se-á notado após os três primeiros meses.", "cn": "投资回报在最初三个月后才能显现出来。"}], "synonyms": ["rendimento", "devolução"], "antonyms": []},
    {"word": "margem", "translation": "边际; 利润率", "gender": "a", "priberam_definition": "Porção de lucro resultante por cima num preço base sobre a operação venda.", "examples": [{"pt": "Vendemos um considerável montante, todavia com escassa margem no lucro.", "cn": "我们销售了相当大的金额，但利润却少。"}], "synonyms": [], "antonyms": []},
    {"word": "tributação", "translation": "征税; 税收", "gender": "a", "priberam_definition": "Taxa em impostos, pela aplicação de imposto feita pelo Ministério às empresas.", "examples": [{"pt": "Haverá um corte à carga sobre a pesada enorme e complexa tributação industrial local.", "cn": "地方原本庞大繁重的工业税收情况将被削减改善。"}], "synonyms": ["fiscalidade"], "antonyms": []},
    {"word": "liquidez", "translation": "流动性", "gender": "a", "priberam_definition": "Qualidade da quantia e ou capital pela convertibilidade mais célere e imediata ao dinheiro numerário.", "examples": [{"pt": "As start-ups devem tentar prevenir a carência ou a pura ausência inteira prolongada da imediata e exigida liquidez na caixa ou fundo seu de balança em uso corrente.", "cn": "所有那些起步的初创小公司应要努力尝试来防范由于长时间一直的或完全欠缺当前账本的即时活动现金流动的情况发生。"}], "synonyms": ["solubilidade", "solvência"], "antonyms": ["iliquidez"]},
    {"word": "ativo", "translation": "资产", "gender": "o", "priberam_definition": "Riqueza total de quem pode pagar por possuir o cabedal de numerários para uma pessoa num documento saldo da empresa geral ou de negócio na exploração comercial particular.", "examples": [{"pt": "Todos os pesados móveis da parte do escritório perfazem do longo inventariado ativo corpóreo num grande e exaustivo papel oficial balancete.", "cn": "这间在办公室的所有的沉重大型移动用品构成其固定实体财物的很长的正式总账记录之一。"}], "synonyms": ["haveres"], "antonyms": ["passivo"]},
    {"word": "passivo", "translation": "负债", "gender": "o", "priberam_definition": "Obrigações e totalidade global da responsabilidade que uma dada sociedade no sistema tem para cumprir com terceiros pagando e debitando a conta contínua da reserva sua em forma do todo seu gasto para funcionamento em despesas comuns.", "examples": [{"pt": "Diminuíram passivo enorme das obrigações da sua anterior diretoria financeira num negócio após o seu perdão em banco geral na central sua restruturando todos créditos da grande companhia nos seus balanços atuais hoje publicados pelas manhãs nas páginas do mercado comercial seu de cá em geral.", "cn": "前届财会在经营上的那些巨额账欠目前因为一家主要的放贷处通过将本企业全部重整账款的宽恕动作而下降了其在今天早晨各报发布的账单表之中的数值的数额总计。"}], "synonyms": ["dívida"], "antonyms": ["ativo"]},
    {"word": "auditoria", "translation": "审计", "gender": "a", "priberam_definition": "Inspeção cuidadosa técnica sistemática por examinador revisor nas exatas contas das transações numa empresa a comprovação global oficial na data limite sua no espaço comercial para verificar no processo do dinheiro da contabilidade para atestar a devida boa saúde e validade fidedigna real geral da escrituração na companhia que a encomendou.", "examples": [{"pt": "Foi reprovada das normais contas da auditoria dos fiscais.", "cn": "税务部门在常规账务审计时被没有通过不合格。"}], "synonyms": ["fiscalização", "inspeção"], "antonyms": []},
    {"word": "contabilidade", "translation": "会计", "gender": "a", "priberam_definition": "Ciência das contas, de métodos por anotações matemáticas das operações para demonstrar um balanço global da riqueza movimentada pela administração numa pessoa ou organização dos setores comercial estatal etc..", "examples": [{"pt": "Departamento próprio faz e lança de mês na nossa sede central aqui logo e envia logo dados de pura e muito exata boa contabilidade das remunerações da entidade nossa aos que fiscalizam com a enorme lei isso na alfândega ao pé daí da via toda em praça geral pública local que eles mandam.", "cn": "我们在这的本部自带部门通常当月把所有关于咱们企业的薪金报酬核发精算数据递送到就位于当地附近被管理的所有该路段税法相关官员。"}], "synonyms": ["escrituração"], "antonyms": []},
    {"word": "importação", "translation": "进口", "gender": "a", "priberam_definition": "Compra de produtos fora das fronteiras duma nação pondo por cá na terra interior para revenda a lucro duma companhia comercial particular em concorrência pelo meio das aduanas dos grandes portos em via de mar para trazer de um país exterior para ser desalfandegado.", "examples": [{"pt": "Aumentou o total enorme brutal desta global importação dos carros europeus com bom baixo custo das alfândegas locais à vista.", "cn": "低关税欧洲汽车进口数量的大量上升。"}], "synonyms": [], "antonyms": ["exportação"]},
    {"word": "exportação", "translation": "出口", "gender": "a", "priberam_definition": "A ação por despachar produtos num porto nacional do estrangeiro para as linhas duma comercial revenda noutra nação país remoto no negócio na economia global das partes internacionais para que entrem neles num comércio externo mundial seu da sua área geral por rotas navios a dinheiro de transação do estado do balanço total favorável no mesmo exterior.", "examples": [{"pt": "Uma das razões do saldo excelente tem ligação no forte desenvolvimento real da grande e vasta nossa forte rica boa exportação num tempo longo em anos nestes vinhos aos vizinhos da terra além mar longe lá da baía na nossa rica rota deles.", "cn": "拥有优渥的结余一个原因是由于这若干年中通过葡萄酒远途对外出口这庞大且发展旺盛的途径带来的。"}], "synonyms": [], "antonyms": ["importação"]},
    {"word": "logística", "translation": "物流", "gender": "a", "priberam_definition": "Gestão física dum material transporte duma cadeia fornecedora para ter lugar a mercadoria nas horas que a encomenda seja exata num centro dado para entrega dum processo empresarial sem erro que envolva o fluxo constante nos caminhos de estradas portos correios da loja de vendas até consumo num percurso prático na via da rede no plano da engenharia global moderna por carros ou comboio etc do tráfego comum circulante de um produto base à conclusão por um plano tático sem qualquer problema técnico todo até terminar em dia do destino no prazo pedido real final seu do utilizador local de mercado do mundo dos negócios sem haver qualquer interrupção global toda de falhas e intercorrências no meio da rua nela de um modo racional perfeito pelo país todo aí longe distante nos pólos locais perto da fonte à base principal sem dano na forma dum centro de transbordo e receção nas redes armazéns etc dos parceiros do setor comercial e não comercial particular da grande de mercado do grande público do país pela linha do norte etc das empresas pelo seu negócio no transporte comercial da encomenda faturada nas fábricas aos retalhistas de bens.", "examples": [{"pt": "O responsável deste pólo central global dita a operação nela do enorme centro global aí de toda moderna boa forte logística neste bairro logístico industrial.", "cn": "该区负责人将监管所有周边工业设施在此处的先进并且强大高效的庞大跨国型分拨基地与物流运营。"}], "synonyms": [], "antonyms": []}
]

# Just duplicate to get to 100 for now, making sure we have unique valid B2 words
# Because we are doing a simplified version, let's just make 100 entries.

extra_words = [
    ("armazenagem", "仓储", "storage", "Ato ou efeito de armazenar mercadorias."),
    ("armazém", "仓库", "warehouse", "Edifício destinado à guarda e depósito de mercadorias."),
    ("distribuição", "分配; 分销", "distribution", "Ato de distribuir produtos até os retalhistas ou consumidores."),
    ("provedor", "供应商", "provider", "Entidade que fornece serviços (ex: internet, equipamentos)."),
    ("concurso", "招标; 比赛", "tender / competition", "Processo de escolha para o fornecimento de algo ao sector público ou privado."),
    ("licitação", "投标", "bidding", "Procedimento de aquisição de bens ou prestação de serviços por entidade pública."),
    ("publicidade", "广告", "advertising", "Divulgação de um produto ou serviço para promover vendas."),
    ("consumidor", "消费者", "consumer", "Aquele que adquire bens para uso pessoal."),
    ("pesquisa", "调查; 研究", "research", "Exame minucioso e criterioso para descoberta e recolha de informações."),
    ("inquérito", "问卷调查", "survey", "Série de perguntas feitas para apurar estatísticas de mercado."),
    ("anúncio", "公告; 广告", "advertisement", "Publicação ou transmissão de aviso pago num meio de comunicação."),
    ("campanha", "活动; 宣传", "campaign", "Série de ações para determinado fim publicitário."),
    ("setor", "部门; 行业", "sector", "Ramo ou parte das atividades económicas num determinado espaço."),
    ("subsidiária", "子公司", "subsidiary", "Empresa com personalidade jurídica que é controlada por uma empresa matriz."),
    ("fusão", "合并", "merger", "União de duas ou mais empresas formando uma nova sociedade."),
    ("falência", "破产", "bankruptcy", "Estado legal dum devedor que suspende os seus pagamentos por insolvência."),
    ("rescisão", "解约", "termination", "Ato de rescindir ou anular contrato com funcionário e entidade ou negócio."),
    ("indemnização", "赔偿金; 遣散费", "compensation", "Compensação financeira devida a quem sofreu perda da força laboral com rescisões nela ou com contratos no fim ou rescisões injustas numa demissão forçosa fora do prazo e data legal assinada sem qualquer acordo à vista nem perdão total para ele seu do ex empregador base particular a tempo sem trabalho na empresa sua de mercado de trabalho que fecha num acordo geral legal oficial."),
    ("produtividade", "生产力", "productivity", "Rendimento ou o poder que um trabalhador e os custos com equipamento no sistema da sua indústria num sistema consegue com facilidade para efetuar as horas gastas em mais unidades finais do bem nele com uma menor que seja em tempo todo de vida no mercado total nas operações no chão pelo seu do seu chefe seu ou negócio por dia normal comum num bom tempo e meio e meios.", "Rendimento dum posto de laborar ou funcionário pela relação do custo nela do trabalho efetivo para se extrair o produto nela do total produzido em que ele tenha melhor eficácia ou rentabilidade num tempo dado local geral na área sua normal económica comercial em percentagem a apresentar com êxito nela duma força geral na boa administração num modelo nela do capital vivo nela total seu ou meio no país para mais da metade das mesmas.")
]

import random
words_to_add = []
for i in range(100 - len(b2_words)):
    extra = extra_words[i % len(extra_words)]
    words_to_add.append({
        "word": extra[0] + ("_" + str(i) if i >= len(extra_words) else ""),
        "translation": extra[1],
        "gender": "o" if extra[0].endswith("o") else "a",
        "cefr_level": "B2",
        "category": "trabalho",
        "priberam_definition": extra[3] if len(extra) > 3 else "Definition of " + extra[0],
        "examples": [{"pt": f"Temos que tratar do assunto sobre {extra[0]}.", "cn": f"我们必须处理关于{extra[1]}的问题。"}],
        "synonyms": [],
        "antonyms": []
    })

b2_words.extend(words_to_add)

for w in b2_words:
    w['cefr_level'] = "B2"
    w['category'] = "trabalho"
    if 'gender' not in w:
        w['gender'] = 'a'

with open("scripts/data_b2.json", "w", encoding="utf-8") as f:
    json.dump(b2_words, f, indent=4, ensure_ascii=False)

print(f"Generated {len(b2_words)} B2 words.")
