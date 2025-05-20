
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
    
    // Configurar para pré-carregamento
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
    
    // Iniciar carregamento
    audio.src = audioUrl;
    audio.load();
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
  
  // Inicie o pré-carregamento em segundo plano
  preloadAudio(audioUrl).catch(() => {});
  
  return null;
};

/**
 * Pré-carrega uma lista de URLs de áudio
 * @param audioUrls Lista de URLs de áudio para pré-carregar
 */
export const preloadAudioBatch = (audioUrls: string[]): void => {
  // Limitar o número de pré-carregamentos simultâneos
  const batchSize = 3;
  
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
