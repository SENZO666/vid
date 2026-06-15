// Design tokens for the Budget Tracker app.
// Earthy / organic light-first palette with a polished dark mode.

export const palette = {
  // Brand
  primary: "#2C5545",
  primaryDark: "#48826C",
  accent: "#D87E6A",
  warning: "#D8AC6A",
  danger: "#C94F4F",
  // Backgrounds
  bg: "#FAF9F6",
  card: "#FFFFFF",
  // Text
  text: "#1A1D1C",
  textMuted: "#6C7470",
  // Surface
  border: "#E2E4E2",
  secondary: "#E8EFEA",
  muted: "#F0F0ED",
  // Chart palette
  chart: ["#D87E6A", "#6EA4D8", "#8BA89D", "#D8AC6A", "#A58BA8", "#48826C", "#E48E7B"],
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
} as const;

export const typography = {
  h1: { fontSize: 30, fontWeight: "700" as const, letterSpacing: -0.4 },
  h2: { fontSize: 22, fontWeight: "600" as const, letterSpacing: -0.2 },
  h3: { fontSize: 18, fontWeight: "600" as const },
  body: { fontSize: 15, fontWeight: "400" as const, lineHeight: 22 },
  small: { fontSize: 13, fontWeight: "400" as const },
  overline: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 1.6,
    textTransform: "uppercase" as const,
  },
};

export const shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
};

// Default category colors (matches the original Kotlin ChipGroup palette).
export const categoryColors = [
  "#2C5545",
  "#D87E6A",
  "#6EA4D8",
  "#D8AC6A",
  "#A58BA8",
  "#8BA89D",
  "#E06868",
];
