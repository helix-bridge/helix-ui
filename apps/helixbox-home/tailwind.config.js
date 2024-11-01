import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0085FF",
      },
      borderRadius: {
        small: "0.25rem", // 4px
        medium: "0.5rem", // 8px
        large: "1rem", // 16px
        extralarge: "1.5rem", // 24px
      },
      spacing: {
        small: "0.3125rem", // 5px
        medium: "0.625rem", // 10px
        large: "0.9375rem", // 15px
      },
      maxWidth: {
        "8xl": "90rem",
      },
      // screens: {
      //   xl: "1200px",
      //   "2xl": "1200px",
      // },
      keyframes: {
        "scroll-to-bottom": {
          "0%": { top: "1lh" },
          "20%, 55%": { top: "0lh" },
          "60%, 100%": { top: "-1lh" },
        },
      },
      animation: {
        "scroll-to-bottom": "scroll-to-bottom 7000ms cubic-bezier(0.62, 0, 0.38, 1.0) infinite",
      },
    },
    fontFamily: {
      sans: ["IBMPlexSans", ...defaultTheme.fontFamily.sans],
    },
  },
  plugins: [],
};
