import React from 'react';

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
 * Função melhorada para identificar corretamente cada tipo de código
 */
export const categorizeLegalCode = (codeId: string): 'códigos' | 'estatutos' | 'constituição' | 'leis' => {
  const lowerCodeId = codeId.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  console.log("Categorizando código:", codeId, "normalizado:", lowerCodeId);
  
  // Constituição Federal
  if (lowerCodeId.includes('constituicao') || lowerCodeId.includes('cf') || 
      codeId.includes('Constituicao_Federal') || lowerCodeId.includes('constituicaofederal')) {
    console.log("Categorizado como: constituição");
    return 'constituição';
  }
  
  // Estatutos (verificação mais específica e abrangente)
  if (lowerCodeId.includes('estatuto') || 
      codeId.includes('Estatuto_') ||
      lowerCodeId.includes('eca') || 
      lowerCodeId.includes('idoso') ||
      lowerCodeId.includes('oab') ||
      lowerCodeId.includes('deficiencia') ||
      lowerCodeId.includes('cidade') ||
      lowerCodeId.includes('igualdade') ||
      lowerCodeId.includes('desarmamento') ||
      lowerCodeId.includes('torcedor') ||
      lowerCodeId.includes('criancaeadolescente') ||
      lowerCodeId.includes('pessoacomdeficiencia')) {
    console.log("Categorizado como: estatutos");
    return 'estatutos';
  }
  
  // Códigos principais (mais específico)
  if (lowerCodeId.includes('codigo') || 
      lowerCodeId.includes('code') || 
      lowerCodeId.includes('cc') || 
      lowerCodeId.includes('cp') || 
      lowerCodeId.includes('cpc') ||
      lowerCodeId.includes('civil') ||
      lowerCodeId.includes('penal') ||
      lowerCodeId.includes('processo') ||
      lowerCodeId.includes('consumidor') ||
      lowerCodeId.includes('tributario') ||
      lowerCodeId.includes('eleitoral') ||
      lowerCodeId.includes('transito') ||
      codeId.includes('Código_') ||
      lowerCodeId.includes('clt') ||
      lowerCodeId.includes('codigocivil') ||
      lowerCodeId.includes('codigopenal') ||
      lowerCodeId.includes('codigoprocessocivil') ||
      lowerCodeId.includes('codigoprocessopenal') ||
      lowerCodeId.includes('codigodefesaconsumidor') ||
      lowerCodeId.includes('codigotributarionacional') ||
      lowerCodeId.includes('codigoeleitoral') ||
      lowerCodeId.includes('codigotransito') ||
      codeId.includes('Consolidacao_das_Leis_do_Trabalho')) {
    console.log("Categorizado como: códigos");
    return 'códigos';
  }
  
  // Leis específicas (padrão)
  console.log("Categorizado como: leis (padrão)");
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

/**
 * Helper function to save search history
 */
export const saveSearchHistory = (searchTerm: string, resultsCount: number) => {
  if (!searchTerm.trim()) return;
  
  const history = getSearchHistory();
  const newEntry = {
    term: searchTerm,
    timestamp: new Date().toISOString(),
    resultsCount
  };
  
  // Remove duplicate if exists
  const filteredHistory = history.filter(entry => entry.term !== searchTerm);
  
  // Add new entry at the beginning and keep only last 10
  const updatedHistory = [newEntry, ...filteredHistory].slice(0, 10);
  
  localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
};

/**
 * Helper function to get search history
 */
export const getSearchHistory = () => {
  try {
    const history = localStorage.getItem('searchHistory');
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

/**
 * Helper function to clear search history
 */
export const clearSearchHistory = () => {
  localStorage.removeItem('searchHistory');
};
