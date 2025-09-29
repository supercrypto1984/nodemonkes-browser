import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

// Update the base URL to match your repository name
export default defineConfig({
  plugins: [react()],
  // ⭐️ 关键修复：将 base 设为 '/' (或 '') 以匹配自定义域名根路径。
  // 这确保了打包后的资源链接是 /assets/... 而不是 /nodemonkes-browser/assets/...
  base: "/", 
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
})
