import { useState, useEffect, useCallback } from 'react';
import { fetchWordData, CachedWordData, getCachedWord } from '../services/dictionaryApi';

interface UseDictionaryResult {
  wordData: CachedWordData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDictionary(word: string): UseDictionaryResult {
  const [wordData, setWordData] = useState<CachedWordData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!word) {
      setWordData(null);
      return;
    }

    // Check cache first (synchronously)
    const cached = getCachedWord(word);
    if (cached) {
      setWordData(cached);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchWordData(word);
      setWordData(data);
    } catch (e) {
      setError('Failed to fetch word data');
      console.error('Dictionary fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  }, [word]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    wordData,
    isLoading,
    error,
    refetch: fetchData,
  };
}
