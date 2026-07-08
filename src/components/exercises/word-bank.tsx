import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { SpeakerButton } from "@/components/speaker-button";
import { haptics } from "@/lib/haptics";
import { makeThemedStyles, radius, useThemeColors } from "@/lib/theme";
import type { WordBankExercise } from "@/lib/types";

type WordBankProps = {
  exercise: WordBankExercise;
  /** Indexes into exercise.tokens, in chosen order. */
  answer: number[];
  onAnswer: (tokenIndexes: number[]) => void;
  status: "none" | "correct" | "wrong";
};

export function WordBank({ exercise, answer, onAnswer, status }: WordBankProps) {
  const colors = useThemeColors();
  const styles = useStyles();
  const locked = status !== "none";

  const pick = (index: number) => {
    if (locked || answer.includes(index)) return;
    onAnswer([...answer, index]);
  };

  const unpick = (index: number) => {
    if (locked) return;
    onAnswer(answer.filter((i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Translate this sentence</Text>

      <View style={styles.promptRow}>
        {exercise.audioTarget ? <SpeakerButton text={exercise.audioTarget} /> : null}
        <Text style={styles.prompt}>{exercise.prompt}</Text>
      </View>

      <View
        style={[
          styles.answerArea,
          status === "correct" && { borderColor: colors.greenLight },
          status === "wrong" && { borderColor: colors.rose },
        ]}
      >
        {answer.map((tokenIndex) => (
          <Chip
            key={tokenIndex}
            label={exercise.tokens[tokenIndex]}
            onPress={() => unpick(tokenIndex)}
          />
        ))}
      </View>

      <View style={styles.pool}>
        {exercise.tokens.map((token, index) => {
          const used = answer.includes(index);
          return used ? (
            <View key={index} style={[styles.chip, styles.chipGhost]}>
              <Text style={[styles.chipText, { color: "transparent" }]}>{token}</Text>
            </View>
          ) : (
            <Chip key={index} label={token} onPress={() => pick(index)} />
          );
        })}
      </View>
    </View>
  );
}

function Chip({ label, onPress }: { label: string; onPress: () => void }) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={({ pressed }) => [styles.chip, { borderBottomWidth: pressed ? 2 : 4 }]}
    >
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: { gap: 20 },
    title: { fontSize: 22, fontWeight: "800", color: colors.neutral700 },
    promptRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    prompt: { fontSize: 20, fontWeight: "700", color: colors.text, flexShrink: 1 },
    answerArea: {
      minHeight: 56,
      borderTopWidth: 2,
      borderBottomWidth: 2,
      borderColor: colors.neutral200,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      paddingVertical: 8,
      alignItems: "center",
    },
    pool: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      justifyContent: "center",
    },
    chip: {
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.neutral200,
      borderRadius: radius.md,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    chipGhost: { backgroundColor: colors.neutral200, borderColor: colors.neutral200 },
    chipText: { fontSize: 17, fontWeight: "600", color: colors.text },
  })
);
