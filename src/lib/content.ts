import catalogJson from "../content/catalog.json";
import { PACKS } from "../content/packs/index";

import type { Catalog, LessonPack, Pack, UnitPack, Word } from "./types";

export const catalog = catalogJson as Catalog;

/** Courses for pickers: deepest course first (Spanish), then alphabetical. */
export const orderedCourses = [...catalog.courses].sort(
  (a, b) =>
    b.unitCount - a.unitCount || a.targetLanguage.localeCompare(b.targetLanguage)
);

export function getPack(courseId: string): Pack {
  const pack = PACKS[courseId];
  if (!pack) throw new Error(`Unknown course: ${courseId}`);
  return pack;
}

export type LessonRef = {
  lesson: LessonPack;
  unit: UnitPack;
  globalIndex: number;
};

function buildLessonIndex(pack: Pack): { list: LessonRef[]; byId: Map<string, LessonRef> } {
  const list: LessonRef[] = [];
  const byId = new Map<string, LessonRef>();
  let index = 0;
  for (const section of pack.sections) {
    for (const unit of section.units) {
      for (const lesson of unit.lessons) {
        const ref = { lesson, unit, globalIndex: index++ };
        list.push(ref);
        byId.set(lesson.id, ref);
      }
    }
  }
  return { list, byId };
}

type CourseCacheEntry = {
  pack: Pack;
  list: LessonRef[];
  byId: Map<string, LessonRef>;
  unitById: Map<string, UnitPack>;
  allWords: Word[];
  wordByTarget: Map<string, Word>;
};

const courseCache = new Map<string, CourseCacheEntry>();

function getCourseCache(courseId: string): CourseCacheEntry {
  let cached = courseCache.get(courseId);
  if (!cached) {
    const pack = getPack(courseId);
    const { list, byId } = buildLessonIndex(pack);
    const unitById = new Map<string, UnitPack>();
    for (const section of pack.sections) {
      for (const unit of section.units) {
        unitById.set(unit.id, unit);
      }
    }
    const allWords = pack.sections.flatMap((s) => s.units.flatMap((u) => u.words));
    const wordByTarget = new Map<string, Word>();
    for (const w of allWords) {
      if (!wordByTarget.has(w.target)) {
        wordByTarget.set(w.target, w);
      }
    }
    cached = { pack, list, byId, unitById, allWords, wordByTarget };
    courseCache.set(courseId, cached);
  }
  return cached;
}

export function useCourseContent(courseId: string) {
  const cached = getCourseCache(courseId);
  return {
    pack: cached.pack,
    allLessons: cached.list,
    getLesson: (id: string) => cached.byId.get(id),
    getUnit: (unitId: string) => cached.unitById.get(unitId),
    allWords: () => cached.allWords,
    getWord: (target: string) => cached.wordByTarget.get(target),
  };
}
