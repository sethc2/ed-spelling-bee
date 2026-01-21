import { useState, useCallback, useRef, useEffect } from 'react';

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// Map of spoken words to special characters
const SPECIAL_CHAR_MAP: Record<string, string> = {
  'space': ' ',
  'apostrophe': "'",
  'quote': "'",
  'hyphen': '-',
  'dash': '-',
  'period': '.',
  'dot': '.',
  'comma': ',',
  'accent': "'",
};

// Letter names that should be recognized
const LETTER_NAMES = [
  'double u', 'double you', 'pee', 'bee', 'see', 'dee', 'ee', 'eff', 
  'gee', 'aitch', 'eye', 'jay', 'kay', 'ell', 'em', 'en', 'oh', 
  'queue', 'cue', 'ar', 'ess', 'tee', 'you', 'vee', 'ex', 'why', 
  'zee', 'zed'
];

// Check if a token is a letter (single char or letter name)
function isLetterToken(token: string): boolean {
  const cleaned = token.trim().toLowerCase();
  if (cleaned.length === 1 && /[a-z]/.test(cleaned)) return true;
  if (SPECIAL_CHAR_MAP[cleaned]) return true;
  if (LETTER_NAMES.includes(cleaned)) return true;
  return false;
}

// Check if a word sounds similar to target (fuzzy match for pronunciation)
function wordsSoundSimilar(spoken: string, target: string): boolean {
  const spokenClean = spoken.toLowerCase().trim();
  const targetClean = target.toLowerCase().trim();
  
  // Exact match
  if (spokenClean === targetClean) return true;
  
  // Remove common speech recognition artifacts
  const spokenNorm = spokenClean.replace(/[^a-z]/g, '');
  const targetNorm = targetClean.replace(/[^a-z]/g, '');
  
  // Exact match after normalization
  if (spokenNorm === targetNorm) return true;
  
  // Allow for small differences (Levenshtein-ish)
  if (spokenNorm.length >= 3 && targetNorm.length >= 3) {
    // Check if one starts with the other
    if (spokenNorm.startsWith(targetNorm) || targetNorm.startsWith(spokenNorm)) return true;
    
    // Check if they share most characters (simple similarity)
    const minLen = Math.min(spokenNorm.length, targetNorm.length);
    const maxLen = Math.max(spokenNorm.length, targetNorm.length);
    let matches = 0;
    for (let i = 0; i < minLen; i++) {
      if (spokenNorm[i] === targetNorm[i]) matches++;
    }
    // If 70% of characters match, consider it similar
    if (matches / maxLen >= 0.7) return true;
  }
  
  return false;
}

export type SpellingPhase = 'waiting' | 'word1' | 'spelling' | 'word2' | 'complete';

interface SpellingBeeState {
  phase: SpellingPhase;
  startWord: string | null;
  characters: string[];
  endWord: string | null;
  skippedStartWord: boolean;
}

