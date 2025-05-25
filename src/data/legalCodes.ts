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
        explanation: "Este artigo define o objetivo e a natureza jurídica do CDC, estabelecendo que suas normas são de ordem pública e interesse social, o que significa que não podem ser derrogadas por acordo entre as partes.",
        practicalExample: "Na prática, isso significa que mesmo que um consumidor 'concorde' com uma cláusula abusiva em um contrato, ela pode ser declarada nula pelo Judiciário, pois as normas do CDC são de ordem pública."
      },
      {
        id: "cdc-art-2",
        number: "Art. 2º",
        content: "Consumidor é toda pessoa física ou jurídica que adquire ou utiliza produto ou serviço como destinatário final.",
        paragraphs: [
          "Parágrafo único. Equipara-se a consumidor a coletividade de pessoas, ainda que indetermináveis, que haja intervindo nas relações de consumo."
        ],
        explanation: "Este artigo define o conceito de consumidor, elemento essencial para aplicação do CDC. O conceito de 'destinatário final' é fundamental para caracterizar a relação de consumo.",
        practicalExample: "Uma pessoa que compra um carro para uso pessoal é consumidor. Já uma empresa que compra computadores para revender não é consumidor final. Porém, se essa mesma empresa compra computadores para uso próprio (não para revenda), pode ser considerada consumidor."
      },
      {
        id: "cdc-art-3",
        number: "Art. 3º",
        content: "Fornecedor é toda pessoa física ou jurídica, pública ou privada, nacional ou estrangeira, bem como os entes despersonalizados, que desenvolvem atividade de produção, montagem, criação, construção, transformação, importação, exportação, distribuição ou comercialização de produtos ou prestação de serviços.",
        paragraphs: [
          "§ 1º Produto é qualquer bem, móvel ou imóvel, material ou imaterial.",
          "§ 2º Serviço é qualquer atividade fornecida no mercado de consumo, mediante remuneração, inclusive as de natureza bancária, financeira, de crédito e securitária, salvo as decorrentes das relações de caráter trabalhista."
        ],
        explanation: "Este artigo define fornecedor e conceitua produto e serviço, completando os elementos necessários para caracterizar uma relação de consumo.",
        practicalExample: "São fornecedores: lojas, bancos, prestadores de serviços, profissionais liberais quando atuam com habitualidade. Produtos incluem desde bens físicos até softwares. Serviços incluem desde consultas médicas até serviços bancários."
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
        explanation: "Este artigo define o escopo da CLT, estabelecendo que ela regula tanto as relações individuais (entre empregado e empregador) quanto as coletivas (envolvendo sindicatos) de trabalho.",
        practicalExample: "As relações individuais incluem contratos de trabalho, salários, férias. As relações coletivas abrangem negociações sindicais, acordos e convenções coletivas de trabalho."
      },
      {
        id: "clt-art-2",
        number: "Art. 2º",
        content: "Considera-se empregador a empresa, individual ou coletiva, que, assumindo os riscos da atividade econômica, admite, assalaria e dirige a prestação pessoal de serviço.",
        paragraphs: [
          "§ 1º Equiparam-se ao empregador, para os efeitos exclusivos da relação de emprego, os profissionais liberais, as instituições de beneficência, as associações recreativas ou outras instituições sem fins lucrativos, que admitirem trabalhadores como empregados.",
          "§ 2º Sempre que uma ou mais empresas, tendo, embora, cada uma delas, personalidade jurídica própria, estiverem sob a direção, controle ou administração de outra, ou ainda quando, mesmo guardando cada uma sua autonomia, integrem grupo econômico, serão responsáveis solidariamente pelas obrigações decorrentes da relação de emprego."
        ],
        explanation: "Este artigo define empregador e estabelece o conceito de grupo econômico, fundamental para determinar responsabilidades trabalhistas.",
        practicalExample: "Se uma empresa do grupo econômico não conseguir pagar os direitos trabalhistas, o empregado pode cobrar de qualquer outra empresa do mesmo grupo. Isso protege o trabalhador contra manobras para fugir das obrigações trabalhistas."
      },
      {
        id: "clt-art-3",
        number: "Art. 3º",
        content: "Considera-se empregado toda pessoa física que prestar serviços de natureza não eventual a empregador, sob a dependência deste e mediante salário.",
        explanation: "Este artigo define empregado, estabelecendo os requisitos essenciais: pessoa física, não eventualidade, dependência (subordinação) e salário (onerosidade).",
        practicalExample: "Um motorista que trabalha todos os dias para uma empresa, seguindo horários e ordens (subordinação) e recebendo salário fixo é empregado. Já um motorista de aplicativo, que define seus próprios horários, é considerado autônomo."
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
        explanation: "Este artigo estabelece o princípio fundamental do ECA: a proteção integral, que significa que crianças e adolescentes devem ter todos os seus direitos garantidos de forma prioritária e absoluta.",
        practicalExample: "Na prática, isso significa que em qualquer situação, os direitos da criança e do adolescente devem ser priorizados, como em casos de separação dos pais, onde o bem-estar da criança é o fator determinante."
      },
      {
        id: "eca-art-2",
        number: "Art. 2º",
        content: "Considera-se criança, para os efeitos desta Lei, a pessoa até doze anos de idade incompletos, e adolescente aquela entre doze e dezoito anos de idade.",
        paragraphs: [
          "Parágrafo único. Nos casos expressos em lei, aplica-se excepcionalmente este Estatuto às pessoas entre dezoito e vinte e um anos de idade."
        ],
        explanation: "Este artigo define as faixas etárias que determinam a aplicação do ECA, diferenciando criança de adolescente para fins de aplicação de medidas específicas.",
        practicalExample: "Um menor de 12 anos que comete ato infracional recebe medidas diferentes de um adolescente de 16 anos. Jovens entre 18 e 21 anos podem ser beneficiados pelo ECA em situações específicas, como cumprimento de medida socioeducativa iniciada na adolescência."
      },
      {
        id: "eca-art-3",
        number: "Art. 3º",
        content: "A criança e o adolescente gozam de todos os direitos fundamentais inerentes à pessoa humana, sem prejuízo da proteção integral de que trata esta Lei, assegurando-se-lhes, por lei ou por outros meios, todas as oportunidades e facilidades, a fim de lhes facultar o desenvolvimento físico, mental, moral, espiritual e social, em condições de liberdade e de dignidade.",
        explanation: "Este artigo estabelece que crianças e adolescentes têm todos os direitos fundamentais dos adultos, mais direitos específicos decorrentes de sua condição de pessoas em desenvolvimento.",
        practicalExample: "Além dos direitos básicos como vida e liberdade, crianças e adolescentes têm direitos específicos como educação obrigatória e gratuita, proteção contra trabalho infantil, e atendimento médico prioritário."
      },
      {
        id: "eca-art-4",
        number: "Art. 4º",
        content: "É dever da família, da comunidade, da sociedade em geral e do poder público assegurar, com absoluta prioridade, a efetivação dos direitos referentes à vida, à saúde, à alimentação, à educação, ao esporte, ao lazer, à profissionalização, à cultura, à dignidade, ao respeito, à liberdade e à convivência familiar e comunitária.",
        paragraphs: [
          "Parágrafo único. A garantia de prioridade compreende:",
          "a) primazia de receber proteção e socorro em quaisquer circunstâncias;",
          "b) precedência de atendimento nos serviços públicos ou de relevância pública;",
          "c) preferência na formulação e na execução das políticas sociais públicas;",
          "d) destinação privilegiada de recursos públicos nas áreas relacionadas com a proteção à infância e à juventude."
        ],
        explanation: "Este artigo estabelece a responsabilidade compartilhada de todos os setores da sociedade na proteção de crianças e adolescentes, definindo o que significa 'absoluta prioridade'.",
        practicalExample: "Na fila de um hospital, crianças têm atendimento prioritário. Em orçamentos públicos, programas voltados para infância e juventude devem ter prioridade na destinação de recursos."
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
      }
    ]
  },
  {
    id: "codigo-de-processo-civil",
    title: "Código de Processo Civil",
    shortTitle: "CPC",
    description: "Lei nº 13.105, de 16 de março de 2015",
    category: "código",
    articles: [
      {
        id: "cpc-art-1",
        number: "Art. 1º",
        content: "O processo civil será ordenado, disciplinado e interpretado conforme os valores e as normas fundamentais estabelecidos na Constituição da República Federativa do Brasil, observando-se as disposições deste Código.",
        explanation: "Este artigo consagra a constitucionalização do processo civil brasileiro, estabelecendo que todo o sistema processual deve ser interpretado à luz dos princípios e valores constitucionais.",
        practicalExample: "Na prática, um juiz pode invalidar um ato processual que, embora formalmente previsto no CPC, viole garantias constitucionais como o devido processo legal ou a ampla defesa."
      }
    ]
  },
  {
    id: "codigo-de-processo-penal",
    title: "Código de Processo Penal",
    shortTitle: "CPP",
    description: "Decreto-Lei nº 3.689, de 3 de outubro de 1941",
    category: "código",
    articles: []
  },
  {
    id: "codigo-tributario-nacional",
    title: "Código Tributário Nacional",
    shortTitle: "CTN",
    description: "Lei nº 5.172, de 25 de outubro de 1966",
    category: "código",
    articles: []
  },
  {
    id: "codigo-eleitoral",
    title: "Código Eleitoral",
    shortTitle: "CE",
    description: "Lei nº 4.737, de 15 de julho de 1965",
    category: "código",
    articles: []
  },
  {
    id: "codigo-de-transito-brasileiro",
    title: "Código de Trânsito Brasileiro",
    shortTitle: "CTB",
    description: "Lei nº 9.503, de 23 de setembro de 1997",
    category: "código",
    articles: []
  },
  {
    id: "estatuto-do-idoso",
    title: "Estatuto do Idoso",
    shortTitle: "Lei do Idoso",
    description: "Lei nº 10.741, de 1º de outubro de 2003",
    category: "estatuto",
    articles: []
  },
  {
    id: "estatuto-da-oab",
    title: "Estatuto da OAB",
    shortTitle: "EOAB",
    description: "Lei nº 8.906, de 4 de julho de 1994",
    category: "estatuto",
    articles: []
  },
  {
    id: "estatuto-da-pessoa-com-deficiencia",
    title: "Estatuto da Pessoa com Deficiência",
    shortTitle: "EPD",
    description: "Lei nº 13.146, de 6 de julho de 2015",
    category: "estatuto",
    articles: []
  },
  {
    id: "estatuto-da-cidade",
    title: "Estatuto da Cidade",
    shortTitle: "ECid",
    description: "Lei nº 10.257, de 10 de julho de 2001",
    category: "estatuto",
    articles: []
  },
  {
    id: "estatuto-da-igualdade",
    title: "Estatuto da Igualdade Racial",
    shortTitle: "EIg",
    description: "Lei nº 12.288, de 20 de julho de 2010",
    category: "estatuto",
    articles: []
  },
  {
    id: "estatuto-do-desarmamento",
    title: "Estatuto do Desarmamento",
    shortTitle: "EDes",
    description: "Lei nº 10.826, de 22 de dezembro de 2003",
    category: "estatuto",
    articles: []
  },
  {
    id: "estatuto-do-torcedor",
    title: "Estatuto do Torcedor",
    shortTitle: "ETor",
    description: "Lei nº 10.671, de 15 de maio de 2003",
    category: "estatuto",
    articles: []
  },
  {
    id: "lei-de-execucao-penal",
    title: "Lei de Execução Penal",
    shortTitle: "LEP",
    description: "Lei nº 7.210, de 11 de julho de 1984",
    category: "lei",
    articles: []
  },
  {
    id: "lei-de-drogas",
    title: "Lei de Drogas",
    shortTitle: "LD",
    description: "Lei nº 11.343, de 23 de agosto de 2006",
    category: "lei",
    articles: []
  },
  {
    id: "lei-de-improbidade-administrativa",
    title: "Lei de Improbidade Administrativa",
    shortTitle: "LIA",
    description: "Lei nº 8.429, de 2 de junho de 1992",
    category: "lei",
    articles: []
  },
  {
    id: "lei-maria-da-penha",
    title: "Lei Maria da Penha",
    shortTitle: "LMP",
    description: "Lei nº 11.340, de 7 de agosto de 2006",
    category: "lei",
    articles: []
  },
  {
    id: "lei-de-licitacoes",
    title: "Lei de Licitações",
    shortTitle: "LL",
    description: "Lei nº 14.133, de 1º de abril de 2021",
    category: "lei",
    articles: []
  },
  {
    id: "lei-de-diretrizes-e-bases-da-educacao",
    title: "Lei de Diretrizes e Bases da Educação",
    shortTitle: "LDB",
    description: "Lei nº 9.394, de 20 de dezembro de 1996",
    category: "lei",
    articles: []
  },
  {
    id: "lei-de-introducao-as-normas-do-direito-brasileiro",
    title: "Lei de Introdução às Normas do Direito Brasileiro",
    shortTitle: "LINDB",
    description: "Decreto-Lei nº 4.657, de 4 de setembro de 1942",
    category: "lei",
    articles: []
  }
];
