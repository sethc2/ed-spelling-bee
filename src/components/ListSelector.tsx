import React from 'react';
import { Button } from './ui/button';
import { CustomWordList } from '../hooks/useSettings';
import { SpellingWord } from '../data/words';
import { ArrowLeft, BookOpen, Sparkles, Leaf, Trees, Crown, List } from 'lucide-react';
import { cn } from '../lib/utils';

interface ListSelectorProps {
  words: SpellingWord[];
  customLists: CustomWordList[];
  onSelectPreset: (difficulty: 1 | 2 | 3 | 'all') => void;
  onSelectCustomList: (listName: string) => void;
  onBack: () => void;
}

export function ListSelector({
  words,
  customLists,
  onSelectPreset,
  onSelectCustomList,
  onBack,
}: ListSelectorProps) {
  // Count words by difficulty
  const allCount = words.length;
  const easyCount = words.filter(w => w.difficulty === 1).length;
  const mediumCount = words.filter(w => w.difficulty === 2).length;
  const hardCount = words.filter(w => w.difficulty === 3).length;

  const presetLists = [
    { 
      id: 'all' as const, 
      name: 'All Words', 
      count: allCount, 
      icon: BookOpen,
      color: 'from-purple-400 to-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    { 
      id: 1 as const, 
      name: 'Easy', 
      count: easyCount, 
      icon: Sparkles,
      color: 'from-green-400 to-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    { 
      id: 2 as const, 
      name: 'Medium', 
      count: mediumCount, 
      icon: Leaf,
      color: 'from-yellow-400 to-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    { 
      id: 3 as const, 
      name: 'Hard', 
      count: hardCount, 
      icon: Trees,
      color: 'from-red-400 to-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEF9EF] via-[#FFF8E7] to-[#FEF3C7]">
      {/* Header */}
      <header className="bg-white/50 backdrop-blur-sm border-b border-[#F4B942]/20 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button onClick={onBack} variant="ghost" size="sm" className="gap-2 text-[#1A1A2E]">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-[#1A1A2E]">Choose a Word List</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 md:p-8 space-y-8">
        {/* Decorative */}
        <div className="text-center">
          <span className="text-6xl animate-float inline-block">🐝</span>
          <h2 className="text-2xl font-bold text-[#1A1A2E] mt-2">
            What do you want to practice?
          </h2>
        </div>

        {/* Preset Lists */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#1A1A2E]/70 uppercase tracking-wider">
            Difficulty Levels
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {presetLists.map((list) => {
              const Icon = list.icon;
              return (
                <button
                  key={list.id}
                  onClick={() => onSelectPreset(list.id)}
                  disabled={list.count === 0}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all duration-200",
                    "flex flex-col items-center gap-2 text-center",
                    "hover:scale-105 hover:shadow-lg",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                    list.bgColor,
                    list.borderColor,
                    "hover:border-[#F4B942]"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    `bg-gradient-to-br ${list.color} text-white`
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-[#1A1A2E]">{list.name}</span>
                  <span className="text-sm text-[#1A1A2E]/60">{list.count} words</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Lists */}
        {customLists.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#1A1A2E]/70 uppercase tracking-wider flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Your Custom Lists
            </h3>
            <div className="space-y-2">
              {customLists.map((list) => {
                const wordCount = list.wordIds.length;
                return (
                  <button
                    key={list.name}
                    onClick={() => onSelectCustomList(list.name)}
                    disabled={wordCount === 0}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 border-[#F4B942]/30 bg-white/80",
                      "flex items-center gap-4 text-left",
                      "hover:border-[#F4B942] hover:shadow-md transition-all duration-200",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F4B942] to-[#D4941C] flex items-center justify-center">
                      <List className="w-5 h-5 text-[#1A1A2E]" />
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-[#1A1A2E]">{list.name}</span>
                      <p className="text-sm text-[#1A1A2E]/60">{wordCount} words</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* No custom lists message */}
        {customLists.length === 0 && (
          <div className="text-center p-6 bg-white/50 rounded-2xl border border-dashed border-[#F4B942]/40">
            <p className="text-[#1A1A2E]/60">
              No custom lists yet. Create one in Settings!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
