import React from 'react';
import { Volume2, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface WordControlsProps {
  onHearWord: () => void;
  onHearDefinition?: () => void;
  onHearExample?: () => void;
  onReset: () => void;
  isSpeaking: boolean;
  hasExample?: boolean;
  disabled?: boolean;
  showDefinition?: boolean;
}

export function WordControls({
  onHearWord,
  onReset,
  isSpeaking,
  disabled = false,
}: WordControlsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3 p-4">
      <Button
        onClick={onHearWord}
        disabled={isSpeaking || disabled}
        variant="default"
        size="lg"
        className={cn(
          "gap-2 min-w-[140px]",
          isSpeaking && "animate-pulse"
        )}
      >
        <Volume2 className="w-5 h-5" />
        Hear Word
      </Button>
      
      <Button
        onClick={onReset}
        disabled={disabled}
        variant="secondary"
        size="lg"
        className="gap-2"
      >
        <RotateCcw className="w-5 h-5" />
        Reset
      </Button>
    </div>
  );
}
