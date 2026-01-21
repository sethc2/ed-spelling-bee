import React, { useState, useCallback, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { SpellingQuiz } from './components/SpellingQuiz';
import { ResultsScreen } from './components/ResultsScreen';
import { SettingsPage } from './components/SettingsPage';
import { useSettings } from './hooks/useSettings';
import { useTextToSpeech } from './hooks/useTextToSpeech';
import { getWordsByDifficulty, shuffleArray, SpellingWord } from './data/words';
import './App.css';

type Screen = 'home' | 'quiz' | 'results' | 'settings';

interface HighScore {
  score: number;
  total: number;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [quizWords, setQuizWords] = useState<SpellingWord[]>([]);
  const [lastScore, setLastScore] = useState<{ score: number; total: number } | null>(null);
  const [highScore, setHighScore] = useState<HighScore | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [lastSettings, setLastSettings] = useState<{ difficulty: 1 | 2 | 3 | 'all'; count: number }>({
    difficulty: 'all',
    count: 10
  });

  const {
    settings,
    words,
    isLoaded,
    saveSettings,
    addWord,
    removeWord,
    updateWord,
    resetWords,
    resetAll,
  } = useSettings();

  const {
    speak,
    voices,
  } = useTextToSpeech(settings.speechRate, settings.speechVoice);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('spellingBeeHighScore');
    if (saved) {
      setHighScore(JSON.parse(saved));
    }
  }, []);

  const handleStartQuiz = useCallback((difficulty: 1 | 2 | 3 | 'all', count: number) => {
    const availableWords = getWordsByDifficulty(words, difficulty);
    const shuffled = shuffleArray(availableWords);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));
    setQuizWords(selected);
    setLastSettings({ difficulty, count });
    setCurrentScreen('quiz');
  }, [words]);

  const handleQuizComplete = useCallback((score: number, total: number) => {
    setLastScore({ score, total });
    
    // Check for new high score
    const percentage = score / total;
    const currentHighPercentage = highScore ? highScore.score / highScore.total : 0;
    
    if (percentage > currentHighPercentage || !highScore) {
      const newHighScore = { score, total };
      setHighScore(newHighScore);
      setIsNewHighScore(true);
      localStorage.setItem('spellingBeeHighScore', JSON.stringify(newHighScore));
    } else {
      setIsNewHighScore(false);
    }
    
    setCurrentScreen('results');
  }, [highScore]);

  const handlePlayAgain = useCallback(() => {
    handleStartQuiz(lastSettings.difficulty, lastSettings.count);
  }, [handleStartQuiz, lastSettings]);

  const handleGoHome = useCallback(() => {
    setCurrentScreen('home');
    setIsNewHighScore(false);
  }, []);

  const handleExitQuiz = useCallback(() => {
    setCurrentScreen('home');
  }, []);

  const handleOpenSettings = useCallback(() => {
    setCurrentScreen('settings');
  }, []);

  const handleTestVoice = useCallback((text: string, rate: number, voiceURI: string) => {
    speak(text, { rate, voiceURI });
  }, [speak]);

  const handleResetAll = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all settings and restore the original word list?')) {
      resetAll();
      setHighScore(null);
      localStorage.removeItem('spellingBeeHighScore');
    }
  }, [resetAll]);

  const handleResetWords = useCallback(() => {
    if (window.confirm('Are you sure you want to restore the original word list? Your voice settings will be kept.')) {
      resetWords();
    }
  }, [resetWords]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FEF9EF] via-[#FFF8E7] to-[#FEF3C7]">
        <div className="text-center">
          <span className="text-6xl animate-bounce inline-block">🐝</span>
          <p className="text-[#1A1A2E] mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {currentScreen === 'home' && (
        <HomeScreen
          onStartQuiz={handleStartQuiz}
          onOpenSettings={handleOpenSettings}
          highScore={highScore}
          wordCount={words.length}
        />
      )}
      
      {currentScreen === 'quiz' && quizWords.length > 0 && (
        <SpellingQuiz
          words={quizWords}
          onComplete={handleQuizComplete}
          onExit={handleExitQuiz}
          speechRate={settings.speechRate}
          speechVoice={settings.speechVoice}
        />
      )}
      
      {currentScreen === 'results' && lastScore && (
        <ResultsScreen
          score={lastScore.score}
          total={lastScore.total}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
          isNewHighScore={isNewHighScore}
        />
      )}

      {currentScreen === 'settings' && (
        <SettingsPage
          settings={settings}
          words={words}
          onSaveSettings={saveSettings}
          onAddWord={addWord}
          onRemoveWord={removeWord}
          onUpdateWord={updateWord}
          onResetWords={handleResetWords}
          onResetAll={handleResetAll}
          onBack={handleGoHome}
          voices={voices}
          onTestVoice={handleTestVoice}
        />
      )}
    </div>
  );
}

export default App;
