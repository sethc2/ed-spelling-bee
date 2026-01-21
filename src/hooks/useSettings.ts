import { useState, useEffect, useCallback } from 'react';
import { SpellingWord, defaultWords } from '../data/words';

export interface AppSettings {
  speechRate: number; // 0.5 to 2
  speechVoice: string; // voice URI or empty for default
  customWords: SpellingWord[];
  useCustomWords: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  speechRate: 0.9,
  speechVoice: '',
  customWords: [],
  useCustomWords: false,
};

const STORAGE_KEY = 'spellingBeeSettings';
const CUSTOM_WORDS_KEY = 'spellingBeeCustomWords';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      const savedCustomWords = localStorage.getItem(CUSTOM_WORDS_KEY);
      
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({
          ...prev,
          ...parsed,
          customWords: savedCustomWords ? JSON.parse(savedCustomWords) : [],
        }));
      } else if (savedCustomWords) {
        setSettings(prev => ({
          ...prev,
          customWords: JSON.parse(savedCustomWords),
        }));
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Save to localStorage (excluding customWords which has its own key)
      const { customWords, ...settingsToSave } = updated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsToSave));
      
      // Save custom words separately
      if (newSettings.customWords !== undefined) {
        localStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(updated.customWords));
      }
      
      return updated;
    });
  }, []);

  const addCustomWord = useCallback((word: SpellingWord) => {
    setSettings(prev => {
      const updated = {
        ...prev,
        customWords: [...prev.customWords, word],
      };
      localStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(updated.customWords));
      return updated;
    });
  }, []);

  const removeCustomWord = useCallback((index: number) => {
    setSettings(prev => {
      const updated = {
        ...prev,
        customWords: prev.customWords.filter((_, i) => i !== index),
      };
      localStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(updated.customWords));
      return updated;
    });
  }, []);

  const updateCustomWord = useCallback((index: number, word: SpellingWord) => {
    setSettings(prev => {
      const newCustomWords = [...prev.customWords];
      newCustomWords[index] = word;
      const updated = {
        ...prev,
        customWords: newCustomWords,
      };
      localStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(updated.customWords));
      return updated;
    });
  }, []);

  const getActiveWords = useCallback((): SpellingWord[] => {
    if (settings.useCustomWords && settings.customWords.length > 0) {
      return settings.customWords;
    }
    return defaultWords;
  }, [settings.useCustomWords, settings.customWords]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CUSTOM_WORDS_KEY);
  }, []);

  return {
    settings,
    isLoaded,
    saveSettings,
    addCustomWord,
    removeCustomWord,
    updateCustomWord,
    getActiveWords,
    resetSettings,
  };
}
