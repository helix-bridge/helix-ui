import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/utils/**/*.{jsx,tsx}",
    "./src/ui/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: "#0085FF",
        component: "#303A44",
        inner: "#242D30",
        "app-bg": "#00141D",
        "app-green": "#52C41A",
        "app-orange": "#FAAD14",
        "app-red": "#FF4D4F",
      },
      borderRadius: {
        small: "0.25rem", // 4px
        middle: "0.5rem", // 8px
        large: "1rem", // 16px
        extralarge: "1.5rem", // 24px
      },
      spacing: {
        small: "0.3125rem", // 5px
        middle: "0.625rem", // 10px
        large: "0.9375rem", // 15px
      },
      maxWidth: {
        "8xl": "90rem",
      },
      screens: {
        xl: "1200px",
        "2xl": "1200px",
      },
      keyframes: {
        "right-enter": {
          "0%": { opacity: "0", transform: "translateX(100%)" },
          "1%": { opacity: "1" },
          "100%": { transform: "translateX(0)" },
        },
        "right-leave": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
        "notification-fade-out": {
          "100%": { height: "0" },
        },
        "count-loading-small": {
          "0%": {
            height: "16px",
          },
          "50%, 100%": {
            height: "8px",
          },
        },
        "count-loading-large": {
          "0%": {
            height: "32px",
          },
          "50%, 100%": {
            height: "16px",
          },
        },
        "spinner-rotate-left": {
          "0%": { transform: "rotate(0deg)" },
          "50%": { transform: "rotate(180deg)" },
          "100%": { transform: "rotate(180deg)" },
        },
        "spinner-rotate-right": {
          "0%": { transform: "rotate(0deg)" },
          "50%": { transform: "rotate(180deg)" },
          "100%": { transform: "rotate(180deg)" },
        },
      },
      animation: {
        "notification-enter": "right-enter 400ms ease-out",
        "notification-leave": "right-leave 400ms ease-out forwards",
        "notification-fadeout": "notification-fade-out 200ms ease-out forwards",
        "count-loading-small": "count-loading-small 1200ms cubic-bezier(0, 0.5, 0.5, 1) infinite",
        "count-loading-large": "count-loading-large 1200ms cubic-bezier(0, 0.5, 0.5, 1) infinite",
        "progress-anim-left": "spinner-rotate-left 9000ms linear 4500ms 1 paused forwards", // Duration: 9s, delay: 4.5s
        "progress-anim-right": "spinner-rotate-right 9000ms linear 0ms 1 paused forwards",
      },
    },
  },
  plugins: [],
};
export default config;
