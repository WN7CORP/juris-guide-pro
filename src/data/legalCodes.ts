export type Article = {
  id: string;
  number: string;
  title?: string;
  content: string;
  paragraphs?: string[];
  items?: string[];
  explanation?: string;
  practicalExample?: string;
};

export type LegalCode = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  category: 'código' | 'estatuto' | 'lei' | 'constituição';
  articles: Article[];
};

export const legalCodes: LegalCode[] = [
  {
    id: "constituicao-federal",
    title: "Constituição Federal",
    shortTitle: "CF",
    description: "Constituição da República Federativa do Brasil de 1988",
    category: "constituição",
    articles: [
      {
        id: "cf-art-1",
        number: "Art. 1º",
        content: "A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem como fundamentos:",
        items: [
          "I - a soberania;",
          "II - a cidadania;",
          "III - a dignidade da pessoa humana;",
          "IV - os valores sociais do trabalho e da livre iniciativa;",
          "V - o pluralismo político."
        ],
        paragraphs: [
          "Parágrafo único. Todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente, nos termos desta Constituição."
        ],
        explanation: "Este artigo estabelece os fundamentos do Estado Brasileiro, definindo-o como uma República Federativa e um Estado Democrático de Direito. Os cinco incisos elencam os pilares fundamentais da organização política e social brasileira.",
        practicalExample: "Na prática, o inciso III (dignidade da pessoa humana) é frequentemente invocado em ações judiciais que discutem direitos fundamentais, como no caso de decisões do STF sobre direito à saúde, onde o tribunal decide que o Estado deve fornecer medicamentos de alto custo com base no princípio da dignidade humana."
      },
      {
        id: "cf-art-2",
        number: "Art. 2º",
        content: "São Poderes da União, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário.",
        explanation: "Este artigo consagra o princípio da separação dos poderes, estabelecendo os três poderes da República e determinando que devem ser independentes entre si, mas também harmônicos, funcionando em um sistema de freios e contrapesos.",
        practicalExample: "Na prática, quando o STF (Judiciário) julga a constitucionalidade de uma lei aprovada pelo Congresso (Legislativo), ou quando o Congresso Nacional aprecia vetos presidenciais (Executivo), temos exemplos do funcionamento do sistema de freios e contrapesos entre os poderes."
      },
      {
        id: "cf-art-3",
        number: "Art. 3º",
        content: "Constituem objetivos fundamentais da República Federativa do Brasil:",
        items: [
          "I - construir uma sociedade livre, justa e solidária;",
          "II - garantir o desenvolvimento nacional;",
          "III - erradicar a pobreza e a marginalização e reduzir as desigualdades sociais e regionais;",
          "IV - promover o bem de todos, sem preconceitos de origem, raça, sexo, cor, idade e quaisquer outras formas de discriminação."
        ],
        explanation: "Este artigo estabelece os objetivos primordiais do Estado Brasileiro, delineando metas e diretrizes que devem nortear todas as políticas públicas e ações governamentais.",
        practicalExample: "Programas sociais como o Bolsa Família e políticas de cotas raciais em universidades públicas são exemplos práticos de implementação dos objetivos de redução de desigualdades sociais (inciso III) e promoção do bem de todos sem discriminação (inciso IV)."
      },
      {
        id: "cf-art-5",
        number: "Art. 5º",
        content: "Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade, nos termos seguintes:",
        items: [
          "I - homens e mulheres são iguais em direitos e obrigações, nos termos desta Constituição;",
          "II - ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei;",
          "III - ninguém será submetido a tortura nem a tratamento desumano ou degradante;",
          "X - são invioláveis a intimidade, a vida privada, a honra e a imagem das pessoas, assegurado o direito a indenização pelo dano material ou moral decorrente de sua violação;",
          "XI - a casa é asilo inviolável do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, salvo em caso de flagrante delito ou desastre, ou para prestar socorro, ou, durante o dia, por determinação judicial;"
        ],
        explanation: "O artigo 5º é o núcleo dos direitos fundamentais no Brasil, estabelecendo o princípio da igualdade e elencando diversos direitos e garantias individuais. É considerado cláusula pétrea da Constituição.",
        practicalExample: "O inciso XI é aplicado quando a polícia precisa de mandado judicial para entrar em uma residência durante o dia, mas pode entrar sem mandado em caso de flagrante delito. O inciso X protege contra vazamento de dados pessoais e é base para ações de danos morais."
      }
    ]
  },
  {
    id: "codigo-civil",
    title: "Código Civil",
    shortTitle: "CC",
    description: "Lei nº 10.406, de 10 de janeiro de 2002",
    category: "código",
    articles: [
      {
        id: "cc-art-1",
        number: "Art. 1º",
        content: "Toda pessoa é capaz de direitos e deveres na ordem civil.",
        explanation: "Este artigo estabelece o princípio da personalidade civil, reconhecendo que toda pessoa, pelo simples fato de existir, é sujeito de direitos e obrigações na ordem jurídica.",
        practicalExample: "Na prática, mesmo um recém-nascido já pode ser titular de direitos, como receber uma herança ou ser beneficiário de um seguro de vida, embora precise ser representado para exercê-los."
      },
      {
        id: "cc-art-2",
        number: "Art. 2º",
        content: "A personalidade civil da pessoa começa do nascimento com vida; mas a lei põe a salvo, desde a concepção, os direitos do nascituro.",
        explanation: "Este artigo define o momento de início da personalidade civil (nascimento com vida), mas também protege certos direitos do nascituro (ser humano já concebido mas ainda não nascido).",
        practicalExample: "Um exemplo prático é o direito do nascituro de receber doações ou herança, que ficam condicionadas ao seu nascimento com vida. Outro exemplo é o direito a alimentos gravídicos, que podem ser pleiteados pela gestante para garantir uma gestação saudável."
      },
      {
        id: "cc-art-3",
        number: "Art. 3º",
        content: "São absolutamente incapazes de exercer pessoalmente os atos da vida civil os menores de 16 (dezesseis) anos.",
        explanation: "Este artigo estabelece a incapacidade civil absoluta para menores de 16 anos, que devem ser representados por seus pais ou responsáveis legais em todos os atos da vida civil.",
        practicalExample: "Um menor de 15 anos não pode assinar um contrato de compra e venda de um imóvel. Se o fizer, o ato será nulo. Seus pais ou responsáveis legais devem representá-lo em todos os atos jurídicos."
      },
      {
        id: "cc-art-4",
        number: "Art. 4º",
        content: "São incapazes, relativamente a certos atos ou à maneira de os exercer:",
        items: [
          "I - os maiores de dezesseis e menores de dezoito anos;",
          "II - os ébrios habituais e os viciados em tóxico;",
          "III - aqueles que, por causa transitória ou permanente, não puderem exprimir sua vontade;",
          "IV - os pródigos."
        ],
        explanation: "Este artigo trata da incapacidade relativa, onde a pessoa pode praticar certos atos, mas precisa de assistência para outros. Diferentemente da incapacidade absoluta, aqui há graduações.",
        practicalExample: "Um jovem de 17 anos pode trabalhar e receber salário (ato que pode praticar sozinho), mas precisa de assistência dos pais para se casar ou para vender um imóvel que possua."
      }
    ]
  },
  {
    id: "codigo-penal",
    title: "Código Penal",
    shortTitle: "CP",
    description: "Decreto-Lei nº 2.848, de 7 de dezembro de 1940",
    category: "código",
    articles: [
      {
        id: "cp-art-1",
        number: "Art. 1º",
        content: "Não há crime sem lei anterior que o defina. Não há pena sem prévia cominação legal.",
        explanation: "Este artigo estabelece o princípio da legalidade ou reserva legal, um dos pilares fundamentais do Direito Penal moderno. Significa que ninguém pode ser punido por algo que não era considerado crime no momento em que foi praticado.",
        practicalExample: "Se uma conduta não estava tipificada como crime quando foi praticada (por exemplo, antes da criação da Lei de Crimes Cibernéticos), não se pode punir retroativamente a pessoa que a praticou, mesmo que posteriormente a lei passe a considerar tal conduta como criminosa."
      },
      {
        id: "cp-art-121",
        number: "Art. 121",
        content: "Matar alguém:",
        paragraphs: [
          "Pena - reclusão, de seis a vinte anos.",
          "§ 1º Se o agente comete o crime impelido por motivo de relevante valor social ou moral, ou sob o domínio de violenta emoção, logo em seguida a injusta provocação da vítima, o juiz pode reduzir a pena de um sexto a um terço.",
          "§ 2º Se o homicídio é cometido: I - mediante paga ou promessa de recompensa, ou por outro motivo torpe; II - por motivo fútil; III - com emprego de veneno, fogo, explosivo, asfixia, tortura ou outro meio insidioso ou cruel, ou de que possa resultar perigo comum; IV - à traição, de emboscada, ou mediante dissimulação ou outro recurso que dificulte ou torne impossível a defesa do ofendido; V - para assegurar a execução, a ocultação, a impunidade ou vantagem de outro crime: Pena - reclusão, de doze a trinta anos."
        ],
        explanation: "Este é o tipo penal do homicídio, crime contra a vida. O caput trata do homicídio simples, o §1º do privilegiado e o §2º do qualificado, com penas diferentes conforme as circunstâncias.",
        practicalExample: "Homicídio simples: matar por ciúmes. Privilegiado: pai que mata o estuprador da filha (relevante valor moral). Qualificado: matar mediante paga (homicídio por encomenda) ou por motivo fútil (discussão de trânsito)."
      }
    ]
  },
  {
    id: "codigo-de-defesa-do-consumidor",
    title: "Código de Defesa do Consumidor",
    shortTitle: "CDC",
    description: "Lei nº 8.078, de 11 de setembro de 1990",
    category: "código",
    articles: [
      {
        id: "cdc-art-1",
        number: "Art. 1º",
        content: "O presente código estabelece normas de proteção e defesa do consumidor, de ordem pública e interesse social, nos termos dos arts. 5º, inciso XXXII, 170, inciso V, da Constituição Federal e art. 48 de suas Disposições Transitórias.",
        explanation: "Este artigo estabelece que o CDC é uma lei de ordem pública e interesse social, baseada na Constituição Federal, criando um sistema de proteção ao consumidor.",
        practicalExample: "Por ser de ordem pública, as normas do CDC não podem ser afastadas por acordo entre as partes. Isso significa que mesmo que um contrato diga o contrário, o consumidor sempre terá direito à garantia legal de 30 ou 90 dias."
      },
      {
        id: "cdc-art-2",
        number: "Art. 2º",
        content: "Consumidor é toda pessoa física ou jurídica que adquire ou utiliza produto ou serviço como destinatário final.",
        paragraphs: [
          "Parágrafo único. Equipara-se a consumidor a coletividade de pessoas, ainda que indetermináveis, que haja intervindo nas relações de consumo."
        ],
        explanation: "Define o conceito de consumidor como destinatário final do produto ou serviço, excluindo quem compra para revender ou usar como insumo em sua atividade profissional.",
        practicalExample: "Um padeiro que compra farinha para fazer pães não é consumidor (usa como insumo). Mas se ele compra uma TV para sua casa, é consumidor (destinatário final). Uma pessoa que compra um carro para uso pessoal é consumidor."
      },
      {
        id: "cdc-art-6",
        number: "Art. 6º",
        content: "São direitos básicos do consumidor:",
        items: [
          "I - a proteção da vida, saúde e segurança contra os riscos provocados por práticas no fornecimento de produtos e serviços considerados perigosos ou nocivos;",
          "II - a educação e divulgação sobre o consumo adequado dos produtos e serviços, asseguradas a liberdade de escolha e a igualdade nas contratações;",
          "III - a informação adequada e clara sobre os diferentes produtos e serviços, com especificação correta de quantidade, características, composição, qualidade, tributos incidentes e preço, bem como sobre os riscos que apresentem;",
          "IV - a proteção contra a publicidade enganosa e abusiva, métodos comerciais coercitivos ou desleais, bem como contra práticas e cláusulas abusivas ou impostas no fornecimento de produtos e serviços;",
          "V - a modificação das cláusulas contratuais que estabeleçam prestações desproporcionais ou sua revisão em razão de fatos supervenientes que as tornem excessivamente onerosas;",
          "VI - a efetiva prevenção e reparação de danos patrimoniais e morais, individuais, coletivos e difusos;",
          "VII - o acesso aos órgãos judiciários e administrativos com vistas à prevenção ou reparação de danos patrimoniais e morais, individuais, coletivos e difusos, assegurada a proteção Jurídica, administrativa e técnica aos necessitados;",
          "VIII - a facilitação da defesa de seus direitos, inclusive com a inversão do ônus da prova, a seu favor, no processo civil, quando, a critério do juiz, for verossímil a alegação ou quando for ele hipossuficiente, segundo as regras ordinárias de experiências;"
        ],
        explanation: "Este artigo é fundamental pois lista os direitos básicos do consumidor, sendo uma espécie de 'carta de direitos' que norteia toda a proteção consumerista no Brasil.",
        practicalExample: "Direito à informação (III): preços devem estar claros. Proteção contra publicidade enganosa (IV): propaganda que promete resultados impossíveis. Inversão do ônus da prova (VIII): em caso de defeito em produto, é a empresa que deve provar que não houve defeito."
      }
    ]
  },
  {
    id: "estatuto-da-crianca-e-do-adolescente",
    title: "Estatuto da Criança e do Adolescente",
    shortTitle: "ECA",
    description: "Lei nº 8.069, de 13 de julho de 1990",
    category: "estatuto",
    articles: [
      {
        id: "eca-art-1",
        number: "Art. 1º",
        content: "Esta Lei dispõe sobre a proteção integral à criança e ao adolescente.",
        explanation: "Estabelece o princípio da proteção integral, que significa que crianças e adolescentes devem ter prioridade absoluta na formulação de políticas públicas e na destinação de recursos.",
        practicalExample: "Na prática, isso significa que em situações de emergência, crianças devem ser atendidas primeiro. Em orçamentos públicos, programas voltados para crianças devem ter prioridade na destinação de verbas."
      },
      {
        id: "eca-art-2",
        number: "Art. 2º",
        content: "Considera-se criança, para os efeitos desta Lei, a pessoa até doze anos de idade incompletos, e adolescente aquela entre doze e dezoito anos de idade.",
        paragraphs: [
          "Parágrafo único. Nos casos expressos em lei, aplica-se excepcionalmente este Estatuto às pessoas entre dezoito e vinte e um anos de idade."
        ],
        explanation: "Define claramente as faixas etárias: criança (0 a 11 anos) e adolescente (12 a 17 anos), com possibilidade de aplicação até 21 anos em casos específicos.",
        practicalExample: "Um jovem de 20 anos que ainda esteja cumprindo medida socioeducativa iniciada quando adolescente continua sob a proteção do ECA. Um crime cometido por alguém com 11 anos será tratado como ato infracional, não crime."
      },
      {
        id: "eca-art-4",
        number: "Art. 4º",
        content: "É dever da família, da comunidade, da sociedade em geral e do poder público assegurar, com absoluta prioridade, a efetivação dos direitos referentes à vida, à saúde, à alimentação, à educação, ao esporte, ao lazer, à profissionalização, à cultura, à dignidade, ao respeito, à liberdade e à convivência familiar e comunitária.",
        explanation: "Estabelece a responsabilidade compartilhada entre família, sociedade e Estado na proteção de crianças e adolescentes, consagrando o princípio da prioridade absoluta.",
        practicalExample: "Se uma criança está sendo negligenciada pelos pais, a comunidade (vizinhos, escola) tem o dever de denunciar ao Conselho Tutelar. O Estado deve garantir vagas em creches e escolas como prioridade absoluta."
      }
    ]
  },
  {
    id: "clt",
    title: "Consolidação das Leis do Trabalho",
    shortTitle: "CLT",
    description: "Decreto-Lei nº 5.452, de 1º de maio de 1943",
    category: "código",
    articles: [
      {
        id: "clt-art-1",
        number: "Art. 1º",
        content: "Esta Consolidação estatui as normas que regulam as relações individuais e coletivas de trabalho, nela previstas.",
        explanation: "Artigo introdutório que estabelece o escopo da CLT, regulamentando tanto as relações individuais (empregado-empregador) quanto coletivas (sindicatos, greves, etc.) de trabalho.",
        practicalExample: "A CLT regula desde o contrato individual de trabalho (salário, jornada, férias) até as negociações coletivas entre sindicatos e empresas, estabelecendo direitos e deveres de ambas as partes."
      },
      {
        id: "clt-art-2",
        number: "Art. 2º",
        content: "Considera-se empregador a empresa, individual ou coletiva, que, assumindo os riscos da atividade econômica, admite, assalaria e dirige a prestação pessoal de serviço.",
        explanation: "Define o conceito de empregador, destacando elementos essenciais: assumir riscos da atividade, admitir, pagar salários e dirigir o trabalho do empregado.",
        practicalExample: "Uma loja que contrata vendedores é empregadora porque assume os riscos do negócio (se não vender, o prejuízo é dela), paga salários mensais e dirige como o trabalho deve ser feito (horários, metas, procedimentos)."
      },
      {
        id: "clt-art-3",
        number: "Art. 3º",
        content: "Considera-se empregado toda pessoa física que prestar serviços de natureza não eventual a empregador, sob a dependência deste e mediante salário.",
        explanation: "Define empregado através de elementos essenciais: pessoa física, não eventualidade, subordinação e onerosidade (salário). Estes são os pilares da relação de emprego.",
        practicalExample: "Um motorista que trabalha todos os dias para uma empresa, recebe ordens sobre rotas e horários, e ganha salário fixo é empregado. Um motorista de aplicativo, apesar de receber pagamento, não tem subordinação direta nem exclusividade."
      },
      {
        id: "clt-art-7",
        number: "Art. 7º",
        content: "Os preceitos constantes da presente Consolidação salvo quando for em cada caso, expressamente determinado em contrário, não se aplicam:",
        items: [
          "a) aos empregados domésticos, assim considerados, de um modo geral, os que prestam serviços de natureza não-econômica à pessoa ou à família, no âmbito residencial destas;",
          "b) aos trabalhadores rurais, assim considerados aqueles que, exercendo funções diretamente ligadas à agricultura e à pecuária, não sejam empregados em atividades que, pelos métodos de execução dos respectivos trabalhos ou pela finalidade de suas operações, se classifiquem como industriais ou comerciais;",
          "c) aos funcionários públicos da União, dos Estados e dos Municípios e aos respectivos extranumerários em serviço nas próprias repartições;",
          "d) aos servidores de autarquias paraestatais, desde que sujeitos a regime próprio de proteção ao trabalho que lhes assegure situação análoga à dos funcionários públicos."
        ],
        explanation: "Este artigo estabelece as exclusões da CLT, ou seja, categorias de trabalhadores que não se submetem às suas regras por terem legislação específica.",
        practicalExample: "Uma empregada doméstica não segue a CLT comum, mas sim a Lei Complementar 150/2015. Um funcionário público federal segue o regime estatutário (Lei 8.112/90), não a CLT."
      }
    ]
  }
];
