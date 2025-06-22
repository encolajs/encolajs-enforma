import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [vue(), dts()],
  resolve: {
    alias: {
      '@': '/src'
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  }
})