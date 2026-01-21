import React from 'react';
import { cn } from '../lib/utils';

interface LetterSlotsProps {
  targetWord: string;
  enteredLetters: string[];
  showResult: boolean;
  isCorrect: boolean;
}

export function LetterSlots({ targetWord, enteredLetters, showResult, isCorrect }: LetterSlotsProps) {
  const targetLetters = targetWord.toUpperCase().split('');
  
  return (
    <div className="flex flex-wrap justify-center gap-2 md:gap-3 p-4">
      {targetLetters.map((targetLetter, index) => {
        const enteredLetter = enteredLetters[index] || '';
        const hasLetter = enteredLetter !== '';
        const isLetterCorrect = enteredLetter.toUpperCase() === targetLetter;
        
        let slotClassName = 'letter-slot w-12 h-14 md:w-16 md:h-20 flex items-center justify-center text-2xl md:text-4xl font-bold rounded-xl border-3 transition-all duration-300';
        
        if (showResult) {
          if (isLetterCorrect) {
            slotClassName += ' bg-gradient-to-br from-green-400 to-green-500 border-green-600 text-white';
          } else if (hasLetter) {
            slotClassName += ' bg-gradient-to-br from-red-400 to-red-500 border-red-600 text-white';
          } else {
            slotClassName += ' bg-gradient-to-br from-gray-200 to-gray-300 border-gray-400 text-gray-600';
          }
        } else if (hasLetter) {
          slotClassName += ' bg-gradient-to-br from-[#FFD93D] to-[#F4B942] border-[#D4941C] text-[#1A1A2E] shadow-lg';
        } else {
          slotClassName += ' bg-white/80 border-[#D4941C]/30 text-gray-400';
        }
        
        // Add animation class for newly added letters
        const animationDelay = hasLetter ? `${index * 50}ms` : '0ms';
        
        return (
          <div
            key={index}
            className={cn(
              slotClassName,
              hasLetter && !showResult && 'animate-bounce-in',
              showResult && !isLetterCorrect && hasLetter && 'animate-shake'
            )}
            style={{ 
              animationDelay,
              borderWidth: '3px'
            }}
          >
            {showResult && !hasLetter ? (
              <span className="text-gray-500">{targetLetter}</span>
            ) : (
              enteredLetter || '_'
            )}
          </div>
        );
      })}
    </div>
  );
}
