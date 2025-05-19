
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
  articles: Article[];
};

export const legalCodes: LegalCode[] = [
  {
    id: "constituicao-federal",
    title: "Constituição Federal",
    shortTitle: "CF",
    description: "Constituição da República Federativa do Brasil de 1988",
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
    id: "codigo-processo-civil",
    title: "Código de Processo Civil",
    shortTitle: "CPC",
    description: "Lei nº 13.105, de 16 de março de 2015",
    articles: [
      {
        id: "cpc-art-1",
        number: "Art. 1º",
        content: "O processo civil será ordenado, disciplinado e interpretado conforme os valores e as normas fundamentais estabelecidos na Constituição da República Federativa do Brasil, observando-se as disposições deste Código.",
        explanation: "Este artigo consagra a constitucionalização do processo civil brasileiro, estabelecendo que todo o sistema processual deve ser interpretado à luz dos princípios e valores constitucionais.",
        practicalExample: "Na prática, um juiz pode invalidar um ato processual que, embora formalmente previsto no CPC, viole garantias constitucionais como o devido processo legal ou a ampla defesa."
      }
    ]
  }
];
