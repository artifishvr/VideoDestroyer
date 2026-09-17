import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

const isolationHeaders = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
};

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg"],
  },
  server: {
    headers: isolationHeaders,
    fs: {
      allow: ["../.."],
    },
  },
  preview: {
    headers: isolationHeaders,
  },
});
