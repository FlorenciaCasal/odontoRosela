import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      fontFamily: {
        // si ya usás Inter por @next/font, dejalo igual
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#1D4ED8", // azul primario
          50: "#EEF2FF",
          100: "#E0E7FF",
          600: "#1D4ED8",
          700: "#1E40AF",
        },
        accent: {
          DEFAULT: "#10B981", // verde “éxito”
          600: "#059669",
        },
        danger: {
          DEFAULT: "#DC2626",
          700: "#B91C1C",
        },
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.10)",
        soft: "0 2px 8px rgba(16,24,40,.08)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/line-clamp"),
  ],
};
export default config;
