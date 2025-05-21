
/**
 * Formats time in seconds to MM:SS format
 */
export const formatTime = (time: number): string => {
  if (!time || isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

/**
 * Categorizes a legal code into one of four standard categories
 */
export const categorizeLegalCode = (codeId: string): 'códigos' | 'estatutos' | 'constituição' | 'leis' => {
  const lowerCodeId = codeId.toLowerCase();
  
  if (lowerCodeId.includes('codigo') || lowerCodeId.includes('code') || lowerCodeId.includes('cc') || lowerCodeId.includes('cp') || lowerCodeId.includes('cpc')) {
    return 'códigos';
  }
  
  if (lowerCodeId.includes('constituicao') || lowerCodeId.includes('cf')) {
    return 'constituição';
  }
  
  if (lowerCodeId.includes('estatuto') || lowerCodeId.includes('eca') || lowerCodeId.includes('idoso')) {
    return 'estatutos';
  }
  
  return 'leis';
};

/**
 * Get icon type for a legal code category
 */
export const getLegalCodeIcon = (codeId: string, iconSize = 'h-5 w-5') => {
  const lowerCodeId = codeId.toLowerCase();
  
  if (lowerCodeId.includes('civil') || lowerCodeId.includes('cc')) {
    return <span className={`${iconSize} text-blue-400`}>📘</span>;
  }
  
  if (lowerCodeId.includes('penal') || lowerCodeId.includes('cp')) {
    return <span className={`${iconSize} text-red-400`}>⚖️</span>;
  }
  
  if (lowerCodeId.includes('constituicao') || lowerCodeId.includes('cf')) {
    return <span className={`${iconSize} text-amber-400`}>📜</span>;
  }
  
  if (lowerCodeId.includes('trabalho') || lowerCodeId.includes('clt')) {
    return <span className={`${iconSize} text-green-400`}>👷</span>;
  }
  
  if (lowerCodeId.includes('tributario') || lowerCodeId.includes('ctn')) {
    return <span className={`${iconSize} text-purple-400`}>💰</span>;
  }
  
  return <span className={`${iconSize} text-gray-400`}>📋</span>;
};
