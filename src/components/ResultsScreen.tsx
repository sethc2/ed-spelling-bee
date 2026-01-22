import React, { useState } from 'react';
import { Button } from './ui/button';
import { Trophy, Star, Home, RotateCcw, ChevronDown, ChevronUp, Check, X, Save, Minus } from 'lucide-react';
import { QuizResult } from './SpellingQuiz';
import { getDifficultyLabel } from '../data/words';
import { cn } from '../lib/utils';

interface ResultsScreenProps {
  results: QuizResult[];
  onPlayAgain: () => void;
  onGoHome: () => void;
  isNewHighScore: boolean;
  onSaveWrongWordsAsList?: (wordIds: string[]) => void;
}

export function ResultsScreen({ results, onPlayAgain, onGoHome, isNewHighScore, onSaveWrongWordsAsList }: ResultsScreenProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Separate words by state
  const correctWords = results.filter(r => r.correct === true);
  const incorrectWords = results.filter(r => r.correct === false);
  const unansweredWords = results.filter(r => r.correct === null);
  
  // Only count answered words for score
  const answeredCount = correctWords.length + incorrectWords.length;
  const score = correctWords.length;
  const total = results.length;
  const percentage = answeredCount > 0 ? Math.round((score / answeredCount) * 100) : 0;

  const handleSaveWrongWords = () => {
    if (!onSaveWrongWordsAsList || incorrectWords.length === 0) return;
    const wordIds = incorrectWords.map(r => r.word.word);
    onSaveWrongWordsAsList(wordIds);
    alert(`Saved ${incorrectWords.length} words to "Last Wrong" list!`);
  };
  
  let message = '';
  let emoji = '';
  
  if (percentage === 100) {
    message = 'Perfect Score!';
    emoji = '🏆';
  } else if (percentage >= 80) {
    message = 'Excellent Work!';
    emoji = '🌟';
  } else if (percentage >= 60) {
    message = 'Good Job!';
    emoji = '👍';
  } else if (percentage >= 40) {
    message = 'Keep Practicing!';
    emoji = '💪';
  } else {
    message = 'Don\'t Give Up!';
    emoji = '🌱';
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-[#FEF9EF] via-[#FFF8E7] to-[#FEF3C7]">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {percentage >= 80 && (
          <>
            <div className="absolute top-1/4 left-1/4 text-4xl animate-float">⭐</div>
            <div className="absolute top-1/3 right-1/4 text-3xl animate-float" style={{ animationDelay: '0.5s' }}>✨</div>
            <div className="absolute bottom-1/3 left-1/3 text-4xl animate-float" style={{ animationDelay: '1s' }}>🌟</div>
            <div className="absolute bottom-1/4 right-1/3 text-3xl animate-float" style={{ animationDelay: '1.5s' }}>⭐</div>
          </>
        )}
      </div>

      {/* Results Card */}
      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-[#F4B942]/30 space-y-6 text-center">
          {/* New High Score Badge */}
          {isNewHighScore && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg animate-bounce">
              🎉 New High Score!
            </div>
          )}

          {/* Big Emoji */}
          <div className="text-8xl animate-bounce-in">{emoji}</div>

          {/* Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A2E]">
            {message}
          </h1>

          {/* Score Display */}
          <div className="bg-gradient-to-br from-[#FEF9EF] to-[#FEF3C7] rounded-2xl p-6 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-8 h-8 text-[#D4941C]" />
              <span className="text-5xl font-bold text-[#1A1A2E]">
                {score}
                <span className="text-2xl text-[#1A1A2E]/60">/{answeredCount}</span>
              </span>
            </div>
            {unansweredWords.length > 0 && (
              <p className="text-sm text-[#1A1A2E]/60">
                {unansweredWords.length} word{unansweredWords.length !== 1 ? 's' : ''} not answered
              </p>
            )}
            <div className="flex items-center justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${
                    i < Math.ceil(percentage / 20)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-lg text-[#1A1A2E]/70">
              {percentage}% Correct {answeredCount < total && `(${total} total)`}
            </p>
          </div>

          {/* Words Review */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-center gap-2 w-full p-3 rounded-xl text-[#1A1A2E]/70 hover:bg-gray-100 transition-colors"
          >
            {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            {showDetails ? 'Hide Words' : 'Show Words'}
          </button>

          {showDetails && (
            <div className="max-h-64 overflow-y-auto space-y-3 text-left">
              {/* Correct Words */}
              {correctWords.length > 0 && (
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-green-600 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Got It Right ({correctWords.length})
                  </h3>
                  {correctWords.map((result, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <span className="font-medium text-green-900">{result.word.word}</span>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        result.word.difficulty === 1 && 'bg-green-100 text-green-700',
                        result.word.difficulty === 2 && 'bg-yellow-100 text-yellow-700',
                        result.word.difficulty === 3 && 'bg-red-100 text-red-700',
                      )}>
                        {getDifficultyLabel(result.word.difficulty)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Incorrect Words */}
              {incorrectWords.length > 0 && (
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-red-600 flex items-center gap-1">
                    <X className="w-4 h-4" /> Needs Practice ({incorrectWords.length})
                  </h3>
                  {incorrectWords.map((result, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                      <span className="font-medium text-red-900">{result.word.word}</span>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        result.word.difficulty === 1 && 'bg-green-100 text-green-700',
                        result.word.difficulty === 2 && 'bg-yellow-100 text-yellow-700',
                        result.word.difficulty === 3 && 'bg-red-100 text-red-700',
                      )}>
                        {getDifficultyLabel(result.word.difficulty)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Unanswered Words */}
              {unansweredWords.length > 0 && (
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                    <Minus className="w-4 h-4" /> Didn't Get To ({unansweredWords.length})
                  </h3>
                  {unansweredWords.map((result, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">{result.word.word}</span>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        result.word.difficulty === 1 && 'bg-green-100 text-green-700',
                        result.word.difficulty === 2 && 'bg-yellow-100 text-yellow-700',
                        result.word.difficulty === 3 && 'bg-red-100 text-red-700',
                      )}>
                        {getDifficultyLabel(result.word.difficulty)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Save Wrong Words Button */}
          {incorrectWords.length > 0 && onSaveWrongWordsAsList && (
            <div className="w-full pt-2">
              <Button
                onClick={handleSaveWrongWords}
                variant="outline"
                size="lg"
                className="w-full gap-2 border-[#F4B942] text-[#D4941C] hover:bg-[#F4B942]/10 font-semibold"
              >
                <Save className="w-5 h-5" />
                Save Wrong Words as "Last Wrong" List
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={onPlayAgain}
              variant="default"
              size="lg"
              className="flex-1 gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Practice Again
            </Button>
            <Button
              onClick={onGoHome}
              variant="outline"
              size="lg"
              className="flex-1 gap-2"
            >
              <Home className="w-5 h-5" />
              Home
            </Button>
          </div>
        </div>

        {/* Bee */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-6xl animate-float">
          🐝
        </div>
      </div>
    </div>
  );
}
