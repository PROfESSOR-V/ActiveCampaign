import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: "popup/build",
        emptyOutDir: true,
        rollupOptions: {
            input: resolve(__dirname, "popup/main.jsx"),
            output: {
                entryFileNames: "main.js",
                format: "es",
                assetFileNames: "assets/[name].[ext]"
            }
        }
    }
});
