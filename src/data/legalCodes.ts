
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
    id: "codigo-de-defesa-do-consumidor",
    title: "Código de Defesa do Consumidor",
    shortTitle: "CDC",
    description: "Lei nº 8.078, de 11 de setembro de 1990",
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
    id: "clt",
    title: "Consolidação das Leis do Trabalho",
    shortTitle: "CLT",
    description: "Decreto-Lei nº 5.452, de 1º de maio de 1943",
    category: "código",
    articles: []
  },
  {
    id: "estatuto-da-crianca-e-do-adolescente",
    title: "Estatuto da Criança e do Adolescente",
    shortTitle: "ECA",
    description: "Lei nº 8.069, de 13 de julho de 1990",
    category: "estatuto",
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
  // New Statutes
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
    title: "Estatuto da Igualdade",
    shortTitle: "EIg",
    description: "Lei nº 12.288, de 20 de julho de 2010",
    category: "estatuto",
    articles: []
  },
  {
    id: "estatuto-da-terra",
    title: "Estatuto da Terra",
    shortTitle: "ETer",
    description: "Lei nº 4.504, de 30 de novembro de 1964",
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
    id: "estatuto-dos-servidores",
    title: "Estatuto dos Servidores",
    shortTitle: "ESer",
    description: "Lei nº 8.112, de 11 de dezembro de 1990",
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
