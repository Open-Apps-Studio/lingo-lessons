import { useMemo } from "react";
import { useColorScheme } from "react-native";

import { useProgress, type ThemePreference } from "./store";

/**
 * Design tokens lifted from the web app's Tailwind palette
 * (sky/green/rose/indigo with darker bottom borders for the 3D effect).
 */
export const lightColors = {
  // brand
  green: "#22c55e",
  greenDark: "#16a34a",
  greenLight: "#4ade80",
  sky: "#38bdf8",
  skyDark: "#0ea5e9",
  rose: "#f43f5e",
  roseDark: "#e11d48",
  indigo: "#6366f1",
  indigoDark: "#4f46e5",
  amber: "#f59e0b",
  orange: "#ff9600",

  // neutrals
  white: "#ffffff",
  background: "#ffffff",
  text: "#3c3c3c",
  textMuted: "#737373",
  neutral100: "#f5f5f5",
  neutral200: "#e5e5e5",
  neutral300: "#d4d4d4",
  neutral400: "#a3a3a3",
  neutral700: "#404040",

  // feedback surfaces
  correctBg: "#d7ffb8",
  correctText: "#58a700",
  wrongBg: "#ffdfe0",
  wrongText: "#ea2b2b",
} as const;

export const darkColors = {
  ...lightColors,
  background: "#11161d",
  text: "#f2f5f8",
  textMuted: "#a3aeb9",
  neutral100: "#1a212a",
  neutral200: "#273240",
  neutral300: "#3a4757",
  neutral400: "#6f7f90",
  neutral700: "#e7ebf0",
  correctBg: "#1c3326",
  correctText: "#96eb71",
  wrongBg: "#432329",
  wrongText: "#ff99a1",
} as const;

export const colors = lightColors;
export type ThemeColors = typeof lightColors;
export type ThemeMode = "light" | "dark";

export function resolveThemeMode(
  preference: ThemePreference,
  systemScheme: "light" | "dark" | "unspecified" | null
): ThemeMode {
  if (preference === "light" || preference === "dark") return preference;
  return systemScheme === "dark" ? "dark" : "light";
}

export function useThemeMode() {
  const preference = useProgress((s) => s.themePreference);
  const systemScheme = useColorScheme();
  return resolveThemeMode(preference, systemScheme);
}

export function useThemeColors() {
  const mode = useThemeMode();
  return useMemo(() => (mode === "dark" ? darkColors : lightColors), [mode]);
}

export const radius = {
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

/** Units cycle through these (Duolingo-style section colors). */
export const unitPalette: { main: string; dark: string }[] = [
  { main: colors.green, dark: colors.greenDark },
  { main: colors.indigo, dark: colors.indigoDark },
  { main: colors.sky, dark: colors.skyDark },
  { main: colors.rose, dark: colors.roseDark },
  { main: colors.amber, dark: "#d97706" },
];
