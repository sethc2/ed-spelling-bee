import defaultWordsJson from './defaultWords.json';

export interface SpellingWord {
  word: string;
  alternateSpelling?: string;
  difficulty: 1 | 2 | 3; // 1 = easy, 2 = medium, 3 = hard
}

// Load default words from JSON
export const defaultWords: SpellingWord[] = defaultWordsJson as SpellingWord[];

export function getWordsByDifficulty(
  words: SpellingWord[],
  difficulty: 1 | 2 | 3 | 'all'
): SpellingWord[] {
  if (difficulty === 'all') return words;
  return words.filter(w => w.difficulty === difficulty);
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getDifficultyLabel(difficulty: 1 | 2 | 3): string {
  switch (difficulty) {
    case 1: return 'Easy';
    case 2: return 'Medium';
    case 3: return 'Hard';
  }
}

export function getDifficultyColor(difficulty: 1 | 2 | 3): string {
  switch (difficulty) {
    case 1: return 'text-green-600';
    case 2: return 'text-yellow-600';
    case 3: return 'text-red-600';
  }
}

// Check if the entered word matches either the primary or alternate spelling
export function checkSpelling(entered: string, word: SpellingWord): boolean {
  const enteredLower = entered.toLowerCase();
  const primaryMatch = enteredLower === word.word.toLowerCase();
  const alternateMatch = word.alternateSpelling 
    ? enteredLower === word.alternateSpelling.toLowerCase()
    : false;
  return primaryMatch || alternateMatch;
}
