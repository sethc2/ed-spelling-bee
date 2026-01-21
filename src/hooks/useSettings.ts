import { useState, useEffect, useCallback } from 'react';
import { SpellingWord, defaultWords } from '../data/words';

export interface AppSettings {
  speechRate: number; // 0.5 to 2
  speechVoice: string; // voice URI or empty for default
}

const DEFAULT_SETTINGS: AppSettings = {
  speechRate: 0.9,
  speechVoice: '',
};

const STORAGE_KEY = 'spellingBeeSettings';
const WORDS_KEY = 'spellingBeeWords';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [words, setWords] = useState<SpellingWord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings and words from localStorage
  useEffect(() => {
    try {
      // Load settings
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
      
      // Load words - if none saved, use default words and save them
      const savedWords = localStorage.getItem(WORDS_KEY);
      if (savedWords) {
        setWords(JSON.parse(savedWords));
      } else {
        // First time load - populate with default words
        setWords(defaultWords);
        localStorage.setItem(WORDS_KEY, JSON.stringify(defaultWords));
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
      // Fallback to defaults
      setWords(defaultWords);
    }
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Add a new word
  const addWord = useCallback((word: SpellingWord) => {
    setWords(prev => {
      const updated = [...prev, word];
      localStorage.setItem(WORDS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Remove a word by index
  const removeWord = useCallback((index: number) => {
    setWords(prev => {
      const updated = prev.filter((_, i) => i !== index);
      localStorage.setItem(WORDS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Update a word at index
  const updateWord = useCallback((index: number, word: SpellingWord) => {
    setWords(prev => {
      const updated = [...prev];
      updated[index] = word;
      localStorage.setItem(WORDS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Reset words to default list
  const resetWords = useCallback(() => {
    setWords(defaultWords);
    localStorage.setItem(WORDS_KEY, JSON.stringify(defaultWords));
  }, []);

  // Reset everything (settings and words)
  const resetAll = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setWords(defaultWords);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(WORDS_KEY, JSON.stringify(defaultWords));
  }, []);

  return {
    settings,
    words,
    isLoaded,
    saveSettings,
    addWord,
    removeWord,
    updateWord,
    resetWords,
    resetAll,
  };
}
