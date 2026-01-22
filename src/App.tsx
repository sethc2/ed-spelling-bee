import React, { useState, useCallback, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { ListSelector } from './components/ListSelector';
import { SpellingQuiz, QuizResult } from './components/SpellingQuiz';
import { ResultsScreen } from './components/ResultsScreen';
import { SettingsPage } from './components/SettingsPage';
import { useSettings } from './hooks/useSettings';
import { useTextToSpeech } from './hooks/useTextToSpeech';
import { shuffleArray, SpellingWord } from './data/words';
import './App.css';

type Screen = 'home' | 'select' | 'quiz' | 'results' | 'settings';

interface HighScore {
  score: number;
  total: number;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [quizWords, setQuizWords] = useState<SpellingWord[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [highScore, setHighScore] = useState<HighScore | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const {
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
    getWordsForList,
    getWordsByDifficulty,
    saveCustomList,
    deleteCustomList,
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

  const handleGoToSelect = useCallback(() => {
    setCurrentScreen('select');
  }, []);

  const handleSelectPreset = useCallback((difficulty: 1 | 2 | 3 | 'all') => {
    const selectedWords = getWordsByDifficulty(difficulty);
    const shuffled = shuffleArray(selectedWords);
    setQuizWords(shuffled);
    setCurrentScreen('quiz');
  }, [getWordsByDifficulty]);

  const handleSelectCustomList = useCallback((listName: string) => {
    const selectedWords = getWordsForList(listName);
    const shuffled = shuffleArray(selectedWords);
    setQuizWords(shuffled);
    setCurrentScreen('quiz');
  }, [getWordsForList]);

  const handleQuizComplete = useCallback((results: QuizResult[]) => {
    setQuizResults(results);
    
    // Only count answered words for high score
    const answeredResults = results.filter(r => r.correct !== null);
    const score = answeredResults.filter(r => r.correct === true).length;
    const total = answeredResults.length;
    
    // Check for new high score (only if there are answered words)
    if (total > 0) {
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
    } else {
      setIsNewHighScore(false);
    }
    
    setCurrentScreen('results');
  }, [highScore]);

  const handlePlayAgain = useCallback(() => {
    // Go back to word selection
    setCurrentScreen('select');
  }, []);

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

  const handleSaveVoiceSettings = useCallback((rate: number, voice: string) => {
    saveSettings({ speechRate: rate, speechVoice: voice });
  }, [saveSettings]);

  const handleSaveWrongWordsAsList = useCallback((wordIds: string[]) => {
    saveCustomList('Last Wrong', wordIds);
  }, [saveCustomList]);

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
          onStartQuiz={handleGoToSelect}
          onOpenSettings={handleOpenSettings}
          highScore={highScore}
          wordCount={words.length}
        />
      )}

      {currentScreen === 'select' && (
        <ListSelector
          words={words}
          customLists={customLists}
          onSelectPreset={handleSelectPreset}
          onSelectCustomList={handleSelectCustomList}
          onBack={handleGoHome}
        />
      )}
      
      {currentScreen === 'quiz' && quizWords.length > 0 && (
        <SpellingQuiz
          words={quizWords}
          onComplete={handleQuizComplete}
          onExit={handleExitQuiz}
          speechRate={settings.speechRate}
          speechVoice={settings.speechVoice}
          onSaveVoiceSettings={handleSaveVoiceSettings}
        />
      )}
      
      {currentScreen === 'results' && quizResults.length > 0 && (
        <ResultsScreen
          results={quizResults}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
          isNewHighScore={isNewHighScore}
          onSaveWrongWordsAsList={handleSaveWrongWordsAsList}
        />
      )}

      {currentScreen === 'settings' && (
        <SettingsPage
          settings={settings}
          words={words}
          customLists={customLists}
          onSaveSettings={saveSettings}
          onAddWord={addWord}
          onRemoveWord={removeWord}
          onUpdateWord={updateWord}
          onResetWords={handleResetWords}
          onResetAll={handleResetAll}
          onBack={handleGoHome}
          voices={voices}
          onTestVoice={handleTestVoice}
          onSaveCustomList={saveCustomList}
          onDeleteCustomList={deleteCustomList}
        />
      )}
    </div>
  );
}

export default App;