export function useSpeechRecognition(targetWord?: string) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [fullTranscript, setFullTranscript] = useState('');
  const [characters, setCharacters] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [spellingState, setSpellingState] = useState<SpellingBeeState>({
    phase: 'waiting',
    startWord: null,
    characters: [],
    endWord: null,
    skippedStartWord: false,
  });
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const targetWordRef = useRef<string | undefined>(targetWord);
  const allTokensRef = useRef<string[]>([]);

  // Update target word ref when prop changes
  useEffect(() => {
    targetWordRef.current = targetWord;
  }, [targetWord]);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setSpellingState({
        phase: 'word1',
        startWord: null,
        characters: [],
        endWord: null,
        skippedStartWord: false,
      });
      allTokensRef.current = [];
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let currentFullTranscript = '';
      
      for (let i = 0; i < event.results.length; i++) {
        currentFullTranscript += event.results[i][0].transcript + ' ';
      }
      
      setFullTranscript(currentFullTranscript.trim());
      
      // Get the latest result
      const latestResult = event.results[event.results.length - 1];
      const latestTranscript = latestResult[0].transcript.trim();
      setTranscript(latestTranscript);
      
      // Process the full transcript to understand the spelling bee flow
      processTranscript(currentFullTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setError(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const processTranscript = useCallback((fullText: string) => {
    const tokens = fullText.toLowerCase().split(/\s+/).filter(t => t);
    const target = targetWordRef.current?.toLowerCase() || '';
    
    // Track state through the transcript
    let phase: SpellingPhase = 'word1';
    let startWord: string | null = null;
    let endWord: string | null = null;
    let letterTokens: string[] = [];
    let skippedStart = false;
    let letterStartIndex = -1;
    
    // First, find if there's a word that matches the target at the start
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      
      if (phase === 'word1') {
        // Check if this token sounds like the target word
        if (target && wordsSoundSimilar(token, target)) {
          startWord = token;
          phase = 'spelling';
          letterStartIndex = i + 1;
        } else if (isLetterToken(token)) {
          // They started spelling without saying the word first
          skippedStart = true;
          phase = 'spelling';
          letterStartIndex = i;
        }
      }
    }
    
    // Now extract letters from the spelling phase
    if (letterStartIndex >= 0) {
      for (let i = letterStartIndex; i < tokens.length; i++) {
        const token = tokens[i];
        
        // Check if this is the ending word
        if (target && wordsSoundSimilar(token, target) && letterTokens.length > 0) {
          endWord = token;
          phase = 'word2';
          break;
        }
        
        // Try to extract letter from token
        const letter = extractSingleLetter(token);
        if (letter) {
          letterTokens.push(letter);
        }
      }
    }
    
    // Convert letter tokens to characters
    const chars = letterTokens;
    setCharacters(chars);
    
    // Update state
    setSpellingState({
      phase: endWord ? 'word2' : (chars.length > 0 ? 'spelling' : (startWord ? 'spelling' : 'word1')),
      startWord,
      characters: chars,
      endWord,
      skippedStartWord: skippedStart,
    });
    
    // Auto-stop if we detected the ending word
    if (endWord && recognitionRef.current && phase === 'word2') {
      setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }, 500); // Small delay to ensure we captured everything
    }
  }, []);

  const extractSingleLetter = (token: string): string | null => {
    const cleaned = token.toLowerCase().trim();
    
    // Special characters
    if (SPECIAL_CHAR_MAP[cleaned]) {
      return SPECIAL_CHAR_MAP[cleaned];
    }
    
    // Single letter
    if (cleaned.length === 1 && /[a-z]/.test(cleaned)) {
      return cleaned.toUpperCase();
    }
    
    // Phonetic letter names
    const phoneticMap: Record<string, string> = {
      'pee': 'P', 'bee': 'B', 'see': 'C', 'dee': 'D', 'ee': 'E',
      'eff': 'F', 'ef': 'F', 'gee': 'G', 'aitch': 'H', 'eye': 'I',
      'jay': 'J', 'kay': 'K', 'ell': 'L', 'el': 'L', 'em': 'M',
      'en': 'N', 'oh': 'O', 'queue': 'Q', 'cue': 'Q', 'ar': 'R',
      'ess': 'S', 'es': 'S', 'tee': 'T', 'you': 'U', 'vee': 'V',
      'ex': 'X', 'why': 'Y', 'zee': 'Z', 'zed': 'Z',
    };
    
    if (phoneticMap[cleaned]) {
      return phoneticMap[cleaned];
    }
    
    return null;
  };

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setFullTranscript('');
      setCharacters([]);
      setError(null);
      allTokensRef.current = [];
      setSpellingState({
        phase: 'word1',
        startWord: null,
        characters: [],
        endWord: null,
        skippedStartWord: false,
      });
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Failed to start recognition:', e);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setFullTranscript('');
    setCharacters([]);
    allTokensRef.current = [];
    setSpellingState({
      phase: 'waiting',
      startWord: null,
      characters: [],
      endWord: null,
      skippedStartWord: false,
    });
  }, []);

  return {
    isListening,
    transcript,
    fullTranscript,
    characters,
    error,
    isSupported,
    spellingState,
    startListening,
    stopListening,
    resetTranscript,
  };
}
