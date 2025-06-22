import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import path from 'path'

export default defineConfig({
  plugins: [vue(), dts()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        default: path.resolve(__dirname, 'src/presets/default.ts'),
        primevue: path.resolve(__dirname, 'src/presets/primevue.ts'),
        vuetify: path.resolve(__dirname, 'src/presets/vuetify.ts'),
        quasar: path.resolve(__dirname, 'src/presets/quasar.ts'),
      },
      name: 'Enforma',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        if (entryName === 'index') {
          return `index${format === 'cjs' ? '.cjs' : ''}.js`
        }
        return `presets/${entryName}${format === 'cjs' ? '.cjs' : ''}.js`
      },
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  }
})