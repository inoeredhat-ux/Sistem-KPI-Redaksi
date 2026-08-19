import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        // xlsx besar dan jarang berubah; pisahkan agar cache peramban lebih awet
        manualChunks: {
          xlsx: ["xlsx"],
          react: ["react", "react-dom"],
        },
      },
    },
  },
});
