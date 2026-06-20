import catalogJson from "../content/catalog.json";
import { PACKS } from "../content/packs/index";

import type { Catalog, LessonPack, Pack, UnitPack } from "./types";

export const catalog = catalogJson as Catalog;

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

let cachedCourseId: string | null = null;
let cachedList: LessonRef[] = [];
let cachedById = new Map<string, LessonRef>();

export function useCourseContent(courseId: string) {
  if (cachedCourseId !== courseId) {
    const pack = getPack(courseId);
    const { list, byId } = buildLessonIndex(pack);
    cachedCourseId = courseId;
    cachedList = list;
    cachedById = byId;
  }
  const pack = getPack(courseId);
  return {
    pack,
    allLessons: cachedList,
    getLesson: (id: string) => cachedById.get(id),
    getUnit: (unitId: string) => {
      for (const section of pack.sections) {
        const unit = section.units.find((u) => u.id === unitId);
        if (unit) return unit;
      }
      return undefined;
    },
    allWords: () => pack.sections.flatMap((s) => s.units.flatMap((u) => u.words)),
    getWord: (target: string) =>
      pack.sections
        .flatMap((s) => s.units.flatMap((u) => u.words))
        .find((w) => w.target === target),
  };
}
