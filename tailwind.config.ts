import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FFF0F2",
          100: "#FFE1E5",
          200: "#FFC1C8",
          300: "#FF9BA6",
          400: "#FF7B8A",
          500: "#FF6675",
          600: "#E84F61",
          700: "#C7384E",
          800: "#A72842",
          900: "#851B35",
        },
        secondary: {
          50: "#EEF7EF",
          100: "#D9EDD9",
          200: "#B5DDB9",
          300: "#88CA91",
          400: "#4FB35F",
          500: "#0B6623",
          600: "#09561E",
          700: "#074018",
          800: "#053112",
          900: "#03260E",
        },
        accent: {
          DEFAULT: "#FF6675",
          dark: "#E84F61",
          light: "#FFE1E5",
          pale: "#FFF0F2",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          warm: "#FAF8F6",
          soft: "#F5F0EC",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          soft: "#5A5550",
          muted: "#9A948E",
        },
        border: {
          DEFAULT: "#EAE6E1",
          light: "#F2EFEC",
        },
        success: "#0B6623",
        gold: "#8B7355",
        peach: "#E8A69A",
      },
      fontFamily: {
        serif: ["var(--font-lora)", "Georgia", "serif"],
        sans: ["Satoshi", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        DEFAULT: "12px",
        lg: "20px",
        xl: "28px",
      },
      boxShadow: {
        sm: "0 1px 3px rgba(26,26,26,0.04)",
        DEFAULT: "0 4px 20px rgba(26,26,26,0.06)",
        lg: "0 12px 40px rgba(26,26,26,0.1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        twinkle: {
          "0%, 100%": { opacity: "1", transform: "scale(1) rotate(0deg)" },
          "50%": { opacity: "0.35", transform: "scale(1.25) rotate(45deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        twinkle: "twinkle 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
