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
          50: "#FFF1F4",
          100: "#FEE4EA",
          200: "#FDC5D3",
          300: "#FCA1B8",
          400: "#FC83A1",
          500: "#FB6F92",
          600: "#E45377",
          700: "#C33C5E",
          800: "#A12B48",
          900: "#811D36",
        },
        secondary: {
          50: "#E6F0E6",
          100: "#CFE2CF",
          200: "#99C199",
          300: "#599A59",
          400: "#247A24",
          500: "#006400",
          600: "#005400",
          700: "#003F00",
          800: "#003000",
          900: "#002400",
        },
        accent: {
          DEFAULT: "#FB6F92",
          dark: "#E45377",
          light: "#FEE4EA",
          pale: "#FFF1F4",
        },
        // Add-to-cart CTA
        cart: {
          DEFAULT: "#FB6F92",
          dark: "#E45377",
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
        success: "#006400",
        gold: "#8B7355",
        peach: "#FCA1B8",
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
