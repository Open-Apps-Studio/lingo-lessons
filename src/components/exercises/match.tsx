import React, { useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { speakTarget } from "@/lib/audio";
import { haptics } from "@/lib/haptics";
import { useProgress } from "@/lib/store";
import { useThemeColors } from "@/lib/theme";
import type { MatchExercise } from "@/lib/types";

import { OptionCard, type OptionState } from "./option-card";

type MatchProps = {
  exercise: MatchExercise;
  onComplete: (wrongAttempts: number) => void;
  onWordResult: (target: string, correct: boolean) => void;
};

function shuffleBy<T>(items: T[], seedText: string): T[] {
  let seed = 2166136261;
  for (const ch of seedText) {
    seed ^= ch.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  }
  const next = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function Match({ exercise, onComplete, onWordResult }: MatchProps) {
  const courseId = useProgress((s) => s.activeCourseId);
  const left = useMemo(
    () => shuffleBy(exercise.pairs.map((p) => p.target), exercise.id + "L"),
    [exercise]
  );
  const right = useMemo(
    () => shuffleBy(exercise.pairs.map((p) => p.native), exercise.id + "R"),
    [exercise]
  );
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [selectedNative, setSelectedNative] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongFlash, setWrongFlash] = useState<Set<string>>(new Set());
  const wrongAttempts = useRef(0);

  const targetOf = (native: string) => exercise.pairs.find((p) => p.native === native)?.target;

  const tryMatch = (target: string | null, native: string | null) => {
    if (!target || !native) return;
    const correct = targetOf(native) === target;
    onWordResult(target, correct);
    if (correct) {
      haptics.success();
      const next = new Set(matched).add(target);
      setMatched(next);
      if (next.size === exercise.pairs.length) onComplete(wrongAttempts.current);
    } else {
      haptics.error();
      wrongAttempts.current += 1;
      const flash = new Set([target, native]);
      setWrongFlash(flash);
      setTimeout(() => setWrongFlash(new Set()), 600);
    }
    setSelectedTarget(null);
    setSelectedNative(null);
  };

  const stateFor = (key: string, isMatchedKey: string, selected: boolean): OptionState => {
    if (matched.has(isMatchedKey)) return "correct";
    if (wrongFlash.has(key)) return "wrong";
    if (selected) return "selected";
    return "idle";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tap the matching pairs</Text>
      <View style={styles.columns}>
        <View style={styles.column}>
          {left.map((target) => (
            <OptionCard
              key={target}
              text={target}
              state={stateFor(target, target, selectedTarget === target)}
              disabled={matched.has(target)}
              onPress={() => {
                speakTarget(courseId, target);
                setSelectedTarget(target);
                tryMatch(target, selectedNative);
              }}
            />
          ))}
        </View>
        <View style={styles.column}>
          {right.map((native) => (
            <OptionCard
              key={native}
              text={native}
              state={stateFor(native, targetOf(native) ?? "", selectedNative === native)}
              disabled={matched.has(targetOf(native) ?? "")}
              onPress={() => {
                setSelectedNative(native);
                tryMatch(selectedTarget, native);
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    container: { gap: 20 },
    title: { fontSize: 22, fontWeight: "800", color: colors.neutral700 },
    columns: { flexDirection: "row", gap: 10 },
    column: { flex: 1, gap: 10 },
  });
