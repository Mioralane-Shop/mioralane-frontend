/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // P1.8d — Tailwind 4 moved the PostCSS plugin out of the `tailwindcss`
    // package into its own `@tailwindcss/postcss`. Vendor prefixing and
    // `postcss-import` are now built in, so neither is listed here.
    "@tailwindcss/postcss": {},
  },
};

export default config;
