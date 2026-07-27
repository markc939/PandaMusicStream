/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        panda: {
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
        },
      },
      fontFamily: {
        sans: ["System", "Helvetica", "Arial", "sans-serif"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
        "3xl": "24px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(124, 58, 237, 0.3)",
        "glow-pink": "0 0 20px rgba(233, 69, 96, 0.3)",
        card: "0 4px 24px rgba(0, 0, 0, 0.4)",
      },
    },
  },
  plugins: [],
};
