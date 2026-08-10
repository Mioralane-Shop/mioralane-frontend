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
          50: "#FDF4F6",
          100: "#F2D4DA",
          200: "#E8B4BF",
          300: "#D4637A",
          400: "#D4637A",
          500: "#D4637A",
          600: "#B84E64",
          700: "#9E3A50",
          800: "#7A2D3E",
          900: "#5C1F2E",
        },
        accent: {
          DEFAULT: "#D4637A",
          dark: "#B84E64",
          light: "#F2D4DA",
          pale: "#FDF4F6",
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
        success: "#6B8F71",
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
