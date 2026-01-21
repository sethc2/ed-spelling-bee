import React from 'react';
import { CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';

interface ResultDisplayProps {
  isCorrect: boolean;
  correctWord: string;
  onNextWord: () => void;
  onTryAgain: () => void;
}

export function ResultDisplay({ isCorrect, correctWord, onNextWord, onTryAgain }: ResultDisplayProps) {
  return (
    <div className={`
      p-6 rounded-2xl text-center space-y-4 transition-all duration-500
      ${isCorrect 
        ? 'bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-400' 
        : 'bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-400'
      }
    `}>
      <div className="flex items-center justify-center gap-3">
        {isCorrect ? (
          <>
            <CheckCircle className="w-10 h-10 text-green-600" />
            <span className="text-2xl md:text-3xl font-bold text-green-700">
              🎉 Correct!
            </span>
          </>
        ) : (
          <>
            <XCircle className="w-10 h-10 text-red-600" />
            <span className="text-2xl md:text-3xl font-bold text-red-700">
              Not quite...
            </span>
          </>
        )}
      </div>
      
      {!isCorrect && (
        <p className="text-lg text-red-700">
          The correct spelling is: <strong className="letter-slot text-xl">{correctWord.toUpperCase()}</strong>
        </p>
      )}
      
      <div className="flex justify-center gap-4 pt-2">
        {!isCorrect && (
          <Button onClick={onTryAgain} variant="outline" size="lg" className="gap-2">
            <RotateCcw className="w-5 h-5" />
            Try Again
          </Button>
        )}
        <Button onClick={onNextWord} variant="default" size="lg" className="gap-2">
          Next Word
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
