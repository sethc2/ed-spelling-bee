import React from 'react';
import { cn } from '../lib/utils';

interface LetterDisplayProps {
  enteredCharacters: string[];
  showResult: boolean;
  isCorrect: boolean;
  correctWord?: string;
}

export function LetterDisplay({ 
  enteredCharacters, 
  showResult, 
  isCorrect,
  correctWord 
}: LetterDisplayProps) {
  const displayChars = enteredCharacters.length > 0 ? enteredCharacters : [];
  
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Entered letters display */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-3 p-4 min-h-[80px]">
        {displayChars.length === 0 ? (
          <div className="text-gray-400 text-xl italic">
            Start speaking letters...
          </div>
        ) : (
          displayChars.map((char, index) => {
            const isSpace = char === ' ';
            const isSpecial = char === "'" || char === '-' || char === '.';
            
            let charClassName = cn(
              'letter-slot flex items-center justify-center text-2xl md:text-4xl font-bold rounded-xl border-3 transition-all duration-300',
              isSpace ? 'w-8 h-14 md:w-10 md:h-20' : 'w-12 h-14 md:w-16 md:h-20',
              isSpecial && 'w-8 h-14 md:w-10 md:h-20'
            );
            
            if (showResult) {
              if (isCorrect) {
                charClassName = cn(charClassName, 'bg-gradient-to-br from-green-400 to-green-500 border-green-600 text-white');
              } else {
                charClassName = cn(charClassName, 'bg-gradient-to-br from-red-400 to-red-500 border-red-600 text-white');
              }
            } else {
              charClassName = cn(charClassName, 'bg-gradient-to-br from-[#FFD93D] to-[#F4B942] border-[#D4941C] text-[#1A1A2E] shadow-lg animate-bounce-in');
            }
            
            return (
              <div
                key={index}
                className={charClassName}
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  borderWidth: '3px'
                }}
              >
                {isSpace ? (
                  <span className="text-sm opacity-50">␣</span>
                ) : (
                  char.toUpperCase()
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* Show correct word when wrong */}
      {showResult && !isCorrect && correctWord && (
        <div className="text-center mt-2">
          <p className="text-gray-600 text-sm mb-1">Correct spelling:</p>
          <p className="text-2xl font-bold text-[#1A1A2E] letter-slot tracking-wider">
            {correctWord.toUpperCase()}
          </p>
        </div>
      )}
      
      {/* Character count */}
      {displayChars.length > 0 && !showResult && (
        <p className="text-sm text-gray-500">
          {displayChars.length} character{displayChars.length !== 1 ? 's' : ''} entered
        </p>
      )}
    </div>
  );
}
