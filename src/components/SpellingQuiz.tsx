import React, { useState, useEffect, useCallback } from 'react';
import { LetterDisplay } from './LetterDisplay';
import { RecordButton } from './RecordButton';
import { WordControls } from './WordControls';
import { ResultDisplay } from './ResultDisplay';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useDictionary } from '../hooks/useDictionary';
import { SpellingWord, checkSpelling, getDifficultyLabel, getDifficultyColor } from '../data/words';
import { Home, Send, RotateCcw } from 'lucide-react';

interface SpellingQuizProps {
  words: SpellingWord[];
  onComplete: (score: number, total: number) => void;
  onExit: () => void;
  speechRate: number;
  speechVoice: string;
}

export function SpellingQuiz({ 
  words, 
  onComplete, 
  onExit,
  speechRate,
  speechVoice,
}: SpellingQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [showFormatReminder, setShowFormatReminder] = useState(false);

  const currentWord = words[currentIndex];
  const progress = ((currentIndex) / words.length) * 100;

  // Fetch dictionary data for current word
  const { wordData, isLoading: isLoadingDictionary } = useDictionary(currentWord.word);

  const {
    isListening,
    characters,
    error: speechError,
    isSupported: isSpeechSupported,
    spellingState,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition(currentWord.word);

  const {
    speak,
    speakWord,
    isSpeaking,
    isSupported: isTTSSupported,
  } = useTextToSpeech(speechRate, speechVoice);

  // Pronounce the word when it changes
  useEffect(() => {
    if (currentWord && isTTSSupported) {
      const timer = setTimeout(() => {
        speakWord(currentWord.word);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentWord, speakWord, isTTSSupported]);

  // Auto-check when spelling is complete (word said at end)
  useEffect(() => {
    if (spellingState.phase === 'word2' && spellingState.endWord && !isListening && !hasChecked) {
      // Small delay before checking
      const timer = setTimeout(() => {
        checkAnswer();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [spellingState.phase, spellingState.endWord, isListening, hasChecked]);

  const checkAnswer = useCallback(() => {
    const enteredWord = characters.join('');
    const correct = checkSpelling(enteredWord, currentWord);
    setIsCorrect(correct);
    setShowResult(true);
    setHasChecked(true);
    
    // Show format reminder if they skipped saying the word first
    if (spellingState.skippedStartWord) {
      setShowFormatReminder(true);
    }
    
    if (correct) {
      setScore(prev => prev + 1);
    }
  }, [characters, currentWord, spellingState.skippedStartWord]);

  const handleNextWord = useCallback(() => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowResult(false);
      setHasChecked(false);
      setShowFormatReminder(false);
      resetTranscript();
    } else {
      onComplete(score + (isCorrect ? 0 : 0), words.length);
    }
  }, [currentIndex, words.length, onComplete, score, isCorrect, resetTranscript]);

  const handleTryAgain = useCallback(() => {
    setShowResult(false);
    setHasChecked(false);
    setShowFormatReminder(false);
    resetTranscript();
  }, [resetTranscript]);

  const handleReset = useCallback(() => {
    resetTranscript();
    setShowResult(false);
    setHasChecked(false);
    setShowFormatReminder(false);
  }, [resetTranscript]);

  const handleSubmit = useCallback(() => {
    stopListening();
    // Check answer after a small delay to ensure final transcript is processed
    setTimeout(() => {
      checkAnswer();
    }, 200);
  }, [stopListening, checkAnswer]);

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

  if (!isSpeechSupported) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-100 border-2 border-red-400 rounded-2xl p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Browser Not Supported</h2>
          <p className="text-red-600 mb-4">
            Sorry, your browser doesn't support speech recognition. 
            Please try using Chrome, Edge, or Safari.
          </p>
          <Button onClick={onExit} variant="secondary">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/50 backdrop-blur-sm border-b border-[#F4B942]/20 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Button onClick={onExit} variant="ghost" size="sm" className="gap-2">
            <Home className="w-4 h-4" />
            Exit
          </Button>
          
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
              Score: {score}
            </span>
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
              Spell the word!
            </h2>
            <p className="text-[#1A1A2E]/60 text-sm">
              Difficulty: <span className={`font-semibold ${getDifficultyColor(currentWord.difficulty)}`}>
                {getDifficultyLabel(currentWord.difficulty)}
              </span>
              {currentWord.alternateSpelling && (
                <span className="ml-2 text-purple-600">(alternate spelling accepted)</span>
              )}
            </p>
            {/* Show phonetic if available */}
            {wordData?.phonetic && (
              <p className="text-[#1A1A2E]/40 text-sm mt-1 font-mono">
                {wordData.phonetic}
              </p>
            )}
          </div>

          {/* Word Controls */}
          <WordControls
            onHearWord={() => speakWord(currentWord.word)}
            onHearDefinition={handleHearDefinition}
            onHearExample={handleHearExample}
            onReset={handleReset}
            isSpeaking={isSpeaking}
            hasDefinition={!!wordData?.definition}
            hasExample={!!wordData?.example}
            isLoadingDictionary={isLoadingDictionary}
            disabled={showResult}
          />

          {/* Dictionary Status */}
          {!isLoadingDictionary && wordData?.notFound && (
            <p className="text-center text-gray-500 text-xs">
              📚 Definition not available for this word
            </p>
          )}

          {/* Letter Display */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-4 md:p-6 shadow-lg border border-[#F4B942]/20">
            <LetterDisplay
              enteredCharacters={characters}
              showResult={showResult}
              isCorrect={isCorrect}
              correctWord={currentWord.word}
            />
          </div>

          {/* Format Reminder */}
          {showFormatReminder && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-blue-800 text-sm">
                💡 <strong>Tip:</strong> In a spelling bee, you should say the word first, 
                then spell it letter by letter, then say the word again.
              </p>
              <p className="text-blue-600 text-xs mt-1">
                Example: "Apple. A-P-P-L-E. Apple."
              </p>
            </div>
          )}

          {/* Show definition after answering */}
          {showResult && wordData?.definition && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
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

          {/* Speech Error */}
          {speechError && (
            <p className="text-center text-red-600 text-sm">{speechError}</p>
          )}

          {/* Record Button and Action Buttons */}
          {!showResult && (
            <div className="flex flex-col items-center gap-6">
              <RecordButton
                isListening={isListening}
                onStartListening={startListening}
                onStopListening={stopListening}
                disabled={showResult}
                phase={spellingState.phase}
              />
              
              {/* Action buttons when recording or have letters */}
              {(isListening || characters.length > 0) && !hasChecked && (
                <div className="flex gap-3">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="lg"
                    className="gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Restart
                  </Button>
                  
                  <Button
                    onClick={handleSubmit}
                    size="lg"
                    className="gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Done / Submit
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Result Display */}
          {showResult && (
            <ResultDisplay
              isCorrect={isCorrect}
              correctWord={currentWord.word}
              onNextWord={handleNextWord}
              onTryAgain={handleTryAgain}
            />
          )}
        </div>
      </main>
    </div>
  );
}
