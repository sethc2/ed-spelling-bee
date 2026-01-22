import { useState, useEffect, useCallback } from 'react';
import { SpellingWord, defaultWords } from '../data/words';

export interface CustomWordList {
  name: string;
  wordIds: string[]; // word strings
  createdAt: number;
}

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
const CUSTOM_LISTS_KEY = 'spellingBeeCustomLists';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [words, setWords] = useState<SpellingWord[]>([]);
  const [customLists, setCustomLists] = useState<CustomWordList[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings, words, and custom lists from localStorage
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

      // Load custom lists
      const savedLists = localStorage.getItem(CUSTOM_LISTS_KEY);
      if (savedLists) {
        setCustomLists(JSON.parse(savedLists));
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
    setCustomLists([]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(WORDS_KEY, JSON.stringify(defaultWords));
    localStorage.removeItem(CUSTOM_LISTS_KEY);
  }, []);

  // === Custom Lists CRUD ===

  // Save or update a custom list (overwrites if same name exists)
  const saveCustomList = useCallback((name: string, wordIds: string[]) => {
    setCustomLists(prev => {
      const existingIndex = prev.findIndex(l => l.name === name);
      const newList: CustomWordList = {
        name,
        wordIds,
        createdAt: Date.now(),
      };
      
      let updated: CustomWordList[];
      if (existingIndex >= 0) {
        // Overwrite existing
        updated = [...prev];
        updated[existingIndex] = newList;
      } else {
        // Add new
        updated = [...prev, newList];
      }
      
      localStorage.setItem(CUSTOM_LISTS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Delete a custom list by name
  const deleteCustomList = useCallback((name: string) => {
    setCustomLists(prev => {
      const updated = prev.filter(l => l.name !== name);
      localStorage.setItem(CUSTOM_LISTS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Get words for a custom list
  const getWordsForList = useCallback((listName: string): SpellingWord[] => {
    const list = customLists.find(l => l.name === listName);
    if (!list) return [];
    return words.filter(w => list.wordIds.includes(w.word));
  }, [customLists, words]);

  // Get words by difficulty (preset lists)
  const getWordsByDifficulty = useCallback((difficulty: 1 | 2 | 3 | 'all'): SpellingWord[] => {
    if (difficulty === 'all') return words;
    return words.filter(w => w.difficulty === difficulty);
  }, [words]);

  return {
    settings,
    words,
    customLists,
    isLoaded,
    saveSettings,
    addWord,
    removeWord,
    updateWord,
    resetWords,
    resetAll,
    // Custom lists
    saveCustomList,
    deleteCustomList,
    getWordsForList,
    getWordsByDifficulty,
  };
}
