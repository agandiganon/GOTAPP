import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        "canvas-soft": "rgb(var(--color-canvas-soft) / <alpha-value>)",
        panel: "rgb(var(--color-panel) / <alpha-value>)",
        "panel-strong": "rgb(var(--color-panel-strong) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
      },
      fontFamily: {
        body: ["var(--font-heebo)", "sans-serif"],
        display: ["var(--font-display)", "serif"],
      },
      boxShadow: {
        shell: "0 28px 90px rgba(0, 0, 0, 0.45)",
        panel: "0 18px 60px rgba(0, 0, 0, 0.32)",
        accent: "0 14px 42px rgba(203, 165, 92, 0.18)",
      },
      backgroundImage: {
        "panel-gradient":
          "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 100%)",
        "hero-glow":
          "radial-gradient(circle at top, rgba(203, 165, 92, 0.18), transparent 48%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.7", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.12)" },
        },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
