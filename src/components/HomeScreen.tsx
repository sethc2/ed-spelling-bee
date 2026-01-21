import React, { useState } from 'react';
import { Button } from './ui/button';
import { Play, Settings, Trophy, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';

interface HomeScreenProps {
  onStartQuiz: (difficulty: 1 | 2 | 3 | 'all', count: number) => void;
  onOpenSettings: () => void;
  highScore: { score: number; total: number } | null;
  wordCount: number;
}

export function HomeScreen({ onStartQuiz, onOpenSettings, highScore, wordCount }: HomeScreenProps) {
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 'all'>('all');
  const [selectedCount, setSelectedCount] = useState(10);

  const difficulties: { value: 1 | 2 | 3 | 'all'; label: string; color: string; emoji: string }[] = [
    { value: 1, label: 'Easy', color: 'from-green-400 to-green-500', emoji: '🌱' },
    { value: 2, label: 'Medium', color: 'from-yellow-400 to-yellow-500', emoji: '🌿' },
    { value: 3, label: 'Hard', color: 'from-red-400 to-red-500', emoji: '🌳' },
    { value: 'all', label: 'All Words', color: 'from-purple-400 to-purple-500', emoji: '🌟' },
  ];

  const wordCounts = [5, 10, 15, 20];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      {/* Settings Button */}
      <div className="absolute top-4 right-4">
        <Button onClick={onOpenSettings} variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl animate-float opacity-30">🍯</div>
        <div className="absolute top-40 right-20 text-5xl animate-float opacity-30" style={{ animationDelay: '1s' }}>🐝</div>
        <div className="absolute bottom-40 left-20 text-4xl animate-float opacity-30" style={{ animationDelay: '2s' }}>🌻</div>
        <div className="absolute bottom-20 right-10 text-5xl animate-float opacity-30" style={{ animationDelay: '0.5s' }}>🍯</div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-lg space-y-8">
        {/* Logo & Title */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <span className="text-8xl md:text-9xl animate-float">🐝</span>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/10 rounded-full blur-sm" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A2E]">
            Spelling <span className="text-[#D4941C]">Bee</span>
          </h1>
          <p className="text-lg text-[#1A1A2E]/70">
            Practice your spelling with voice recognition!
          </p>
          <p className="text-sm text-[#1A1A2E]/50">
            {wordCount} words available
          </p>
        </div>

        {/* High Score Card */}
        {highScore && (
          <div className="bg-gradient-to-br from-[#FFD93D]/30 to-[#F4B942]/30 rounded-2xl p-4 border border-[#F4B942]/40">
            <div className="flex items-center justify-center gap-3">
              <Trophy className="w-6 h-6 text-[#D4941C]" />
              <span className="font-semibold text-[#1A1A2E]">
                Best Score: {highScore.score} / {highScore.total}
              </span>
            </div>
          </div>
        )}

        {/* Settings Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-[#F4B942]/20 space-y-6">
          {/* Difficulty Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#1A1A2E]">
              <Settings className="w-4 h-4" />
              Difficulty
            </label>
            <div className="grid grid-cols-2 gap-2">
              {difficulties.map(({ value, label, color, emoji }) => (
                <button
                  key={value}
                  onClick={() => setDifficulty(value)}
                  className={cn(
                    'p-3 rounded-xl font-medium transition-all duration-200',
                    'border-2 flex items-center justify-center gap-2',
                    difficulty === value
                      ? `bg-gradient-to-br ${color} text-white border-transparent shadow-lg scale-105`
                      : 'bg-white border-gray-200 text-gray-600 hover:border-[#F4B942]/50'
                  )}
                >
                  <span>{emoji}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Word Count Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#1A1A2E]">
              <BookOpen className="w-4 h-4" />
              Number of Words
            </label>
            <div className="flex gap-2">
              {wordCounts.map(count => (
                <button
                  key={count}
                  onClick={() => setSelectedCount(count)}
                  className={cn(
                    'flex-1 p-3 rounded-xl font-bold transition-all duration-200',
                    'border-2',
                    selectedCount === count
                      ? 'bg-gradient-to-br from-[#F4B942] to-[#D4941C] text-[#1A1A2E] border-transparent shadow-lg scale-105'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-[#F4B942]/50'
                  )}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start Button */}
        <Button
          onClick={() => onStartQuiz(difficulty, selectedCount)}
          size="xl"
          className="w-full gap-3 text-xl h-16"
        >
          <Play className="w-7 h-7" />
          Start Practice!
        </Button>

        {/* Instructions */}
        <div className="text-center text-sm text-[#1A1A2E]/60 space-y-1">
          <p>🎧 Listen to the word, then hold the button and spell it out loud</p>
          <p>💡 Say each letter clearly: "A... P... P... L... E"</p>
          <p>📝 For spaces say "space", for apostrophes say "apostrophe"</p>
        </div>
      </div>
    </div>
  );
}
