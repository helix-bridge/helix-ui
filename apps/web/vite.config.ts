import { sentryVitePlugin } from "@sentry/vite-plugin";
/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
// import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  base: "",

  plugins: [
    react(),
    // VitePWA({
    //   registerType: "prompt",
    //   injectRegister: false,
    //   manifestFilename: "manifest.json",
    //   pwaAssets: {
    //     disabled: false,
    //     config: true,
    //   },
    //   manifest: {
    //     name: "Helix Bridge",
    //     short_name: "HelixBridge",
    //     description: "Secure, fast, and low-cost cross-chain crypto transfers",
    //     theme_color: "#00141D",
    //     background_color: "#00141D",
    //   },
    //   workbox: {
    //     globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
    //     cleanupOutdatedCaches: true,
    //     clientsClaim: true,
    //   },
    //   devOptions: {
    //     enabled: false,
    //     navigateFallback: "index.html",
    //     suppressWarnings: true,
    //     type: "module",
    //   },
    // }),
    sentryVitePlugin({
      org: "helix-ck",
      project: "javascript-react",
    }),
  ],

  build: {
    sourcemap: true,
  },
});
