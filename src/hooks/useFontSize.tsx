
import { useState, useEffect } from 'react';

const FONT_SIZE_KEY = 'article-font-size';
const DEFAULT_FONT_SIZE = 16;
const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 22;
const FONT_SIZE_STEP = 1;

export const useFontSize = () => {
  const [fontSize, setFontSize] = useState(() => {
    // Try to retrieve saved font size from localStorage
    if (typeof window !== 'undefined') {
      const savedSize = localStorage.getItem(FONT_SIZE_KEY);
      return savedSize ? parseInt(savedSize, 10) : DEFAULT_FONT_SIZE;
    }
    return DEFAULT_FONT_SIZE;
  });

  useEffect(() => {
    // Save font size to localStorage and apply to CSS
    localStorage.setItem(FONT_SIZE_KEY, fontSize.toString());
    
    // Apply font size to CSS variable for global access
    document.documentElement.style.setProperty('--article-font-size', `${fontSize}px`);
    
    // Add styles to target only the article content text
    const styleEl = document.getElementById('font-size-style') || document.createElement('style');
    styleEl.id = 'font-size-style';
    styleEl.textContent = `
      .legal-article-content p, 
      .legal-article-section p,
      .legal-article-content {
        font-size: ${fontSize}px;
      }
    `;
    
    if (!document.getElementById('font-size-style')) {
      document.head.appendChild(styleEl);
    }
    
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
