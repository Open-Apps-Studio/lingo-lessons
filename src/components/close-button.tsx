import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

import { exitScreen } from "@/lib/navigation";
import { radius, useThemeColors } from "@/lib/theme";

/**
 * 44×44 close button (Apple's minimum touch target) — a bare text glyph was
 * too small to hit reliably, especially with large Dynamic Type sizes.
 */
export function CloseButton({ onPress }: { onPress?: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress ?? (() => exitScreen())}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Close"
      style={({ pressed }) => [
        styles.button,
        pressed && { backgroundColor: colors.neutral100 },
      ]}
    >
      <Ionicons name="close" size={28} color={colors.neutral400} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
});
