import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { haptics } from "@/lib/haptics";
import { radius, useThemeColors } from "@/lib/theme";

export type OptionState = "idle" | "selected" | "correct" | "wrong";

type OptionCardProps = {
  text: string;
  emoji?: string;
  state: OptionState;
  onPress: () => void;
  disabled?: boolean;
  compact?: boolean;
};

export function OptionCard({
  text,
  emoji,
  state,
  onPress,
  disabled,
  compact,
}: OptionCardProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const stateColors: Record<OptionState, { border: string; bg: string; text: string }> = {
    idle: { border: colors.neutral200, bg: colors.neutral100, text: colors.text },
    selected: { border: colors.sky, bg: colors.sky + "22", text: colors.skyDark },
    correct: { border: colors.greenLight, bg: colors.correctBg, text: colors.correctText },
    wrong: { border: colors.rose, bg: colors.wrongBg, text: colors.wrongText },
  };
  const c = stateColors[state];

  return (
    <Pressable
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        compact ? styles.compact : styles.full,
        {
          borderColor: c.border,
          backgroundColor: c.bg,
          borderBottomWidth: pressed ? 2 : 4,
        },
      ]}
    >
      {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
      <View style={styles.textWrap}>
        <Text style={[styles.text, { color: c.text }]}>{text}</Text>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    card: {
      borderWidth: 2,
      borderRadius: radius.lg,
      alignItems: "center",
      justifyContent: "center",
    },
    full: {
      flexDirection: "row",
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      width: "100%",
    },
    compact: {
      flexBasis: "47%",
      flexGrow: 1,
      paddingVertical: 18,
      paddingHorizontal: 10,
      gap: 8,
    },
    emoji: { fontSize: 34 },
    textWrap: { flexShrink: 1 },
    text: { fontSize: 17, fontWeight: "700", textAlign: "center" },
  });
