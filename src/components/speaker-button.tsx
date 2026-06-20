import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

import { speakTarget } from "@/lib/audio";
import { useProgress } from "@/lib/store";
import { colors, radius } from "@/lib/theme";

export function SpeakerButton({
  text,
  size = 44,
}: {
  text: string;
  size?: number;
}) {
  const courseId = useProgress((s) => s.activeCourseId);
  return (
    <Pressable
      onPress={() => speakTarget(courseId, text)}
      accessibilityRole="button"
      accessibilityLabel="Play audio"
      style={({ pressed }) => [
        styles.button,
        { width: size, height: size, opacity: pressed ? 0.7 : 1 },
      ]}
      hitSlop={8}
    >
      <Ionicons name="volume-high" size={size * 0.55} color={colors.white} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.sky,
    borderColor: colors.skyDark,
    borderBottomWidth: 4,
    borderRadius: radius.md,
  },
});
