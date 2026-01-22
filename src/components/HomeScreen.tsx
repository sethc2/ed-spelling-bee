import React from 'react';
import { Button } from './ui/button';
import { Play, Settings, Trophy } from 'lucide-react';

interface HomeScreenProps {
  onStartQuiz: () => void;
  onOpenSettings: () => void;
  highScore: { score: number; total: number } | null;
  wordCount: number;
}

export function HomeScreen({ onStartQuiz, onOpenSettings, highScore, wordCount }: HomeScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-[#FEF9EF] via-[#FFF8E7] to-[#FEF3C7]">
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
            Practice your spelling skills!
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

        {/* How it works */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-[#F4B942]/20 space-y-4">
          <h2 className="text-lg font-semibold text-[#1A1A2E] text-center">How it works</h2>
          <div className="space-y-3 text-sm text-[#1A1A2E]/70">
            <div className="flex items-start gap-3">
              <span className="text-xl">🎧</span>
              <p>Listen to the word being pronounced</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">✏️</span>
              <p>Write down the spelling on paper</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">👁️</span>
              <p>Click "Reveal" to see the correct spelling</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">✓</span>
              <p>Mark if you got it right or wrong</p>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <Button
          onClick={onStartQuiz}
          size="xl"
          className="w-full gap-3 text-xl h-16"
        >
          <Play className="w-7 h-7" />
          Start Practice
        </Button>

        {/* Tip */}
        <p className="text-center text-sm text-[#1A1A2E]/50">
          💡 Tip: You can also hear definitions and example sentences!
        </p>
      </div>
    </div>
  );
}
