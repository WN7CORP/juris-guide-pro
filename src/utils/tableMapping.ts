
// Map component ids to Supabase table names
export enum LegalCodeTable {
  CODIGO_PENAL = 'Código_Penal',
  CODIGO_CIVIL = 'Código_Civil',
  CODIGO_PROCESSO_CIVIL = 'Código_de_Processo_Civil',
  CODIGO_PROCESSO_PENAL = 'Código_de_Processo_Penal',
  CODIGO_DEFESA_CONSUMIDOR = 'Código_de_Defesa_do_Consumidor',
  CONSTITUICAO_FEDERAL = 'Constituicao_Federal',
  CLT = 'Consolidacao_das_Leis_do_Trabalho',
  CODIGO_TRIBUTARIO_NACIONAL = 'Código_Tributário_Nacional',
  ESTATUTO_CRIANCA_ADOLESCENTE = 'Estatuto_da_Criança_e_do_Adolescente',
  LEI_EXECUCAO_PENAL = 'Lei_de_Execução_Penal',
  LEI_DROGAS = 'Lei_de_Drogas',
  ESTATUTO_IDOSO = 'Estatuto_do_Idoso',
  CODIGO_ELEITORAL = 'Código_Eleitoral',
  LEI_IMPROBIDADE_ADMINISTRATIVA = 'Lei de Improbidade Administrativa',
  CODIGO_TRANSITO_BRASILEIRO = 'Código_de_Trânsito_Brasileiro',
  LEI_MARIA_PENHA = 'Lei_Maria_da_Penha',
  ESTATUTO_OAB = 'Estatuto_da_OAB',
  LEI_LICITACOES = 'Lei_de_Licitações',
  ESTATUTO_PESSOA_DEFICIENCIA = 'Estatuto_da_Pessoa_com_Deficiência',
  LEI_DIRETRIZES_EDUCACAO = 'Lei_de_diretrizes_e-bases_da_educação_nacional',
  LEI_INTRODUCAO_DIREITO_BRASILEIRO = 'Lei_de_Introdução_às_Normas_do_Direito_Brasileiro',
  // New Statute Tables
  ESTATUTO_CIDADE = 'Estatuto_da_Cidade',
  ESTATUTO_IGUALDADE = 'Estatuto_da_Igualdade_Racial',
  ESTATUTO_DESARMAMENTO = 'Estatuto_do_Desarmamento',
  ESTATUTO_TORCEDOR = 'Estatuto_do_Torcedor'
}

// List of known tables to query - we need to convert the enum values to strings
export const KNOWN_TABLES: string[] = Object.values(LegalCodeTable);

type TableMap = Record<string, string>;

// All statute tables for easier filtering
export const STATUTE_TABLES = [
  LegalCodeTable.ESTATUTO_CRIANCA_ADOLESCENTE,
  LegalCodeTable.ESTATUTO_IDOSO,
  LegalCodeTable.ESTATUTO_OAB,
  LegalCodeTable.ESTATUTO_PESSOA_DEFICIENCIA,
  // New Statute Tables
  LegalCodeTable.ESTATUTO_CIDADE,
  LegalCodeTable.ESTATUTO_IGUALDADE,
  LegalCodeTable.ESTATUTO_DESARMAMENTO,
  LegalCodeTable.ESTATUTO_TORCEDOR
];

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
  'lei-de-introducao-as-normas-do-direito-brasileiro': LegalCodeTable.LEI_INTRODUCAO_DIREITO_BRASILEIRO,
  // New Statute URLs
  'estatuto-da-cidade': LegalCodeTable.ESTATUTO_CIDADE,
  'estatuto-da-igualdade': LegalCodeTable.ESTATUTO_IGUALDADE,
  'estatuto-do-desarmamento': LegalCodeTable.ESTATUTO_DESARMAMENTO,
  'estatuto-do-torcedor': LegalCodeTable.ESTATUTO_TORCEDOR
};

// Helper function to check if a table is a statute
export const isStatuteTable = (tableName: string): boolean => {
  return STATUTE_TABLES.includes(tableName as any);
};

