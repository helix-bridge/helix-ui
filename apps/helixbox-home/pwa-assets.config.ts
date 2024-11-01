import { defineConfig } from "@vite-pwa/assets-generator/config";

export default defineConfig({
  headLinkOptions: {
    preset: "2023",
  },
  preset: {
    transparent: { sizes: [64, 192, 512], favicons: [[48, "favicon.ico"]] },
    maskable: {
      sizes: [512],
      resizeOptions: { fit: "contain", background: "#00141D" },
    },
    apple: {
      sizes: [180],
      resizeOptions: { fit: "contain", background: "#00141D" },
    },
  },
  images: ["public/favicon.svg"],
});
