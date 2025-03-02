import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Create separate chunks for optimization function implementations
          if (id.includes('/problems/implementations/')) {
            return 'functions/' + id.split('/implementations/')[1].split('.')[0];
          }
          // Create separate chunks for algorithm implementations
          if (id.includes('/algorithms/implementations/')) {
            return 'algorithms/' + id.split('/implementations/')[1].split('.')[0];
          }
          return undefined;
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
