import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * P1.8b — ESLint 9 flat config.
 *
 * Two Next 16 changes forced this:
 *   1. `next lint` was removed. Running it now fails with
 *      "Invalid project directory provided, no such directory: .../lint",
 *      because `lint` is parsed as a CLI directory argument.
 *   2. `eslint-config-next@16` declares `eslint: ">=9.0.0"`, and ESLint 9+
 *      only supports flat config.
 *
 * This array is the flat-config equivalent of the previous `.eslintrc.json`,
 * which was `{ "extends": ["next/core-web-vitals", "next/typescript"] }`.
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // Newly strict in react-hooks@7 (React 19). These are pre-existing patterns
      // across 11 files — legitimate "sync props to state" / derived-state effects
      // that React 18 didn't flag. Fixing them is a real refactor, tracked as a
      // P1.6-followup, not part of the Next 16 / React 19 migration.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    // tailwind.config.ts legitimately uses require() to load the animate plugin
    // from the CommonJS ecosystem; the config is evaluated by Tailwind, not bundled
    // by Next. Keeping it require-based is the documented pattern.
    files: ["tailwind.config.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
