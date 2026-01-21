import React from 'react';
import { Button } from './ui/button';
import { Trophy, Star, Home, RotateCcw } from 'lucide-react';

interface ResultsScreenProps {
  score: number;
  total: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
  isNewHighScore: boolean;
}

export function ResultsScreen({ score, total, onPlayAgain, onGoHome, isNewHighScore }: ResultsScreenProps) {
  const percentage = Math.round((score / total) * 100);
  
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
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
      <div className="relative z-10 w-full max-w-md">
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
                <span className="text-2xl text-[#1A1A2E]/60">/{total}</span>
              </span>
            </div>
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
              {percentage}% Correct
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={onPlayAgain}
              variant="default"
              size="lg"
              className="flex-1 gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
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
