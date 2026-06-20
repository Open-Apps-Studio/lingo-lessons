/** Content pack types — keep in sync with content/schema.ts */

export type Word = {
  target: string;
  native: string;
  emoji: string;
  romanization?: string;
};

export type SelectExercise = {
  type: "select";
  id: string;
  mode: "targetToNative" | "nativeToTarget" | "listen";
  prompt: string;
  audioTarget?: string;
  options: { text: string; emoji?: string }[];
  correct: number;
};

export type WordBankExercise = {
  type: "wordBank";
  id: string;
  direction: "targetToNative" | "nativeToTarget";
  prompt: string;
  audioTarget?: string;
  tokens: string[];
  answer: string[];
};

export type MatchExercise = {
  type: "match";
  id: string;
  pairs: { target: string; native: string }[];
};

export type TypeAnswerExercise = {
  type: "typeAnswer";
  id: string;
  mode: "translate" | "listen";
  prompt: string;
  audioTarget?: string;
  answer: string;
  alternatives: string[];
};

export type FillBlankExercise = {
  type: "fillBlank";
  id: string;
  sentence: string;
  translation: string;
  audioTarget?: string;
  options: string[];
  correct: number;
};

export type Exercise =
  | SelectExercise
  | WordBankExercise
  | MatchExercise
  | TypeAnswerExercise
  | FillBlankExercise;

export type LessonPack = { id: string; title: string; exercises: Exercise[] };

export type UnitPack = {
  id: string;
  title: string;
  description: string;
  guidebook: string;
  words: Word[];
  lessons: LessonPack[];
};

export type SectionPack = { id: string; title: string; units: UnitPack[] };

export type Pack = {
  id: string;
  version: number;
  targetLanguage: string;
  targetCode: string;
  nativeLanguage: string;
  nativeCode: string;
  flag: string;
  sections: SectionPack[];
};

export type CatalogCourse = {
  id: string;
  targetLanguage: string;
  targetCode: string;
  nativeLanguage: string;
  flag: string;
  unitCount: number;
  lessonCount: number;
};

export type Catalog = {
  version: number;
  courses: CatalogCourse[];
};
