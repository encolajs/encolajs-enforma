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
        rekaui: path.resolve(__dirname, 'src/presets/rekaui.ts'),
        nuxtui: path.resolve(__dirname, 'src/presets/nuxtui.ts'),
        // preset field components, for use in templates (e.g. presets/nuxtui/Field.js)
        'vuetify/Field': path.resolve(__dirname, 'src/presets/vuetify/Field.vue'),
        'quasar/Field': path.resolve(__dirname, 'src/presets/quasar/Field.vue'),
        'rekaui/Field': path.resolve(__dirname, 'src/presets/rekaui/Field.vue'),
        'nuxtui/Field': path.resolve(__dirname, 'src/presets/nuxtui/Field.vue'),
        'validators/encola': path.resolve(__dirname, 'src/validators/encolaValidator.ts'),
        'validators/zod': path.resolve(__dirname, 'src/validators/zod.ts'),
        'validators/yup': path.resolve(__dirname, 'src/validators/yup.ts'),
        'validators/valibot': path.resolve(__dirname, 'src/validators/valibot.ts'),
      },
      name: 'Enforma',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        // the package is "type": "module", so CommonJS files need the .cjs extension
        const extension = format === 'cjs' ? 'cjs' : 'js'
        if (entryName === 'index') {
          return `index.${extension}`
        }
        if (entryName.startsWith('validators/')) {
          return `${entryName}.${extension}`
        }
        return `presets/${entryName}.${extension}`
      },
    },
    rollupOptions: {
      external: [
        'vue',
        '@encolajs/validator',
        'zod',
        'yup',
        'valibot',
        'mitt',
        '@andreasnicolaou/typescript-expression-language',
      ],
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