import { useColorScheme } from "react-native";

import { useProgress } from "./store";

/**
 * Design tokens lifted from the web app's Tailwind palette
 * (sky/green/rose/indigo with darker bottom borders for the 3D effect).
 *
 * Colors come in a light and a dark palette with identical keys. Components
 * resolve the active palette through `useThemeColors()` / `makeThemedStyles()`
 * based on the user's preference (device setting by default, overridable in
 * the profile settings).
 */
const lightColors = {
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
  /** Card / chip surfaces that sit on the background. */
  surface: "#ffffff",
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
  selectedBg: "#e0f2fe",
  selectedText: "#0ea5e9",
} as const;

export type ThemeColors = { [K in keyof typeof lightColors]: string };

/** Duolingo-style night palette: deep blue-gray, brighter accents for contrast. */
const darkColors: ThemeColors = {
  // brand (unchanged — these read fine on the dark background)
  green: "#22c55e",
  greenDark: "#16a34a",
  greenLight: "#4ade80",
  sky: "#38bdf8",
  skyDark: "#0ea5e9",
  rose: "#f43f5e",
  roseDark: "#e11d48",
  indigo: "#818cf8",
  indigoDark: "#4f46e5",
  amber: "#f59e0b",
  orange: "#ff9600",

  // neutrals
  white: "#ffffff",
  background: "#131f24",
  surface: "#1b272e",
  text: "#e8eef1",
  textMuted: "#9aabb4",
  neutral100: "#1e2c33",
  neutral200: "#37464f",
  neutral300: "#43555f",
  neutral400: "#5f7681",
  neutral700: "#dce6ea",

  // feedback surfaces
  correctBg: "#1d3a1e",
  correctText: "#8bd94a",
  wrongBg: "#3a2126",
  wrongText: "#ff7b89",
  selectedBg: "#12303f",
  selectedText: "#38bdf8",
};

export const radius = {
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

/** Units cycle through these (Duolingo-style section colors). */
export const unitPalette: { main: string; dark: string }[] = [
  { main: lightColors.green, dark: lightColors.greenDark },
  { main: lightColors.indigo, dark: lightColors.indigoDark },
  { main: lightColors.sky, dark: lightColors.skyDark },
  { main: lightColors.rose, dark: lightColors.roseDark },
  { main: lightColors.amber, dark: "#d97706" },
];

/**
 * The color scheme in effect right now: the user's explicit choice, or the
 * device setting when the preference is "system".
 */
export function useResolvedScheme(): "light" | "dark" {
  const preference = useProgress((s) => s.themePreference);
  const system = useColorScheme();
  if (preference === "system") return system === "dark" ? "dark" : "light";
  return preference;
}

export function useThemeColors(): ThemeColors {
  return useResolvedScheme() === "dark" ? darkColors : lightColors;
}

/**
 * Theme-aware replacement for a module-level `StyleSheet.create`:
 *
 *   const useStyles = makeThemedStyles((colors) => StyleSheet.create({...}));
 *
 * The factory runs once per palette; the styles are cached so re-renders and
 * remounts reuse the same StyleSheet objects.
 */
export function makeThemedStyles<T>(factory: (colors: ThemeColors) => T): () => T {
  const cache = new Map<ThemeColors, T>();
  return function useThemedStyles(): T {
    const colors = useThemeColors();
    let styles = cache.get(colors);
    if (!styles) {
      styles = factory(colors);
      cache.set(colors, styles);
    }
    return styles;
  };
}
