import type { Config } from "tailwindcss";

/**
 * Tailwind v4 primarily uses CSS-first config (`globals.css` @theme).
 * This file keeps tooling/IDE hints and documents content paths.
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
};

export default config;
