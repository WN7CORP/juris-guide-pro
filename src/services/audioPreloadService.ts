
/**
 * Serviço para pré-carregar arquivos de áudio
 */

// Cache de áudios pré-carregados
const audioCache: Record<string, HTMLAudioElement> = {};

/**
 * Pré-carrega um arquivo de áudio e o armazena em cache
 * @param audioUrl URL do arquivo de áudio
 * @returns Promise que resolve quando o áudio estiver carregado
 */
export const preloadAudio = (audioUrl: string): Promise<HTMLAudioElement> => {
  // Se o áudio já estiver em cache, retorne-o
  if (audioCache[audioUrl]) {
    return Promise.resolve(audioCache[audioUrl]);
  }

  return new Promise((resolve, reject) => {
    const audio = new Audio();
    
    // Configurar para pré-carregamento prioritário
    audio.preload = 'auto';
    
    // Eventos para monitorar o carregamento
    audio.addEventListener('canplaythrough', () => {
      audioCache[audioUrl] = audio;
      resolve(audio);
    }, { once: true });
    
    audio.addEventListener('error', (error) => {
      console.error('Erro ao pré-carregar áudio:', error);
      reject(error);
    }, { once: true });
    
    // Iniciar carregamento com prioridade alta
    audio.src = audioUrl;
    audio.load();

    // Timeout para evitar espera infinita
    setTimeout(() => {
      if (!audioCache[audioUrl]) {
        // Se ainda não carregou, resolve com o que temos
        audioCache[audioUrl] = audio;
        resolve(audio);
      }
    }, 5000);
  });
};

/**
 * Obtém um áudio do cache ou o carrega se não estiver disponível
 * @param audioUrl URL do arquivo de áudio
 * @returns O elemento de áudio ou null se não estiver disponível
 */
export const getAudio = (audioUrl: string): HTMLAudioElement | null => {
  if (audioCache[audioUrl]) {
    // Clone o áudio para permitir múltiplas reproduções simultâneas
    const audio = new Audio();
    audio.src = audioUrl;
    
    // Copiar propriedades relevantes
    if (audioCache[audioUrl].volume) {
      audio.volume = audioCache[audioUrl].volume;
    }
    
    return audio;
  }
  
  // Inicie o pré-carregamento em segundo plano com alta prioridade
  preloadAudio(audioUrl).catch(() => {});
  
  return null;
};

/**
 * Pré-carrega uma lista de URLs de áudio
 * @param audioUrls Lista de URLs de áudio para pré-carregar
 */
export const preloadAudioBatch = (audioUrls: string[]): void => {
  // Limitar o número de pré-carregamentos simultâneos
  const batchSize = 5; // Aumentado para melhorar velocidade
  
  // Função para carregar em lotes
  const loadBatch = (urls: string[], startIndex: number) => {
    const batch = urls.slice(startIndex, startIndex + batchSize);
    
    if (batch.length === 0) return;
    
    // Carregar o lote atual
    const promises = batch.map(url => preloadAudio(url).catch(() => null));
    
    Promise.all(promises).then(() => {
      // Carregar o próximo lote quando este terminar
      loadBatch(urls, startIndex + batchSize);
    });
  };
  
  // Iniciar o carregamento do primeiro lote
  loadBatch(audioUrls, 0);
};

/**
 * Limpa o cache de áudios
 */
export const clearAudioCache = (): void => {
  Object.keys(audioCache).forEach(key => {
    audioCache[key].src = '';
    delete audioCache[key];
  });
};

/**
 * Pré-carrega áudios com base na proximidade do conteúdo atual
 * @param currentArticleId ID do artigo atual
 * @param audioMap Mapa de IDs de artigo para URLs de áudio
 */
export const preloadProximityAudio = (
  currentArticleId: string,
  audioMap: Record<string, string>
): void => {
  // Carrega o áudio do artigo atual primeiro
  if (audioMap[currentArticleId]) {
    preloadAudio(audioMap[currentArticleId]).catch(() => {});
  }
  
  // Depois carrega os próximos 5 artigos
  const articleIds = Object.keys(audioMap);
  const currentIndex = articleIds.indexOf(currentArticleId);
  
  if (currentIndex !== -1) {
    // Carrega os próximos 5 artigos
    const nextArticles = articleIds.slice(currentIndex + 1, currentIndex + 6);
    nextArticles.forEach(id => {
      preloadAudio(audioMap[id]).catch(() => {});
    });
  }
};
