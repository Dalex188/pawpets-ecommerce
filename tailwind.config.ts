import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1573B6",
        secondary: "#57C2D1",
        accent: "#E28A37",
        background: "#FFFFFF",
        foreground: "#1F2937",
      },
      fontFamily: {
        sans: ["Nunito", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
