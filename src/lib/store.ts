import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { isDue, reviewWord, type SrsEntry } from "./srs";

export const XP_PER_LESSON = 15;
export const XP_PERFECT_BONUS = 5;
export const DAILY_GOAL_OPTIONS = [10, 20, 30, 50] as const;
export const DEFAULT_DAILY_GOAL = 20;
export const DEFAULT_COURSE = "es-en";
/** Days of per-day history kept for the streak calendar and quests. */
const DAY_HISTORY_LIMIT = 70;

export type ThemePreference = "system" | "light" | "dark";
export type WordStat = { correct: number; wrong: number; lastSeen: number };
export type MistakeRef = { lessonId: string; exerciseId: string };
export type DayActivity = { xp: number; lessons: number; perfect: number };

export type CourseProgress = {
  xp: number;
  completedLessons: Record<string, true>;
  mistakes: MistakeRef[];
  wordStats: Record<string, WordStat>;
  srs: Record<string, SrsEntry>;
};

function emptyCourseProgress(): CourseProgress {
  return {
    xp: 0,
    completedLessons: {},
    mistakes: [],
    wordStats: {},
    srs: {},
  };
}

function dayString(date: Date) {
  return date.toISOString().slice(0, 10);
}

type ProgressState = {
  activeCourseId: string;
  streak: number;
  lastActiveDay: string | null;
  dailyGoal: number;
  dailyXp: number;
  dailyXpDay: string | null;
  onboardingDone: boolean;
  /** "system" follows the device's light/dark setting. */
  themePreference: ThemePreference;
  courses: Record<string, CourseProgress>;
  /** Per-day activity across courses, for the streak calendar and quests. */
  activeDays: Record<string, DayActivity>;

  course: () => CourseProgress;
  completeLesson: (lessonId: string, perfect: boolean) => void;
  addMistake: (mistake: MistakeRef) => void;
  clearMistake: (exerciseId: string) => void;
  recordWord: (target: string, correct: boolean) => void;
  reviewSrsWord: (target: string, correct: boolean) => void;
  setActiveCourse: (courseId: string) => void;
  setThemePreference: (preference: ThemePreference) => void;
  finishOnboarding: (courseId: string, goal: number) => void;
};

function bumpDailyXp(state: ProgressState, amount: number) {
  const today = dayString(new Date());
  const dailyXpDay = state.dailyXpDay === today ? state.dailyXpDay : today;
  const dailyXp = dailyXpDay === today ? state.dailyXp + amount : amount;
  return { dailyXp, dailyXpDay };
}

function pruneDays(days: Record<string, DayActivity>) {
  const keys = Object.keys(days).sort();
  if (keys.length <= DAY_HISTORY_LIMIT) return days;
  const keep = new Set(keys.slice(-DAY_HISTORY_LIMIT));
  return Object.fromEntries(Object.entries(days).filter(([k]) => keep.has(k)));
}

