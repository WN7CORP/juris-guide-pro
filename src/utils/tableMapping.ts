// Map component ids to Supabase table names
export enum LegalCodeTable {
  CODIGO_PENAL = 'Código_Penal',
  CODIGO_CIVIL = 'Código_Civil',
  CODIGO_PROCESSO_CIVIL = 'Código_de_Processo_Civil',
  CODIGO_PROCESSO_PENAL = 'Código_de_Processo_Penal',
  CODIGO_DEFESA_CONSUMIDOR = 'Código_de_Defesa_do_Consumidor',
  CONSTITUICAO_FEDERAL = 'Constituicao_Federal',
  CLT = 'CLT',
  CODIGO_TRIBUTARIO_NACIONAL = 'Código_Tributário_Nacional',
  ESTATUTO_CRIANCA_ADOLESCENTE = 'Estatuto_da_Criança_e_do_Adolescente',
  LEI_EXECUCAO_PENAL = 'Lei_de_Execução_Penal',
  LEI_DROGAS = 'Lei_de_Drogas',
  ESTATUTO_IDOSO = 'Estatuto_do_Idoso',
  CODIGO_ELEITORAL = 'Código_Eleitoral',
  LEI_IMPROBIDADE_ADMINISTRATIVA = 'Lei_de_Improbidade_Administrativa',
  CODIGO_TRANSITO_BRASILEIRO = 'Código_de_Trânsito_Brasileiro',
  LEI_MARIA_PENHA = 'Lei_Maria_da_Penha',
  ESTATUTO_OAB = 'Estatuto_da_OAB',
  LEI_LICITACOES = 'Lei_de_Licitações',
  ESTATUTO_PESSOA_DEFICIENCIA = 'Estatuto_da_Pessoa_com_Deficiência',
  LEI_DIRETRIZES_EDUCACAO = 'Lei_de_Diretrizes_e_Bases_da_Educação',
  LEI_INTRODUCAO_DIREITO_BRASILEIRO = 'Lei_de_Introdução_às_Normas_do_Direito_Brasileiro'
}

// List of known tables to query - we need to convert the enum values to strings
export const KNOWN_TABLES: string[] = Object.values(LegalCodeTable);

type TableMap = Record<string, string>;

export const tableNameMap: TableMap = {
  'codigo-penal': LegalCodeTable.CODIGO_PENAL,
  'codigo-civil': LegalCodeTable.CODIGO_CIVIL,
  'codigo-de-processo-civil': LegalCodeTable.CODIGO_PROCESSO_CIVIL,
  'codigo-de-processo-penal': LegalCodeTable.CODIGO_PROCESSO_PENAL,
  'codigo-de-defesa-do-consumidor': LegalCodeTable.CODIGO_DEFESA_CONSUMIDOR,
  'constituicao-federal': LegalCodeTable.CONSTITUICAO_FEDERAL,
  'clt': LegalCodeTable.CLT,
  'codigo-tributario-nacional': LegalCodeTable.CODIGO_TRIBUTARIO_NACIONAL,
  'estatuto-da-crianca-e-do-adolescente': LegalCodeTable.ESTATUTO_CRIANCA_ADOLESCENTE,
  'lei-de-execucao-penal': LegalCodeTable.LEI_EXECUCAO_PENAL,
  'lei-de-drogas': LegalCodeTable.LEI_DROGAS,
  'estatuto-do-idoso': LegalCodeTable.ESTATUTO_IDOSO,
  'codigo-eleitoral': LegalCodeTable.CODIGO_ELEITORAL,
  'lei-de-improbidade-administrativa': LegalCodeTable.LEI_IMPROBIDADE_ADMINISTRATIVA,
  'codigo-de-transito-brasileiro': LegalCodeTable.CODIGO_TRANSITO_BRASILEIRO,
  'lei-maria-da-penha': LegalCodeTable.LEI_MARIA_PENHA,
  'estatuto-da-oab': LegalCodeTable.ESTATUTO_OAB,
  'lei-de-licitacoes': LegalCodeTable.LEI_LICITACOES,
  'estatuto-da-pessoa-com-deficiencia': LegalCodeTable.ESTATUTO_PESSOA_DEFICIENCIA,
  'lei-de-diretrizes-e-bases-da-educacao': LegalCodeTable.LEI_DIRETRIZES_EDUCACAO,
  'lei-de-introducao-as-normas-do-direito-brasileiro': LegalCodeTable.LEI_INTRODUCAO_DIREITO_BRASILEIRO
};

/**
 * Função para formatar URLs dos códigos
 * Ex: "Código Penal" -> "codigo-penal"
 */
export const formatCodeUrlId = (codeName: string): string => {
  if (!codeName || typeof codeName !== 'string') {
    return '';
  }
  
  return codeName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
};

/**
 * Função para obter o ID da tabela a partir de um ID de URL
 */
export const getTableNameFromUrlId = (urlId: string): string | null => {
  if (!urlId || typeof urlId !== 'string') {
    return null;
  }
  
  return tableNameMap[urlId] || null;
};
