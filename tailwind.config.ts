import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0b0a",        // near-black base
        onyx: "#141312",       // panel black
        gold: "#c9a24b",       // primary gold accent
        "gold-soft": "#e4cf9c",
        cream: "#f3ecd9",      // cream text on black
        parchment: "#f8f4ea",  // light-section background
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        body: ["var(--font-cormorant)", "serif"],
        sans: ["var(--font-jost)", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.25em",
      },
    },
  },
  plugins: [],
};
export default config;
