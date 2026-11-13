import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    ui({
      // this example doesn't use vue-router
      router: false,
      // Nuxt UI form controls are inline by default; make them fill the field
      ui: {
        input: { slots: { root: 'w-full' } },
        inputDate: { slots: { base: 'w-full' } },
        textarea: { slots: { root: 'w-full' } },
        select: { slots: { base: 'w-full' } },
      },
    }),
    dts(),
  ],
  resolve: {
    alias: {
      '@': '/src'
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  }
})
