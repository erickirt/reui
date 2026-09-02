import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        "ag-grid": "ag-grid.html",
        tanstack: "tanstack.html",
      },
    },
  },
})