/**
 * Função melhorada para obter o ID da URL a partir do nome da tabela
 * Com debug detalhado para identificar problemas de mapeamento
 */
export const getUrlIdFromTableName = (tableName: string): string | null => {
  if (!tableName || typeof tableName !== 'string') {
    console.error("❌ getUrlIdFromTableName: tableName inválido:", tableName);
    return null;
  }
  
  console.log("🔍 getUrlIdFromTableName: Procurando URL ID para tabela:", tableName);
  
  // Mapeamento direto melhorado para casos específicos
  const directMapping: Record<string, string> = {
    'Código_Penal': 'codigo-penal',
    'Código_Civil': 'codigo-civil',
    'Código_de_Processo_Civil': 'codigo-de-processo-civil',
    'Código_de_Processo_Penal': 'codigo-de-processo-penal',
    'Código_de_Defesa_do_Consumidor': 'codigo-de-defesa-do-consumidor',
    'Constituicao_Federal': 'constituicao-federal',
    'Consolidacao_das_Leis_do_Trabalho': 'clt',
    'Código_Tributário_Nacional': 'codigo-tributario-nacional',
    'Estatuto_da_Criança_e_do_Adolescente': 'estatuto-da-crianca-e-do-adolescente',
    'Lei_de_Execução_Penal': 'lei-de-execucao-penal',
    'Lei_de_Drogas': 'lei-de-drogas',
    'Estatuto_do_Idoso': 'estatuto-do-idoso',
    'Código_Eleitoral': 'codigo-eleitoral',
    'Lei de Improbidade Administrativa': 'lei-de-improbidade-administrativa',
    'Código_de_Trânsito_Brasileiro': 'codigo-de-transito-brasileiro',
    'Lei_Maria_da_Penha': 'lei-maria-da-penha',
    'Estatuto_da_OAB': 'estatuto-da-oab',
    'Lei_de_Licitações': 'lei-de-licitacoes',
    'Estatuto_da_Pessoa_com_Deficiência': 'estatuto-da-pessoa-com-deficiencia',
    'Lei_de_diretrizes_e-bases_da_educação_nacional': 'lei-de-diretrizes-e-bases-da-educacao',
    'Lei_de_Introdução_às_Normas_do_Direito_Brasileiro': 'lei-de-introducao-as-normas-do-direito-brasileiro',
    'Estatuto_da_Cidade': 'estatuto-da-cidade',
    'Estatuto_da_Igualdade_Racial': 'estatuto-da-igualdade',
    'Estatuto_do_Desarmamento': 'estatuto-do-desarmamento',
    'Estatuto_do_Torcedor': 'estatuto-do-torcedor'
  };
  
  // Primeiro tenta o mapeamento direto
  if (directMapping[tableName]) {
    console.log("✅ Mapeamento direto encontrado:", directMapping[tableName]);
    return directMapping[tableName];
  }
  
  // Procura direta pela entrada no tableNameMap
  const directMatch = Object.entries(tableNameMap).find(([urlId, table]) => table === tableName);
  if (directMatch) {
    console.log("✅ Match direto encontrado:", directMatch[0]);
    return directMatch[0];
  }
  
  // Se não encontrou match direto, tenta normalizar e comparar
  const normalizedTableName = tableName.toLowerCase().replace(/[^a-z0-9]/g, '');
  console.log("🔍 Tentando match normalizado para:", normalizedTableName);
  
  for (const [urlId, table] of Object.entries(tableNameMap)) {
    const normalizedTable = table.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalizedTable === normalizedTableName) {
      console.log("✅ Match normalizado encontrado:", urlId);
      return urlId;
    }
  }
  
  // Debug adicional: listar todas as opções disponíveis
  console.error("❌ Nenhum match encontrado para:", tableName);
  console.log("📋 Opções disponíveis no mapeamento direto:", Object.keys(directMapping));
  console.log("📋 Opções disponíveis no tableNameMap:", Object.entries(tableNameMap));
  
  return null;
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
