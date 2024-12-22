import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import path from 'path'

export default defineConfig({
  plugins: [react(), svgr()],
  base: '/',
  server: {
    open: true, // Automatically open the app in the browser
  },
  build: {
    outDir: 'build', // Matches CRA's default build output directory
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Alias `@` to the `src` directory
    },
  },
})
