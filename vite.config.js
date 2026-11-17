import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import path, { sep } from 'path'
import { completeDeclarations } from './scripts/declarations.js'
import pkg from './package.json'

// Always the app's own
const external = [
  'vue',
  '@encolajs/validator',
  'zod',
  'yup',
  'valibot',
  '@andreasnicolaou/typescript-expression-language',
]

// The UI libraries the presets draw with: the app's own, with its config and theme, never a
// copy inside a preset
const uiLibraries = [
  /^primevue(\/|$)/,
  /^@primevue\//,
  /^@primeuix\//,
  /^vuetify(\/|$)/,
  /^quasar(\/|$)/,
  /^reka-ui(\/|$)/,
  /^@nuxt\/ui(\/|$)/,
]

/**
 * Whether an import stays an import. The schema builder, in the main entry, brings its own
 * PrimeVue, as it always has: an app without PrimeVue imports the main entry
 */
function isExternal(id, importer) {
  if (external.includes(id)) return true
  if (!uiLibraries.some((library) => library.test(id))) return false
  const path = (importer || '').split(sep).join('/')
  return !path.includes('/src/schema-builder/') && !path.includes('/node_modules/')
}

export default defineConfig({
  plugins: [
    vue(),
    // the declarations' relative imports completed for "moduleResolution": "node16" and "nodenext",
    // and their CommonJS twins (.d.cts) for the `require` conditions of package.json's exports
    dts({
      afterBuild: completeDeclarations({ root: __dirname, exports: pkg.exports }),
    }),
  ],
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
      external: isExternal,
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