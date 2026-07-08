import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import { SpeakerButton } from "@/components/speaker-button";
import { speakTarget } from "@/lib/audio";
import { useProgress } from "@/lib/store";
import { makeThemedStyles } from "@/lib/theme";
import type { SelectExercise } from "@/lib/types";

import { OptionCard, type OptionState } from "./option-card";

type SelectProps = {
  exercise: SelectExercise;
  answer: number | null;
  onAnswer: (index: number) => void;
  status: "none" | "correct" | "wrong";
  targetLanguage: string;
};

export function Select({
  exercise,
  answer,
  onAnswer,
  status,
  targetLanguage,
}: SelectProps) {
  const courseId = useProgress((s) => s.activeCourseId);
  const styles = useStyles();
  const hasEmoji = exercise.options.some((o) => o.emoji);
  const isListen = exercise.mode === "listen";

  useEffect(() => {
    if (isListen && exercise.audioTarget) speakTarget(courseId, exercise.audioTarget);
  }, [courseId, exercise.id, isListen, exercise.audioTarget]);

  const optionState = (index: number): OptionState => {
    if (status === "none") return answer === index ? "selected" : "idle";
    if (index === exercise.correct) return "correct";
    if (answer === index) return "wrong";
    return "idle";
  };

  const title =
    exercise.mode === "targetToNative"
      ? "What does this mean?"
      : exercise.mode === "nativeToTarget"
        ? `Pick the ${targetLanguage} word`
        : "Tap what you hear";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.promptRow}>
        {exercise.audioTarget ? <SpeakerButton text={exercise.audioTarget} /> : null}
        {!isListen ? <Text style={styles.prompt}>{exercise.prompt}</Text> : null}
      </View>

      <View style={[styles.options, hasEmoji && styles.grid]}>
        {exercise.options.map((option, index) => (
          <OptionCard
            key={option.text + index}
            text={option.text}
            emoji={option.emoji}
            compact={hasEmoji}
            state={optionState(index)}
            onPress={() => onAnswer(index)}
            disabled={status !== "none"}
          />
        ))}
      </View>
    </View>
  );
}

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: { gap: 20 },
    title: { fontSize: 22, fontWeight: "800", color: colors.neutral700 },
    promptRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    prompt: { fontSize: 22, fontWeight: "700", color: colors.text, flexShrink: 1 },
    options: { gap: 10 },
    grid: { flexDirection: "row", flexWrap: "wrap" },
  })
);
