import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "ChargeSchedule",
        short_name: "CS",
        description:
          "Get easily the best schedule to charge your electric vehicle based on your electricity tariff.",
        theme_color: "#022758",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
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
          {
            src: "maskable-icon-512x512.webp",
            sizes: "512x512",
            type: "image/webp",
            purpose: "maskable",
          },
        ],
      },
    }),
    cssInjectedByJsPlugin(),
  ],
  server: {
    allowedHosts: ["localhost"],
  },
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        passes: 5,
      },
    },
    cssCodeSplit: false,
  },
});
