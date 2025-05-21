// Map component ids to Supabase table names
export type LegalCodeTable = 
  'Código_Penal' | 
  'Código_Civil' | 
  'Código_de_Processo_Civil' | 
  'Código_de_Processo_Penal' | 
  'Código_de_Defesa_do_Consumidor' | 
  'Constituicao_Federal' |
  'CLT' |
  'Código_Tributário_Nacional' |
  'Estatuto_da_Criança_e_do_Adolescente' |
  'Lei_de_Execução_Penal' |
  'Lei_de_Drogas' |
  'Estatuto_do_Idoso' |
  'Código_Eleitoral' |
  'Lei_de_Improbidade_Administrativa' |
  'Código_de_Trânsito_Brasileiro' |
  'Lei_Maria_da_Penha' |
  'Estatuto_da_OAB' |
  'Lei_de_Licitações' |
  'Estatuto_da_Pessoa_com_Deficiência' |
  'Lei_de_Diretrizes_e_Bases_da_Educação';

type TableMap = Record<string, LegalCodeTable>;

export const tableNameMap: TableMap = {
  'codigo-penal': 'Código_Penal',
  'codigo-civil': 'Código_Civil',
  'codigo-de-processo-civil': 'Código_de_Processo_Civil',
  'codigo-de-processo-penal': 'Código_de_Processo_Penal',
  'codigo-de-defesa-do-consumidor': 'Código_de_Defesa_do_Consumidor',
  'constituicao-federal': 'Constituicao_Federal',
  'clt': 'CLT',
  'codigo-tributario-nacional': 'Código_Tributário_Nacional',
  'estatuto-da-crianca-e-do-adolescente': 'Estatuto_da_Criança_e_do_Adolescente',
  'lei-de-execucao-penal': 'Lei_de_Execução_Penal',
  'lei-de-drogas': 'Lei_de_Drogas',
  'estatuto-do-idoso': 'Estatuto_do_Idoso',
  'codigo-eleitoral': 'Código_Eleitoral',
  'lei-de-improbidade-administrativa': 'Lei_de_Improbidade_Administrativa',
  'codigo-de-transito-brasileiro': 'Código_de_Trânsito_Brasileiro',
  'lei-maria-da-penha': 'Lei_Maria_da_Penha',
  'estatuto-da-oab': 'Estatuto_da_OAB',
  'lei-de-licitacoes': 'Lei_de_Licitações',
  'estatuto-da-pessoa-com-deficiencia': 'Estatuto_da_Pessoa_com_Deficiência',
  'lei-de-diretrizes-e-bases-da-educacao': 'Lei_de_Diretrizes_e_Bases_da_Educação'
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
export const getTableNameFromUrlId = (urlId: string): LegalCodeTable | null => {
  if (!urlId || typeof urlId !== 'string') {
    return null;
  }
  
  return tableNameMap[urlId] || null;
};
