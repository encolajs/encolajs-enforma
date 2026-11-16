import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    // Vuetify's components import their CSS, which only Vite can load
    server: {
      deps: {
        inline: ['vuetify'],
      },
    },
    coverage: {
      include: [
        'src/**'
      ],
      exclude: [
        'src/presets/**'
      ]
    }
  },
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      // Quasar gives Node its server build, which draws nothing: the tests use the browser's
      {
        find: /^quasar$/,
        replacement: path.resolve(
          __dirname,
          './node_modules/quasar/dist/quasar.client.js'
        ),
      },
    ],
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  }
})