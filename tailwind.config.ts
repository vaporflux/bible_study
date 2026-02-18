import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: "#f5f0e8",
        "parchment-dark": "#e8e0d0",
        leather: "#4a3728",
        "leather-light": "#6b5344",
        gold: "#c9a84c",
        "gold-light": "#e0c878",
        ink: "#2c1810",
        "ink-light": "#4a3020",
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        display: ["Palatino Linotype", "Book Antiqua", "Palatino", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
