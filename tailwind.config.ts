import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas:         "rgb(var(--color-canvas)       / <alpha-value>)",
        "canvas-soft":  "rgb(var(--color-canvas-soft)  / <alpha-value>)",
        panel:          "rgb(var(--color-panel)         / <alpha-value>)",
        "panel-strong": "rgb(var(--color-panel-strong)  / <alpha-value>)",
        accent:         "rgb(var(--color-accent)        / <alpha-value>)",
        danger:         "rgb(var(--color-danger)        / <alpha-value>)",
        ink:            "rgb(var(--color-ink)           / <alpha-value>)",
        muted:          "rgb(var(--color-muted)         / <alpha-value>)",
        line:           "rgb(var(--color-line)          / <alpha-value>)",
      },

      fontFamily: {
        body:    ["var(--font-heebo)",   "sans-serif"],
        display: ["var(--font-display)", "serif"],
        cinzel:  ["var(--font-cinzel)",  "serif"],
      },

      boxShadow: {
        shell:  "0 32px 100px rgba(0,0,0,0.55)",
        panel:  "0 20px 64px rgba(0,0,0,0.40)",
        accent: "0 12px 40px rgba(203,165,92,0.20)",
      },

      backgroundImage: {
        "panel-gradient":
          "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)",
        "hero-glow":
          "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(200,158,82,0.22), transparent 62%)",
        "iron-glow":
          "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(200,158,82,0.26), transparent 70%)",
      },

      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-4px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.7",  transform: "scale(1)" },
          "50%":      { opacity: "1",    transform: "scale(1.12)" },
        },
        shimmerSlide: {
          "0%":   { transform: "translateX(130%) skewX(-18deg)" },
          "100%": { transform: "translateX(-130%) skewX(-18deg)" },
        },
        cardReveal: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
      },

      animation: {
        float:         "float 5s ease-in-out infinite",
        "pulse-soft":  "pulseSoft 2.4s ease-in-out infinite",
        "shimmer":     "shimmerSlide 0.65s ease forwards",
        "card-reveal": "cardReveal 0.38s ease-out forwards",
        "fade-in":     "fadeIn 0.3s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
