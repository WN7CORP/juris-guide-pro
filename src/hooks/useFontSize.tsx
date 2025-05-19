
import { useState, useEffect } from 'react';

const FONT_SIZE_KEY = 'article-font-size';
const DEFAULT_FONT_SIZE = 16;
const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 22;
const FONT_SIZE_STEP = 1;

export const useFontSize = () => {
  const [fontSize, setFontSize] = useState(() => {
    const savedSize = localStorage.getItem(FONT_SIZE_KEY);
    return savedSize ? parseInt(savedSize, 10) : DEFAULT_FONT_SIZE;
  });

  useEffect(() => {
    localStorage.setItem(FONT_SIZE_KEY, fontSize.toString());
    
    // Apply font size to CSS variable for global access
    document.documentElement.style.setProperty('--article-font-size', `${fontSize}px`);
    
  }, [fontSize]);

  const increaseFontSize = () => {
    setFontSize(prevSize => 
      Math.min(prevSize + FONT_SIZE_STEP, MAX_FONT_SIZE)
    );
  };

  const decreaseFontSize = () => {
    setFontSize(prevSize => 
      Math.max(prevSize - FONT_SIZE_STEP, MIN_FONT_SIZE)
    );
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
