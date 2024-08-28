/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  base: "",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifestFilename: "manifest.json",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "Bridge Stablecoins and Native Tokens on HelixBridge",
        short_name: "HelixBridge Interface",
        description: "Secure, fast, and low-cost cross-chain crypto transfers",
        theme_color: "#00141D",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
