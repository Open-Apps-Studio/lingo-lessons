import React, { useEffect, useMemo } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { SpeakerButton } from "@/components/speaker-button";
import { speakTarget } from "@/lib/audio";
import { useProgress } from "@/lib/store";
import { radius, useThemeColors } from "@/lib/theme";
import type { TypeAnswerExercise } from "@/lib/types";

type TypeAnswerProps = {
  exercise: TypeAnswerExercise;
  answer: string;
  onAnswer: (text: string) => void;
  status: "none" | "correct" | "wrong";
  targetLanguage: string;
};

export function TypeAnswer({
  exercise,
  answer,
  onAnswer,
  status,
  targetLanguage,
}: TypeAnswerProps) {
  const courseId = useProgress((s) => s.activeCourseId);
  const isListen = exercise.mode === "listen";
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    if (isListen && exercise.audioTarget) speakTarget(courseId, exercise.audioTarget);
  }, [courseId, exercise.id, isListen, exercise.audioTarget]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isListen ? `Type what you hear (${targetLanguage})` : "Write this in English"}
      </Text>

      <View style={styles.promptRow}>
        {exercise.audioTarget ? <SpeakerButton text={exercise.audioTarget} /> : null}
        {!isListen ? <Text style={styles.prompt}>{exercise.prompt}</Text> : null}
      </View>

      <TextInput
        value={answer}
        onChangeText={onAnswer}
        editable={status === "none"}
        placeholder={isListen ? `Type in ${targetLanguage}` : "Type in English"}
        placeholderTextColor={colors.neutral400}
        autoCapitalize="none"
        autoCorrect={false}
        multiline
        style={[
          styles.input,
          status === "correct" && { borderColor: colors.greenLight },
          status === "wrong" && { borderColor: colors.rose },
        ]}
      />
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    container: { gap: 20 },
    title: { fontSize: 22, fontWeight: "800", color: colors.neutral700 },
    promptRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    prompt: { fontSize: 20, fontWeight: "700", color: colors.text, flexShrink: 1 },
    input: {
      minHeight: 110,
      borderWidth: 2,
      borderColor: colors.neutral200,
      borderRadius: radius.lg,
      backgroundColor: colors.neutral100,
      padding: 14,
      fontSize: 17,
      color: colors.text,
      textAlignVertical: "top",
    },
  });
