// Free Dictionary API Service with localStorage caching

export interface DictionaryPhonetic {
  text?: string;
  audio?: string;
}

export interface DictionaryDefinition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics?: DictionaryPhonetic[];
  meanings: DictionaryMeaning[];
  sourceUrls?: string[];
}

export interface CachedWordData {
  word: string;
  definition: string | null;
  example: string | null;
  partOfSpeech: string | null;
  audioUrl: string | null;
  phonetic: string | null;
  fetchedAt: number;
  notFound: boolean;
}

const CACHE_KEY = 'spellingBeeDictionaryCache';
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Load cache from localStorage
function loadCache(): Record<string, CachedWordData> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error('Failed to load dictionary cache:', e);
  }
  return {};
}

// Save cache to localStorage
function saveCache(cache: Record<string, CachedWordData>): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error('Failed to save dictionary cache:', e);
  }
}

// Check if cached entry is still valid
function isCacheValid(entry: CachedWordData): boolean {
  return Date.now() - entry.fetchedAt < CACHE_EXPIRY_MS;
}

// Get cached word data
export function getCachedWord(word: string): CachedWordData | null {
  const cache = loadCache();
  const key = word.toLowerCase();
  const entry = cache[key];
  
  if (entry && isCacheValid(entry)) {
    return entry;
  }
  
  return null;
}

// Parse API response into simplified format
function parseApiResponse(data: DictionaryEntry[]): Omit<CachedWordData, 'fetchedAt'> {
  const entry = data[0];
  
  // Get the first definition and example
  let definition: string | null = null;
  let example: string | null = null;
  let partOfSpeech: string | null = null;
  
  for (const meaning of entry.meanings) {
    for (const def of meaning.definitions) {
      if (!definition) {
        definition = def.definition;
        partOfSpeech = meaning.partOfSpeech;
      }
      if (!example && def.example) {
        example = def.example;
      }
      if (definition && example) break;
    }
    if (definition && example) break;
  }
  
  // Get audio URL (prefer US English)
  let audioUrl: string | null = null;
  if (entry.phonetics) {
    for (const phonetic of entry.phonetics) {
      if (phonetic.audio) {
        audioUrl = phonetic.audio;
        // Prefer US audio
        if (phonetic.audio.includes('-us')) {
          break;
        }
      }
    }
  }
  
  return {
    word: entry.word,
    definition,
    example,
    partOfSpeech,
    audioUrl,
    phonetic: entry.phonetic || null,
    notFound: false,
  };
}

// Fetch word data from API
export async function fetchWordData(word: string): Promise<CachedWordData> {
  const key = word.toLowerCase();
  
  // Check cache first
  const cached = getCachedWord(word);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(key)}`
    );
    
    if (!response.ok) {
      // Word not found in dictionary
      const notFoundEntry: CachedWordData = {
        word: key,
        definition: null,
        example: null,
        partOfSpeech: null,
        audioUrl: null,
        phonetic: null,
        fetchedAt: Date.now(),
        notFound: true,
      };
      
      // Cache the not-found result too (to avoid repeated API calls)
      const cache = loadCache();
      cache[key] = notFoundEntry;
      saveCache(cache);
      
      return notFoundEntry;
    }
    
    const data: DictionaryEntry[] = await response.json();
    const parsed = parseApiResponse(data);
    
    const entry: CachedWordData = {
      ...parsed,
      fetchedAt: Date.now(),
    };
    
    // Save to cache
    const cache = loadCache();
    cache[key] = entry;
    saveCache(cache);
    
    return entry;
  } catch (error) {
    console.error('Failed to fetch word data:', error);
    
    // Return a not-found entry on error (but don't cache network errors)
    return {
      word: key,
      definition: null,
      example: null,
      partOfSpeech: null,
      audioUrl: null,
      phonetic: null,
      fetchedAt: Date.now(),
      notFound: true,
    };
  }
}

// Prefetch multiple words (useful for quiz preparation)
export async function prefetchWords(words: string[]): Promise<void> {
  const uncachedWords = words.filter(word => !getCachedWord(word));
  
  // Fetch in batches to avoid overwhelming the API
  const batchSize = 5;
  for (let i = 0; i < uncachedWords.length; i += batchSize) {
    const batch = uncachedWords.slice(i, i + batchSize);
    await Promise.all(batch.map(word => fetchWordData(word)));
    
    // Small delay between batches
    if (i + batchSize < uncachedWords.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
}

// Clear the dictionary cache
export function clearDictionaryCache(): void {
  localStorage.removeItem(CACHE_KEY);
}

// Get cache statistics
export function getCacheStats(): { totalWords: number; cacheSize: string } {
  const cache = loadCache();
  const totalWords = Object.keys(cache).length;
  const cacheSize = new Blob([JSON.stringify(cache)]).size;
  
  return {
    totalWords,
    cacheSize: cacheSize > 1024 
      ? `${(cacheSize / 1024).toFixed(1)} KB` 
      : `${cacheSize} bytes`,
  };
}
