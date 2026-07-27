export const colors = {
  bg: "#0a0a14",
  surface: "#12122a",
  surface2: "#1a1a3e",
  card: "#1e1e42",
  accent: "#7c3aed",
  accent2: "#e94560",
  accent3: "#06b6d4",
  text: "#f0f0ff",
  muted: "#8888aa",
  subtle: "#4a4a6a",
  border: "#2a2a4e",
  success: "#22c55e",
  warning: "#f59e0b",
};

export const gradients = {
  primary: ["#7c3aed", "#e94560"] as const,
  primaryReversed: ["#e94560", "#7c3aed"] as const,
  background: ["#0a0a14", "#1a1a3e"] as const,
  card: ["#1e1e42", "#12122a"] as const,
  player: ["#1a1a3e", "#0a0a14"] as const,
  accent: ["#7c3aed", "#06b6d4"] as const,
  warm: ["#e94560", "#f59e0b"] as const,
};

export const tabBarStyle = {
  backgroundColor: "rgba(18, 18, 42, 0.85)",
  borderTopColor: "rgba(42, 42, 78, 0.5)",
  borderTopWidth: 1,
  height: 65,
  paddingBottom: 10,
  paddingTop: 6,
};
