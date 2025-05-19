
import { useState, useEffect } from 'react';

const FONT_SIZE_KEY = 'article-font-size';
const DEFAULT_FONT_SIZE = 16;
const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 22;
const FONT_SIZE_STEP = 1;

export const useFontSize = () => {
  const [fontSize, setFontSize] = useState(() => {
    // Tenta recuperar o tamanho da fonte salvo no localStorage
    if (typeof window !== 'undefined') {
      const savedSize = localStorage.getItem(FONT_SIZE_KEY);
      return savedSize ? parseInt(savedSize, 10) : DEFAULT_FONT_SIZE;
    }
    return DEFAULT_FONT_SIZE;
  });

  useEffect(() => {
    // Salva o tamanho da fonte no localStorage e aplica ao CSS
    localStorage.setItem(FONT_SIZE_KEY, fontSize.toString());
    
    // Aplica o tamanho da fonte à variável CSS para acesso global
    document.documentElement.style.setProperty('--article-font-size', `${fontSize}px`);
    
    // Aplica também linha-height proporcional ao tamanho da fonte
    document.documentElement.style.setProperty('--article-line-height', `${fontSize * 1.8}px`);
    
    console.log('Font size updated:', fontSize);
    
  }, [fontSize]);

  const increaseFontSize = () => {
    console.log('Increasing font size');
    setFontSize(prevSize => {
      const newSize = Math.min(prevSize + FONT_SIZE_STEP, MAX_FONT_SIZE);
      console.log('New font size:', newSize);
      return newSize;
    });
  };

  const decreaseFontSize = () => {
    console.log('Decreasing font size');
    setFontSize(prevSize => {
      const newSize = Math.max(prevSize - FONT_SIZE_STEP, MIN_FONT_SIZE);
      console.log('New font size:', newSize);
      return newSize;
    });
  };

  return {
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    minFontSize: MIN_FONT_SIZE,
    maxFontSize: MAX_FONT_SIZE
  };
};

export default useFontSize;
