import { useCallback, useState, useEffect } from 'react';

export interface TTSOptions {
  rate?: number;
  pitch?: number;
  voiceURI?: string;
}

export function useTextToSpeech(defaultRate: number = 0.9, defaultVoiceURI: string = '') {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState(defaultVoiceURI);
  const [speechRate, setSpeechRate] = useState(defaultRate);

  useEffect(() => {
    if (!window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Update when props change
  useEffect(() => {
    setSpeechRate(defaultRate);
  }, [defaultRate]);

  useEffect(() => {
    setSelectedVoiceURI(defaultVoiceURI);
  }, [defaultVoiceURI]);

  const getVoice = useCallback((voiceURI?: string): SpeechSynthesisVoice | null => {
    const uri = voiceURI || selectedVoiceURI;
    if (uri) {
      const found = voices.find(v => v.voiceURI === uri);
      if (found) return found;
    }
    
    // Try to find a good English voice
    const englishVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Daniel') || v.localService)
    ) || voices.find(v => v.lang.startsWith('en'));
    
    return englishVoice || null;
  }, [voices, selectedVoiceURI]);

  const speak = useCallback((text: string, options?: TTSOptions) => {
    return new Promise<void>((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech and wait a bit for cleanup
      window.speechSynthesis.cancel();
      
      // Small delay to ensure previous utterance is fully cancelled
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        
        const voice = getVoice(options?.voiceURI);
        if (voice) {
          utterance.voice = voice;
        }

        utterance.rate = options?.rate ?? speechRate;
        utterance.pitch = options?.pitch ?? 1;
        utterance.volume = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          resolve();
        };
        utterance.onerror = (e) => {
          setIsSpeaking(false);
          // 'interrupted' and 'canceled' are not real errors - they're expected when cancelling
          if (e.error === 'interrupted' || e.error === 'canceled') {
            resolve(); // Resolve instead of reject for expected cancellations
          } else {
            reject(e);
          }
        };

        window.speechSynthesis.speak(utterance);
      }, 50); // Small delay to ensure clean state
    });
  }, [getVoice, speechRate]);

  const speakWord = useCallback(async (word: string, options?: TTSOptions) => {
    await speak(word, { 
      rate: options?.rate ?? speechRate * 0.9,
      voiceURI: options?.voiceURI ?? selectedVoiceURI
    });
  }, [speak, speechRate, selectedVoiceURI]);

  const speakLetter = useCallback(async (letter: string) => {
    await speak(letter, { rate: speechRate });
  }, [speak, speechRate]);

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    speakWord,
    speakLetter,
    isSpeaking,
    isSupported,
    cancel,
    voices,
    selectedVoiceURI,
    setSelectedVoiceURI,
    speechRate,
    setSpeechRate,
  };
}
