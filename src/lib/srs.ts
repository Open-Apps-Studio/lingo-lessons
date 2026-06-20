/** SM-2-ish spaced repetition for vocabulary review. */

export type SrsEntry = {
  /** Days until next review. */
  interval: number;
  /** Ease multiplier (starts at 2.5). */
  ease: number;
  /** Unix ms when the word is due. */
  dueAt: number;
  /** Successful reviews in a row. */
  streak: number;
};

export const DEFAULT_EASE = 2.5;
export const MIN_EASE = 1.3;

/** Quality 0 = wrong, 1 = hard-but-correct, 2 = good. */
export function reviewWord(entry: SrsEntry | undefined, quality: 0 | 1 | 2): SrsEntry {
  const now = Date.now();
  const base: SrsEntry = entry ?? { interval: 0, ease: DEFAULT_EASE, dueAt: now, streak: 0 };

  if (quality === 0) {
    return { interval: 0, ease: Math.max(MIN_EASE, base.ease - 0.2), dueAt: now, streak: 0 };
  }

  const newStreak = base.streak + 1;
  let interval: number;
  if (newStreak === 1) interval = 1;
  else if (newStreak === 2) interval = 3;
  else interval = Math.round(base.interval * base.ease);

  const ease =
    quality === 1
      ? Math.max(MIN_EASE, base.ease - 0.15)
      : Math.min(3.0, base.ease + 0.05);

  return {
    interval,
    ease,
    streak: newStreak,
    dueAt: now + interval * 86_400_000,
  };
}

export function isDue(entry: SrsEntry | undefined, now = Date.now()) {
  return !entry || entry.dueAt <= now;
}

export function dueInDays(entry: SrsEntry, now = Date.now()) {
  const ms = entry.dueAt - now;
  if (ms <= 0) return 0;
  return Math.ceil(ms / 86_400_000);
}
