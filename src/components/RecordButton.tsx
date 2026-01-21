import React from 'react';
import { Mic, MicOff, Square } from 'lucide-react';
import { cn } from '../lib/utils';
import { SpellingPhase } from '../hooks/useSpeechRecognition';

interface RecordButtonProps {
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  disabled?: boolean;
  phase: SpellingPhase;
}

function getPhaseMessage(phase: SpellingPhase, isListening: boolean): React.ReactNode {
  if (!isListening) {
    return (
      <>
        Click to start recording
      </>
    );
  }
  
  switch (phase) {
    case 'word1':
      return (
        <span className="text-blue-600 font-semibold">
          🎤 Say the word first...
        </span>
      );
    case 'spelling':
      return (
        <span className="text-amber-600 font-semibold animate-pulse">
          🔤 Now spell it letter by letter...
        </span>
      );
    case 'word2':
      return (
        <span className="text-green-600 font-semibold">
          ✅ Great! Say the word again to finish
        </span>
      );
    case 'complete':
      return (
        <span className="text-green-600 font-semibold">
          🎉 Complete!
        </span>
      );
    default:
      return (
        <span className="text-red-600 font-semibold animate-pulse">
          🎤 Listening...
        </span>
      );
  }
}

export function RecordButton({ 
  isListening, 
  onStartListening, 
  onStopListening,
  disabled = false,
  phase,
}: RecordButtonProps) {
  
  const handleClick = () => {
    if (disabled) return;
    
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'relative w-32 h-32 md:w-40 md:h-40 rounded-full transition-all duration-200 select-none',
          'flex items-center justify-center',
          'focus:outline-none focus:ring-4 focus:ring-[#F4B942]/50',
          disabled && 'opacity-50 cursor-not-allowed',
          isListening 
            ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-2xl scale-110 animate-pulse-glow' 
            : 'bg-gradient-to-br from-[#F4B942] to-[#D4941C] shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95'
        )}
      >
        {/* Ripple effect when listening */}
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30" />
            <span className="absolute inset-4 rounded-full bg-red-400 animate-ping opacity-20" style={{ animationDelay: '150ms' }} />
          </>
        )}
        
        {/* Icon */}
        {isListening ? (
          <div className="relative z-10 flex flex-col items-center">
            <Mic className="w-10 h-10 md:w-12 md:h-12 text-white" />
            <span className="text-white text-xs mt-1 font-medium">Click to stop</span>
          </div>
        ) : (
          <MicOff className="w-12 h-12 md:w-16 md:h-16 text-[#1A1A2E] relative z-10" />
        )}
      </button>
      
      <div className="text-center text-[#1A1A2E]/70 font-medium text-sm md:text-base max-w-xs">
        {disabled ? (
          'Check your answer first!'
        ) : (
          getPhaseMessage(phase, isListening)
        )}
      </div>
      
      {/* Instructions */}
      {!isListening && !disabled && (
        <div className="text-center text-xs text-gray-500 max-w-xs">
          <p>Format: <span className="font-medium">WORD → Letters → WORD</span></p>
          <p className="mt-1">Example: "Apple. A-P-P-L-E. Apple."</p>
        </div>
      )}
    </div>
  );
}
