
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
  'Lei_de_Execução_Penal';

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
