import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { colors, radius } from "@/lib/theme";

type Variant = "primary" | "secondary" | "danger" | "super" | "locked" | "white";

const palette: Record<Variant, { bg: string; border: string; text: string }> = {
  primary: { bg: colors.sky, border: colors.skyDark, text: colors.white },
  secondary: { bg: colors.green, border: colors.greenDark, text: colors.white },
  danger: { bg: colors.rose, border: colors.roseDark, text: colors.white },
  super: { bg: colors.indigo, border: colors.indigoDark, text: colors.white },
  locked: { bg: colors.neutral200, border: colors.neutral400, text: colors.neutral400 },
  white: { bg: colors.white, border: colors.neutral200, text: colors.textMuted },
};

type DuoButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** The web app's 3D button: darker bottom border that collapses on press. */
export function DuoButton({
  label,
  onPress,
  variant = "secondary",
  disabled,
  style,
}: DuoButtonProps) {
  const c = palette[disabled ? "locked" : variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: c.bg,
          borderColor: c.border,
          borderBottomWidth: pressed ? 0 : 4,
          marginTop: pressed ? 4 : 0,
        },
        variant === "white" && { borderWidth: 2, borderBottomWidth: pressed ? 2 : 4 },
        style,
      ]}
    >
      <Text style={[styles.label, { color: c.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  label: {
    fontWeight: "800",
    fontSize: 15,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});