function updateCourse(
  state: ProgressState,
  courseId: string,
  fn: (c: CourseProgress) => CourseProgress
): Partial<ProgressState> {
  const prev = state.courses[courseId] ?? emptyCourseProgress();
  return { courses: { ...state.courses, [courseId]: fn(prev) } };
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      activeCourseId: DEFAULT_COURSE,
      streak: 0,
      lastActiveDay: null,
      dailyGoal: DEFAULT_DAILY_GOAL,
      dailyXp: 0,
      dailyXpDay: null,
      onboardingDone: false,
      themePreference: "system",
      courses: {},
      activeDays: {},

      course: () => get().courses[get().activeCourseId] ?? emptyCourseProgress(),

      completeLesson: (lessonId, perfect) =>
        set((state) => {
          const today = dayString(new Date());
          const yesterday = dayString(new Date(Date.now() - 86_400_000));
          const streak =
            state.lastActiveDay === today
              ? state.streak
              : state.lastActiveDay === yesterday
                ? state.streak + 1
                : 1;
          const earned = XP_PER_LESSON + (perfect ? XP_PERFECT_BONUS : 0);
          const daily = bumpDailyXp(state, earned);
          const prevDay = state.activeDays[today] ?? { xp: 0, lessons: 0, perfect: 0 };
          const activeDays = pruneDays({
            ...state.activeDays,
            [today]: {
              xp: prevDay.xp + earned,
              lessons: prevDay.lessons + 1,
              perfect: prevDay.perfect + (perfect ? 1 : 0),
            },
          });
          const courseUpdate = updateCourse(state, state.activeCourseId, (c) => ({
            ...c,
            xp: c.xp + earned,
            completedLessons: { ...c.completedLessons, [lessonId]: true },
          }));
          return { streak, lastActiveDay: today, activeDays, ...daily, ...courseUpdate };
        }),

      addMistake: (mistake) =>
        set((state) =>
          updateCourse(state, state.activeCourseId, (c) =>
            c.mistakes.some((m) => m.exerciseId === mistake.exerciseId)
              ? c
              : { ...c, mistakes: [...c.mistakes, mistake] }
          )
        ),

      clearMistake: (exerciseId) =>
        set((state) =>
          updateCourse(state, state.activeCourseId, (c) => ({
            ...c,
            mistakes: c.mistakes.filter((m) => m.exerciseId !== exerciseId),
          }))
        ),

      recordWord: (target, correct) =>
        set((state) =>
          updateCourse(state, state.activeCourseId, (c) => {
            const prev = c.wordStats[target] ?? { correct: 0, wrong: 0, lastSeen: 0 };
            const quality = correct ? (prev.wrong > prev.correct ? 1 : 2) : 0;
            return {
              ...c,
              wordStats: {
                ...c.wordStats,
                [target]: {
                  correct: prev.correct + (correct ? 1 : 0),
                  wrong: prev.wrong + (correct ? 0 : 1),
                  lastSeen: Date.now(),
                },
              },
              srs: { ...c.srs, [target]: reviewWord(c.srs[target], quality) },
            };
          })
        ),

      reviewSrsWord: (target, correct) =>
        set((state) =>
          updateCourse(state, state.activeCourseId, (c) => ({
            ...c,
            srs: { ...c.srs, [target]: reviewWord(c.srs[target], correct ? 2 : 0) },
          }))
        ),

      setActiveCourse: (courseId) => set({ activeCourseId: courseId }),

      setThemePreference: (preference) => set({ themePreference: preference }),

      finishOnboarding: (courseId, goal) =>
        set({ activeCourseId: courseId, dailyGoal: goal, onboardingDone: true }),
    }),
    {
      name: "progress-v2",
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted: unknown) => {
        const old = persisted as Record<string, unknown>;
        if (old.courses) return persisted as ProgressState;
        // Migrate v1 flat progress → per-course.
        const legacy = old as {
          xp?: number;
          completedLessons?: Record<string, true>;
          mistakes?: MistakeRef[];
          wordStats?: Record<string, WordStat>;
          srs?: Record<string, SrsEntry>;
        };
        return {
          activeCourseId: DEFAULT_COURSE,
          streak: old.streak ?? 0,
          lastActiveDay: old.lastActiveDay ?? null,
          dailyGoal: old.dailyGoal ?? DEFAULT_DAILY_GOAL,
          dailyXp: old.dailyXp ?? 0,
          dailyXpDay: old.dailyXpDay ?? null,
          onboardingDone: old.onboardingDone ?? false,
          courses: {
            [DEFAULT_COURSE]: {
              xp: legacy.xp ?? 0,
              completedLessons: legacy.completedLessons ?? {},
              mistakes: legacy.mistakes ?? [],
              wordStats: legacy.wordStats ?? {},
              srs: legacy.srs ?? {},
            },
          },
        };
      },
    }
  )
);

export function currentLessonIndex(
  completed: Record<string, true>,
  lessonIds: string[]
) {
  const firstIncomplete = lessonIds.findIndex((id) => !completed[id]);
  return firstIncomplete === -1 ? lessonIds.length : firstIncomplete;
}

export function dailyXpToday(state: Pick<ProgressState, "dailyXp" | "dailyXpDay">) {
  const today = dayString(new Date());
  return state.dailyXpDay === today ? state.dailyXp : 0;
}

/**
 * The streak as it should be displayed *now*: the stored value goes stale if a
 * full day was missed (it's only recomputed on lesson completion).
 */
export function currentStreak(
  state: Pick<ProgressState, "streak" | "lastActiveDay">,
  now = new Date()
) {
  const today = dayString(now);
  const yesterday = dayString(new Date(now.getTime() - 86_400_000));
  return state.lastActiveDay === today || state.lastActiveDay === yesterday
    ? state.streak
    : 0;
}

/** True once a lesson has been completed today (used to light up the flame). */
export function activeToday(state: Pick<ProgressState, "lastActiveDay">) {
  return state.lastActiveDay === dayString(new Date());
}

export function todayActivity(
  state: Pick<ProgressState, "activeDays">
): DayActivity {
  return (
    state.activeDays[dayString(new Date())] ?? { xp: 0, lessons: 0, perfect: 0 }
  );
}

export type Quest = {
  id: string;
  label: string;
  target: number;
  value: number;
  done: boolean;
};

export function dailyQuests(
  state: Pick<ProgressState, "activeDays" | "dailyGoal">
): Quest[] {
  const today = todayActivity(state);
  const make = (id: string, label: string, target: number, value: number): Quest => ({
    id,
    label,
    target,
    value: Math.min(value, target),
    done: value >= target,
  });
  return [
    make("xp", `Earn ${state.dailyGoal} XP`, state.dailyGoal, today.xp),
    make("lessons", "Complete 3 lessons", 3, today.lessons),
    make("perfect", "Get 1 perfect lesson", 1, today.perfect),
  ];
}

/** Rolling 7-day window ending today, for the streak calendar strip. */
export function lastSevenDays(state: Pick<ProgressState, "activeDays">) {
  const out: { day: string; weekday: string; active: boolean; isToday: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86_400_000);
    const day = dayString(date);
    out.push({
      day,
      weekday: ["S", "M", "T", "W", "T", "F", "S"][date.getDay()],
      active: (state.activeDays[day]?.lessons ?? 0) > 0,
      isToday: i === 0,
    });
  }
  return out;
}

export function dueSrsWords(srs: Record<string, SrsEntry>, now = Date.now()) {
  return Object.entries(srs)
    .filter(([, entry]) => isDue(entry, now))
    .map(([target]) => target);
}
