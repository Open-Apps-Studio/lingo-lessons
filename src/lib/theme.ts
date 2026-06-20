/**
 * Design tokens lifted from the web app's Tailwind palette
 * (sky/green/rose/indigo with darker bottom borders for the 3D effect).
 */
export const colors = {
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
