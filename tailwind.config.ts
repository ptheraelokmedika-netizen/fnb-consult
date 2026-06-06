import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#20211f",
        muted: "#6b6f68",
        line: "#d9ddd4",
        paper: "#f7f5ef",
        panel: "#ffffff",
        sage: "#6f8b74",
        clay: "#b5674f",
        saffron: "#d9a441",
        teal: "#3c8f8a"
      },
      boxShadow: {
        soft: "0 14px 40px rgba(42, 43, 39, 0.08)"
      }
    },
  },
  plugins: [],
};

export default config;
