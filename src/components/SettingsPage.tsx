import React, { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { 
  ArrowLeft, 
  Volume2, 
  Mic, 
  Plus, 
  Trash2, 
  Save,
  RotateCcw,
  BookOpen,
  Search,
  Filter,
  Edit2,
  X,
  Check,
  List
} from 'lucide-react';
import { AppSettings, CustomWordList } from '../hooks/useSettings';
import { SpellingWord, getDifficultyLabel } from '../data/words';
import { cn } from '../lib/utils';

interface SettingsPageProps {
  settings: AppSettings;
  words: SpellingWord[];
  customLists: CustomWordList[];
  onSaveSettings: (settings: Partial<AppSettings>) => void;
  onAddWord: (word: SpellingWord) => void;
  onRemoveWord: (index: number) => void;
  onUpdateWord: (index: number, word: SpellingWord) => void;
  onResetWords: () => void;
  onResetAll: () => void;
  onBack: () => void;
  voices: SpeechSynthesisVoice[];
  onTestVoice: (text: string, rate: number, voiceURI: string) => void;
  onSaveCustomList: (name: string, wordIds: string[]) => void;
  onDeleteCustomList: (name: string) => void;
}

export function SettingsPage({
  settings,
  words,
  customLists,
  onSaveSettings,
  onAddWord,
  onRemoveWord,
  onResetWords,
  onResetAll,
  onBack,
  voices,
  onTestVoice,
  onSaveCustomList,
  onDeleteCustomList,
}: SettingsPageProps) {
  const [speechRate, setSpeechRate] = useState(settings.speechRate);
  const [selectedVoice, setSelectedVoice] = useState(settings.speechVoice);
  
  // New word form
  const [newWord, setNewWord] = useState('');
  const [newAlternate, setNewAlternate] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<1 | 2 | 3>(2);
  
  // Word list filters
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<1 | 2 | 3 | 'all'>('all');
  
  // Custom list management
  const [newListName, setNewListName] = useState('');
  const [editingListName, setEditingListName] = useState<string | null>(null);
  const [editingListWords, setEditingListWords] = useState<string[]>([]);
  
  // Filter voices to English ones
  const englishVoices = voices.filter(v => v.lang.startsWith('en'));

  useEffect(() => {
    setSpeechRate(settings.speechRate);
    setSelectedVoice(settings.speechVoice);
  }, [settings]);

  // Filter and search words
  const filteredWords = useMemo(() => {
    return words.filter(word => {
      const matchesSearch = searchQuery === '' || 
        word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (word.alternateSpelling?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDifficulty = difficultyFilter === 'all' || word.difficulty === difficultyFilter;
      return matchesSearch && matchesDifficulty;
    });
  }, [words, searchQuery, difficultyFilter]);

  // Count words by difficulty
  const wordCounts = useMemo(() => {
    return {
      total: words.length,
      easy: words.filter(w => w.difficulty === 1).length,
      medium: words.filter(w => w.difficulty === 2).length,
      hard: words.filter(w => w.difficulty === 3).length,
    };
  }, [words]);

  const handleSaveVoiceSettings = () => {
    onSaveSettings({
      speechRate,
      speechVoice: selectedVoice,
    });
  };

  const handleAddWord = () => {
    if (!newWord.trim()) return;
    
    // Check if word already exists
    const exists = words.some(w => w.word.toLowerCase() === newWord.trim().toLowerCase());
    if (exists) {
      alert('This word already exists in your list!');
      return;
    }
    
    onAddWord({
      word: newWord.trim(),
      alternateSpelling: newAlternate.trim() || undefined,
      difficulty: newDifficulty,
    });
    
    setNewWord('');
    setNewAlternate('');
    setNewDifficulty(2);
  };

  // Find the original index in the full words array
  const getOriginalIndex = (filteredIndex: number): number => {
    const word = filteredWords[filteredIndex];
    return words.findIndex(w => w.word === word.word);
  };

  // Custom list handlers
  const handleCreateList = () => {
    if (!newListName.trim()) {
      alert('Please enter a list name');
      return;
    }
    onSaveCustomList(newListName.trim(), []);
    setNewListName('');
  };

  const handleStartEdit = (list: CustomWordList) => {
    setEditingListName(list.name);
    setEditingListWords([...list.wordIds]);
  };

  const handleCancelEdit = () => {
    setEditingListName(null);
    setEditingListWords([]);
  };

  const handleSaveEdit = () => {
    if (!editingListName) return;
    onSaveCustomList(editingListName, editingListWords);
    setEditingListName(null);
    setEditingListWords([]);
  };

  const handleToggleWordInList = (wordId: string) => {
    if (!editingListName) return;
    setEditingListWords(prev => 
      prev.includes(wordId)
        ? prev.filter(id => id !== wordId)
        : [...prev, wordId]
    );
  };

  const handleDeleteList = (name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      onDeleteCustomList(name);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEF9EF] via-[#FFF8E7] to-[#FEF3C7]">
      {/* Header */}
      <header className="bg-white/50 backdrop-blur-sm border-b border-[#F4B942]/20 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button onClick={onBack} variant="ghost" size="sm" className="gap-2 text-[#1A1A2E]">
            <ArrowLeft className="w-4 h-4" />
            Home
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#D4941C]" />
              Word List
            </h2>
          </div>
          
          {/* Word count summary */}
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
              📚 Total: <strong>{wordCounts.total}</strong>
            </span>
            <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
              🌱 Easy: <strong>{wordCounts.easy}</strong>
            </span>
            <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
              🌿 Medium: <strong>{wordCounts.medium}</strong>
            </span>
            <span className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full">
              🌳 Hard: <strong>{wordCounts.hard}</strong>
            </span>
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
                onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
                className="p-3 border-2 border-gray-200 rounded-xl focus:border-[#F4B942] focus:outline-none bg-white"
              />
              <input
                type="text"
                placeholder="Alternate spelling (optional)"
                value={newAlternate}
                onChange={(e) => setNewAlternate(e.target.value)}
                className="p-3 border-2 border-gray-200 rounded-xl focus:border-[#F4B942] focus:outline-none bg-white"
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

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search words..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 p-3 border-2 border-gray-200 rounded-xl focus:border-[#F4B942] focus:outline-none bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value) as 1 | 2 | 3)}
                className="p-3 border-2 border-gray-200 rounded-xl focus:border-[#F4B942] focus:outline-none bg-white"
              >
                <option value="all">All Difficulties</option>
                <option value={1}>Easy</option>
                <option value={2}>Medium</option>
                <option value={3}>Hard</option>
              </select>
            </div>
          </div>

          {/* Words List */}
          <div className="space-y-2">
            <p className="text-sm text-gray-500 mb-2">
              Showing {filteredWords.length} of {words.length} words
            </p>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredWords.map((word, filteredIndex) => (
                <div
                  key={`${word.word}-${filteredIndex}`}
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-[#F4B942]/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-wrap">
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
                    onClick={() => onRemoveWord(getOriginalIndex(filteredIndex))}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {filteredWords.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  {searchQuery || difficultyFilter !== 'all' 
                    ? 'No words match your search criteria.'
                    : 'No words in your list. Add some words above!'}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Custom Lists Section */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#F4B942]/20">
          <h2 className="text-xl font-bold text-[#1A1A2E] mb-6 flex items-center gap-2">
            <List className="w-5 h-5 text-[#D4941C]" />
            Custom Word Lists
          </h2>

          {/* Create New List */}
          <div className="bg-[#FEF9EF] rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-[#1A1A2E] mb-3">Create New List</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="List name (e.g., 'My Practice Words')"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-[#F4B942] focus:outline-none bg-white text-[#1A1A2E]"
              />
              <Button onClick={handleCreateList} className="gap-2">
                <Plus className="w-4 h-4" />
                Create
              </Button>
            </div>
          </div>

          {/* Existing Lists */}
          {customLists.length === 0 ? (
            <div className="text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">No custom lists yet. Create one above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {customLists.map((list) => {
                const isEditing = editingListName === list.name;
                const listWords = words.filter(w => list.wordIds.includes(w.word));
                
                return (
                  <div
                    key={list.name}
                    className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50"
                  >
                    {!isEditing ? (
                      // View mode
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-[#1A1A2E]">{list.name}</h3>
                            <p className="text-sm text-gray-500">
                              {list.wordIds.length} word{list.wordIds.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleStartEdit(list)}
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDeleteList(list.name)}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {listWords.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {listWords.slice(0, 10).map((word) => (
                              <span
                                key={word.word}
                                className="text-xs bg-white px-2 py-1 rounded-full border border-gray-200 text-[#1A1A2E] font-medium"
                              >
                                {word.word}
                              </span>
                            ))}
                            {listWords.length > 10 && (
                              <span className="text-xs text-gray-500 px-2 py-1">
                                +{listWords.length - 10} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      // Edit mode
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={editingListName}
                            onChange={(e) => setEditingListName(e.target.value)}
                            className="flex-1 p-2 border-2 border-gray-200 rounded-lg focus:border-[#F4B942] focus:outline-none bg-white font-semibold"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={handleSaveEdit}
                              size="sm"
                              className="gap-2"
                            >
                              <Check className="w-4 h-4" />
                              Save
                            </Button>
                            <Button
                              onClick={handleCancelEdit}
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Select words for this list:
                          </p>
                          {words.map((word) => {
                            const isSelected = editingListWords.includes(word.word);
                            return (
                              <button
                                key={word.word}
                                onClick={() => handleToggleWordInList(word.word)}
                                className={cn(
                                  "w-full text-left p-2 rounded-lg border-2 transition-colors",
                                  isSelected
                                    ? "bg-[#F4B942]/20 border-[#F4B942]"
                                    : "bg-white border-gray-200 hover:border-gray-300"
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-[#1A1A2E]">{word.word}</span>
                                  {isSelected && (
                                    <Check className="w-4 h-4 text-[#D4941C]" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Reset Section */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-red-200">
          <h2 className="text-xl font-bold text-[#1A1A2E] mb-4">Reset Options</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div>
                <p className="font-medium text-amber-900">Reset Word List</p>
                <p className="text-sm text-amber-700">
                  Restore the original word list (300 words). Your settings will be kept.
                </p>
              </div>
              <Button
                onClick={onResetWords}
                variant="outline"
                className="gap-2 border-amber-400 text-amber-700 hover:bg-amber-100"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Words
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
              <div>
                <p className="font-medium text-red-900">Reset Everything</p>
                <p className="text-sm text-red-700">
                  Reset all settings and restore the original word list.
                </p>
              </div>
              <Button
                onClick={onResetAll}
                variant="destructive"
                className="gap-2 bg-red-500 hover:bg-red-600"
              >
                <RotateCcw className="w-4 h-4" />
                Reset All
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
