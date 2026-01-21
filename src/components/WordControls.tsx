import React from 'react';
import { Volume2, RotateCcw, BookOpen, MessageSquareQuote, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface WordControlsProps {
  onHearWord: () => void;
  onHearDefinition?: () => void;
  onHearExample?: () => void;
  onReset: () => void;
  isSpeaking: boolean;
  hasDefinition?: boolean;
  hasExample?: boolean;
  isLoadingDictionary?: boolean;
  disabled?: boolean;
}

export function WordControls({
  onHearWord,
  onHearDefinition,
  onHearExample,
  onReset,
  isSpeaking,
  hasDefinition = false,
  hasExample = false,
  isLoadingDictionary = false,
  disabled = false,
}: WordControlsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 md:gap-3 p-4">
      {/* Hear Word Button */}
      <Button
        onClick={onHearWord}
        disabled={isSpeaking || disabled}
        variant="default"
        size="lg"
        className={cn(
          "gap-2 min-w-[120px]",
          isSpeaking && "animate-pulse"
        )}
      >
        <Volume2 className="w-5 h-5" />
        Hear Word
      </Button>
      
      {/* Definition Button */}
      <Button
        onClick={onHearDefinition}
        disabled={isSpeaking || disabled || !hasDefinition || isLoadingDictionary}
        variant="outline"
        size="lg"
        className="gap-2"
        title={!hasDefinition ? "Definition not available" : "Hear the definition"}
      >
        {isLoadingDictionary ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <BookOpen className="w-5 h-5" />
        )}
        Definition
      </Button>
      
      {/* Example Button */}
      <Button
        onClick={onHearExample}
        disabled={isSpeaking || disabled || !hasExample || isLoadingDictionary}
        variant="outline"
        size="lg"
        className="gap-2"
        title={!hasExample ? "Example not available" : "Hear an example sentence"}
      >
        {isLoadingDictionary ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <MessageSquareQuote className="w-5 h-5" />
        )}
        Example
      </Button>
      
      {/* Reset Button */}
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
