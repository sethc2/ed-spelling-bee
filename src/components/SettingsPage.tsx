import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { 
  ArrowLeft, 
  Volume2, 
  Mic, 
  Plus, 
  Trash2, 
  Save,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { AppSettings } from '../hooks/useSettings';
import { SpellingWord, getDifficultyLabel } from '../data/words';
import { cn } from '../lib/utils';

interface SettingsPageProps {
  settings: AppSettings;
  onSaveSettings: (settings: Partial<AppSettings>) => void;
  onAddWord: (word: SpellingWord) => void;
  onRemoveWord: (index: number) => void;
  onUpdateWord: (index: number, word: SpellingWord) => void;
  onResetSettings: () => void;
  onBack: () => void;
  voices: SpeechSynthesisVoice[];
  onTestVoice: (text: string, rate: number, voiceURI: string) => void;
}

export function SettingsPage({
  settings,
  onSaveSettings,
  onAddWord,
  onRemoveWord,
  onUpdateWord,
  onResetSettings,
  onBack,
  voices,
  onTestVoice,
}: SettingsPageProps) {
  const [speechRate, setSpeechRate] = useState(settings.speechRate);
  const [selectedVoice, setSelectedVoice] = useState(settings.speechVoice);
  const [useCustomWords, setUseCustomWords] = useState(settings.useCustomWords);
  
  // New word form
  const [newWord, setNewWord] = useState('');
  const [newAlternate, setNewAlternate] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<1 | 2 | 3>(2);
  
  // Filter voices to English ones
  const englishVoices = voices.filter(v => v.lang.startsWith('en'));

  useEffect(() => {
    setSpeechRate(settings.speechRate);
    setSelectedVoice(settings.speechVoice);
    setUseCustomWords(settings.useCustomWords);
  }, [settings]);

  const handleSaveVoiceSettings = () => {
    onSaveSettings({
      speechRate,
      speechVoice: selectedVoice,
    });
  };

  const handleAddWord = () => {
    if (!newWord.trim()) return;
    
    onAddWord({
      word: newWord.trim(),
      alternateSpelling: newAlternate.trim() || undefined,
      difficulty: newDifficulty,
    });
    
    setNewWord('');
    setNewAlternate('');
    setNewDifficulty(2);
  };

  const handleToggleCustomWords = () => {
    const newValue = !useCustomWords;
    setUseCustomWords(newValue);
    onSaveSettings({ useCustomWords: newValue });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEF9EF] via-[#FFF8E7] to-[#FEF3C7]">
      {/* Header */}
      <header className="bg-white/50 backdrop-blur-sm border-b border-[#F4B942]/20 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button onClick={onBack} variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Settings</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        {/* Voice Settings Section */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#F4B942]/20">
          <h2 className="text-xl font-bold text-[#1A1A2E] mb-6 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-[#D4941C]" />
            Voice Settings
          </h2>
          
          <div className="space-y-6">
            {/* Speech Rate */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#1A1A2E]">
                Speech Speed: {speechRate.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#F4B942]"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Slower</span>
                <span>Normal</span>
                <span>Faster</span>
              </div>
            </div>

            {/* Voice Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#1A1A2E]">
                Voice
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#F4B942] focus:outline-none bg-white"
              >
                <option value="">Default Voice</option>
                {englishVoices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* Test & Save Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => onTestVoice('Testing spelling bee voice', speechRate, selectedVoice)}
                variant="outline"
                className="gap-2"
              >
                <Mic className="w-4 h-4" />
                Test Voice
              </Button>
              <Button onClick={handleSaveVoiceSettings} className="gap-2">
                <Save className="w-4 h-4" />
                Save Voice Settings
              </Button>
            </div>
          </div>
        </section>

        {/* Word List Section */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#F4B942]/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#D4941C]" />
              Word List
            </h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useCustomWords}
                onChange={handleToggleCustomWords}
                className="w-5 h-5 accent-[#F4B942] rounded"
              />
              <span className="text-sm font-medium text-[#1A1A2E]">
                Use custom words only
              </span>
            </label>
          </div>

          {/* Add New Word Form */}
          <div className="bg-[#FEF9EF] rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-[#1A1A2E] mb-3">Add New Word</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Word"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                className="p-3 border-2 border-gray-200 rounded-xl focus:border-[#F4B942] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Alternate spelling (optional)"
                value={newAlternate}
                onChange={(e) => setNewAlternate(e.target.value)}
                className="p-3 border-2 border-gray-200 rounded-xl focus:border-[#F4B942] focus:outline-none"
              />
              <select
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(parseInt(e.target.value) as 1 | 2 | 3)}
                className="p-3 border-2 border-gray-200 rounded-xl focus:border-[#F4B942] focus:outline-none bg-white"
              >
                <option value={1}>Easy</option>
                <option value={2}>Medium</option>
                <option value={3}>Hard</option>
              </select>
              <Button onClick={handleAddWord} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Word
              </Button>
            </div>
          </div>

          {/* Custom Words List */}
          {settings.customWords.length > 0 ? (
            <div className="space-y-2">
              <h3 className="font-semibold text-[#1A1A2E] mb-3">
                Your Custom Words ({settings.customWords.length})
              </h3>
              <div className="max-h-80 overflow-y-auto space-y-2">
                {settings.customWords.map((word, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-[#1A1A2E]">{word.word}</span>
                      {word.alternateSpelling && (
                        <span className="text-sm text-gray-500">
                          (alt: {word.alternateSpelling})
                        </span>
                      )}
                      <span className={cn(
                        'text-xs font-medium px-2 py-1 rounded-full',
                        word.difficulty === 1 && 'bg-green-100 text-green-700',
                        word.difficulty === 2 && 'bg-yellow-100 text-yellow-700',
                        word.difficulty === 3 && 'bg-red-100 text-red-700',
                      )}>
                        {getDifficultyLabel(word.difficulty)}
                      </span>
                    </div>
                    <Button
                      onClick={() => onRemoveWord(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No custom words added yet. Add some words above to create your own spelling list!
            </p>
          )}
        </section>

        {/* Reset Section */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-red-200">
          <h2 className="text-xl font-bold text-[#1A1A2E] mb-4">Reset</h2>
          <p className="text-gray-600 mb-4">
            This will reset all settings to defaults and remove all custom words.
          </p>
          <Button
            onClick={onResetSettings}
            variant="destructive"
            className="gap-2 bg-red-500 hover:bg-red-600"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All Settings
          </Button>
        </section>
      </main>
    </div>
  );
}
