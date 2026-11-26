const PRESETS = {
  vivid: { bar: "#5b3fd9", line: "#ff4d8d", accent: "#5b3fd9", donut: ["#bae6fd", "#38bdf8", "#5b3fd9", "#ff4d8d"] },
  black: { bar: "#111111", line: "#6b7280", accent: "#111111", donut: ["#d4d4d8", "#71717a", "#111111", "#ef4444"] },
  mint: { bar: "#0f766e", line: "#f59e0b", accent: "#0f766e", donut: ["#99f6e4", "#2dd4bf", "#0f766e", "#f43f5e"] },
} as const;

export const PALETTE = PRESETS.vivid; // change to PRESETS.black or PRESETS.mint
