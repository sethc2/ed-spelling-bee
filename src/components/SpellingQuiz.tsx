import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useDictionary } from '../hooks/useDictionary';
import { SpellingWord, getDifficultyLabel, getDifficultyColor } from '../data/words';
import { 
  Home, 
  Volume2, 
  Eye, 
  Check, 
  X, 
  BookOpen, 
  MessageSquareQuote,
  Loader2,
  ArrowRight,
  Square
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SpellingQuizProps {
  words: SpellingWord[];
  onComplete: (results: QuizResult[]) => void;
  onExit: () => void;
  speechRate: number;
  speechVoice: string;
  onSaveVoiceSettings: (rate: number, voice: string) => void;
}

export interface QuizResult {
  word: SpellingWord;
  correct: boolean | null; // null means unanswered/skipped
}

export function SpellingQuiz({ 
  words, 
  onComplete, 
  onExit,
  speechRate: initialSpeechRate,
  speechVoice: initialSpeechVoice,
  onSaveVoiceSettings,
}: SpellingQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isSpellingOut, setIsSpellingOut] = useState(false);
  const [localRate, setLocalRate] = useState(initialSpeechRate);
  const [localVoice, setLocalVoice] = useState(initialSpeechVoice);

  const currentWord = words[currentIndex];
  const progress = ((currentIndex) / words.length) * 100;
  const correctCount = results.filter(r => r.correct).length;

  // Fetch dictionary data for current word
  const { wordData, isLoading: isLoadingDictionary } = useDictionary(currentWord.word);

  const {
    speak,
    speakWord,
    isSpeaking,
    isSupported: isTTSSupported,
    voices,
  } = useTextToSpeech(localRate, localVoice);

  // Filter to English voices
  const englishVoices = voices.filter(v => v.lang.startsWith('en'));

  // Save voice settings when changed
  const handleRateChange = useCallback((newRate: number) => {
    setLocalRate(newRate);
    onSaveVoiceSettings(newRate, localVoice);
  }, [localVoice, onSaveVoiceSettings]);

  const handleVoiceChange = useCallback((newVoice: string) => {
    setLocalVoice(newVoice);
    onSaveVoiceSettings(localRate, newVoice);
  }, [localRate, onSaveVoiceSettings]);

  // Pronounce the word when it changes
  useEffect(() => {
    if (currentWord && isTTSSupported && !revealed) {
      const timer = setTimeout(() => {
        speakWord(currentWord.word, { 
          rate: localRate * 0.9,
          voiceURI: localVoice 
        }).catch(() => {
          // Silently handle errors (interrupted errors are expected)
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentWord, speakWord, isTTSSupported, revealed, localRate, localVoice]);

  // Spell out the word letter by letter
  const spellOutWord = useCallback(async () => {
    if (isSpeaking || isSpellingOut) return;
    
    setIsSpellingOut(true);
    const letters = currentWord.word.split('');
    
    for (let i = 0; i < letters.length; i++) {
      const letter = letters[i];
      let toSpeak = letter.toLowerCase();
      
      // Handle special characters
      if (letter === ' ') toSpeak = 'space';
      else if (letter === '-') toSpeak = 'hyphen';
      else if (letter === "'") toSpeak = 'apostrophe';
      else if (letter === '.') toSpeak = 'period';
      // Only say "capital" if the letter is actually uppercase
      else if (letter === letter.toUpperCase() && letter !== letter.toLowerCase()) {
        toSpeak = `capital ${letter.toLowerCase()}`;
      }
      
      await new Promise<void>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(toSpeak);
        utterance.rate = localRate * 1.5; // Faster for letters
        utterance.onend = () => {
          setTimeout(resolve, 20); // Very short pause between letters
        };
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      });
    }
    
    setIsSpellingOut(false);
  }, [currentWord.word, isSpeaking, isSpellingOut, localRate]);

  const handleReveal = useCallback(() => {
    setRevealed(true);
    // Spell out the word after revealing
    setTimeout(() => {
      spellOutWord();
    }, 300);
  }, [spellOutWord]);

  const handleAnswer = useCallback((correct: boolean) => {
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const result: QuizResult = { word: currentWord, correct };
    const newResults = [...results, result];
    setResults(newResults);
    
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setRevealed(false);
    } else {
      onComplete(newResults);
    }
  }, [currentWord, currentIndex, words.length, results, onComplete]);

  const handleEndQuiz = useCallback(() => {
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // Get all words that have been answered
    const answeredWordIds = new Set(results.map(r => r.word.word));
    
    // Add unanswered words as skipped (null)
    const allResults: QuizResult[] = [...results];
    for (let i = 0; i < words.length; i++) {
      if (!answeredWordIds.has(words[i].word)) {
        allResults.push({ word: words[i], correct: null });
      }
    }
    
    onComplete(allResults);
  }, [results, words, onComplete]);

  const handleHearDefinition = useCallback(() => {
    if (wordData?.definition) {
      const text = wordData.partOfSpeech 
        ? `${wordData.partOfSpeech}. ${wordData.definition}`
        : wordData.definition;
      speak(text);
    }
  }, [wordData, speak]);

  const handleHearExample = useCallback(() => {
    if (wordData?.example) {
      speak(wordData.example);
    }
  }, [wordData, speak]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#FEF9EF] via-[#FFF8E7] to-[#FEF3C7]">
      {/* Header */}
      <header className="bg-white/50 backdrop-blur-sm border-b border-[#F4B942]/20 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <Button onClick={onExit} variant="ghost" size="sm" className="gap-2">
              <Home className="w-4 h-4" />
              Exit
            </Button>
            <Button 
              onClick={handleEndQuiz} 
              variant="outline" 
              size="sm" 
              className="gap-2 border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              <Square className="w-4 h-4" />
              End Quiz
            </Button>
          </div>
          
          <div className="flex-1 max-w-md">
            <div className="flex items-center gap-3">
              <Progress value={progress} className="flex-1" />
              <span className="text-sm font-medium text-[#1A1A2E] whitespace-nowrap">
                {currentIndex + 1} / {words.length}
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#F4B942] to-[#D4941C] px-4 py-2 rounded-xl">
            <span className="text-[#1A1A2E] font-bold">
              ✓ {correctCount}
            </span>
          </div>
        </div>

        {/* Voice Settings Panel - Always Visible */}
        <div className="max-w-4xl mx-auto mt-2 px-4 pb-2">
          <div className="bg-white/80 rounded-xl border border-[#F4B942]/30 p-3">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex-1 w-full sm:w-auto min-w-[150px]">
                <label className="text-xs font-medium text-[#1A1A2E]/70 mb-1 block">
                  Speed: {localRate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={localRate}
                  onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#F4B942]"
                />
              </div>
              <div className="flex-1 w-full sm:w-auto min-w-[200px]">
                <label className="text-xs font-medium text-[#1A1A2E]/70 mb-1 block">
                  Voice
                </label>
                <select
                  value={localVoice}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:border-[#F4B942] focus:outline-none bg-white"
                >
                  <option value="">Default</option>
                  {englishVoices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl space-y-8">
          {/* Decorative Bee */}
          <div className="text-center">
            <span className="text-6xl md:text-8xl animate-float inline-block">🐝</span>
            <h2 className="text-xl md:text-2xl font-semibold text-[#1A1A2E] mt-2">
              {revealed ? 'Did you spell it correctly?' : 'Listen and spell!'}
            </h2>
            <p className="text-[#1A1A2E]/60 text-sm">
              Difficulty: <span className={`font-semibold ${getDifficultyColor(currentWord.difficulty)}`}>
                {getDifficultyLabel(currentWord.difficulty)}
              </span>
              {currentWord.alternateSpelling && (
                <span className="ml-2 text-purple-600">(alternate: {currentWord.alternateSpelling})</span>
              )}
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border border-[#F4B942]/20">
            {!revealed ? (
              /* Before Reveal */
              <div className="text-center space-y-6">
                <p className="text-lg text-[#1A1A2E]/70">
                  Write the word down, then reveal to check!
                </p>
                
                {/* Hear Word Button */}
                <Button
                  onClick={() => {
                    speakWord(currentWord.word, { 
                      rate: localRate * 0.9,
                      voiceURI: localVoice 
                    }).catch(() => {
                      // Silently handle errors (interrupted errors are expected)
                    });
                  }}
                  disabled={isSpeaking}
                  size="xl"
                  className={cn(
                    "w-full max-w-xs mx-auto gap-3 text-xl h-20",
                    isSpeaking && "animate-pulse"
                  )}
                >
                  <Volume2 className="w-8 h-8" />
                  {isSpeaking ? 'Speaking...' : 'Hear Word'}
                </Button>

                {/* Dictionary Buttons */}
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={handleHearDefinition}
                    disabled={isSpeaking || !wordData?.definition || isLoadingDictionary}
                    variant="outline"
                    size="lg"
                    className="gap-2"
                  >
                    {isLoadingDictionary ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <BookOpen className="w-5 h-5" />
                    )}
                    Definition
                  </Button>
                  
                  <Button
                    onClick={handleHearExample}
                    disabled={isSpeaking || !wordData?.example || isLoadingDictionary}
                    variant="outline"
                    size="lg"
                    className="gap-2"
                  >
                    {isLoadingDictionary ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <MessageSquareQuote className="w-5 h-5" />
                    )}
                    Example
                  </Button>
                </div>

                {/* Reveal Button */}
                <Button
                  onClick={handleReveal}
                  variant="secondary"
                  size="xl"
                  className="w-full max-w-xs mx-auto gap-3 text-xl h-16 bg-[#1A1A2E] text-white hover:bg-[#1A1A2E]/90"
                >
                  <Eye className="w-7 h-7" />
                  Reveal Spelling
                </Button>
              </div>
            ) : (
              /* After Reveal */
              <div className="text-center space-y-6">
                {/* The Word */}
                <div className="space-y-4">
                  <h3 className="text-4xl md:text-6xl font-bold text-[#1A1A2E] tracking-wider">
                    {currentWord.word}
                  </h3>
                  
                  {/* Letters Display */}
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {currentWord.word.split('').map((letter, index) => (
                      <span
                        key={index}
                        className={cn(
                          "inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg",
                          "font-bold text-xl md:text-2xl",
                          "bg-gradient-to-br from-[#F4B942] to-[#D4941C] text-[#1A1A2E]",
                          "shadow-md animate-fade-in"
                        )}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {letter === ' ' ? '␣' : letter}
                      </span>
                    ))}
                  </div>

                  {/* Spell it Out Button */}
                  <Button
                    onClick={spellOutWord}
                    disabled={isSpeaking || isSpellingOut}
                    variant="outline"
                    size="lg"
                    className="gap-2 mt-2"
                  >
                    <Volume2 className="w-5 h-5" />
                    {isSpellingOut ? 'Spelling...' : 'Hear Letters'}
                  </Button>
                </div>

                {/* Definition Display */}
                {wordData?.definition && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                    <p className="text-amber-900 text-sm">
                      <strong className="capitalize">{wordData.partOfSpeech || 'Definition'}:</strong>{' '}
                      {wordData.definition}
                    </p>
                    {wordData.example && (
                      <p className="text-amber-700 text-sm mt-2 italic">
                        Example: "{wordData.example}"
                      </p>
                    )}
                  </div>
                )}

                {/* Self-Grading Buttons */}
                <div className="space-y-3">
                  <p className="text-lg font-medium text-[#1A1A2E]">
                    Did you spell it correctly?
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={() => handleAnswer(false)}
                      size="xl"
                      variant="outline"
                      className="flex-1 max-w-[180px] h-16 gap-2 text-lg border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                    >
                      <X className="w-6 h-6" />
                      Wrong
                    </Button>
                    <Button
                      onClick={() => handleAnswer(true)}
                      size="xl"
                      className="flex-1 max-w-[180px] h-16 gap-2 text-lg bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Check className="w-6 h-6" />
                      Correct
                    </Button>
                  </div>
                </div>

                {/* Next hint */}
                {currentIndex < words.length - 1 && (
                  <p className="text-sm text-[#1A1A2E]/50 flex items-center justify-center gap-1">
                    <ArrowRight className="w-4 h-4" />
                    {words.length - currentIndex - 1} more words to go
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
