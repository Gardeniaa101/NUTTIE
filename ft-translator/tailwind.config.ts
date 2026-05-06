import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: [
          "var(--font-eb-garamond)",
          "Iowan Old Style",
          "Georgia",
          "serif"
        ],
        mono: [
          "var(--font-jetbrains-mono)",
          "ui-monospace",
          "monospace"
        ]
      }
    }
  },
  plugins: []
};

export default config;
