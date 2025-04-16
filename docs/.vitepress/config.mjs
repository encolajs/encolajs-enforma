import { defineConfig } from 'vitepress'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import { whyframe } from '@whyframe/core'
import { whyframeVue } from '@whyframe/vue'

export default defineConfig({
  title: 'EncolaJS Enforma',
  description: 'Documentation for EncolaJS Enforma',
  base: '/enforma/',
  themeConfig: {
    search: {
      provider: 'local',
    },
    editLink: {
      pattern:
        'https://github.com/encolajs/encolajs-enforma/tree/main/docs/:path',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/encolajs/encolajs-enforma' },
    ],
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started/' },
      { text: 'Guides', link: '/guides/' },
      { text: 'Presets', link: '/presets/' },
      { text: 'API', link: '/api/' },
      { text: 'Examples', link: '/examples/' },
    ],
    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/getting-started/' },
            { text: 'Installation', link: '/getting-started/installation' },
            { text: 'Quick Start', link: '/getting-started/quick-start' },
          ],
        },
        {
          text: 'Headless Components',
          items: [
            { text: 'Overview', link: '/headless/' },
            { text: 'HeadlessForm', link: '/headless/form' },
            { text: 'HeadlessField', link: '/headless/field' },
            { text: 'HeadlessRepeatable', link: '/headless/repeatable' },
            {
              text: 'Custom Wrapper Components',
              link: '/headless/wrapper-components',
            },
          ],
        },
        {
          text: 'Enforma Components',
          items: [
            { text: 'Overview', link: '/components/' },
            { text: 'EnformaForm', link: '/components/form' },
            { text: 'EnformaField', link: '/components/field' },
            { text: 'EnformaRepeatable', link: '/components/repeatable' },
            {
              text: 'EnformaRepeatableTable',
              link: '/components/repeatable-table',
            },
            { text: 'EnformaSection', link: '/components/section' },
            { text: 'EnformaSchema', link: '/components/schema' },
            { text: 'Buttons', link: '/components/buttons' },
          ],
        },
      ],
      '/presets/': [
        {
          text: 'UI Presets',
          items: [
            { text: 'Overview', link: '/presets/' },
            { text: 'PrimeVue', link: '/presets/primevue' },
            { text: 'Vuetify', link: '/presets/vuetify' },
            { text: 'Creating Custom Presets', link: '/presets/custom' },
          ],
        },
      ],
      '/guides/': [
        {
          text: 'Conceptual Guides',
          items: [
            { text: 'Overview', link: '/guides/' },
            { text: 'Form Schema', link: '/guides/schema' },
            { text: 'Form State', link: '/guides/state' },
            { text: 'Validation', link: '/guides/validation' },
            { text: 'Form Events', link: '/guides/events' },
            { text: 'Performance', link: '/guides/performance' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'Components API', link: '/api/components' },
            { text: 'Headless API', link: '/api/headless' },
            { text: 'Presets API', link: '/api/presets' },
            { text: 'Utilities API', link: '/api/utilities' },
            { text: 'Type Definitions', link: '/api/types' },
          ],
        },
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            {
              text: 'Forms',
              items: [
                {
                  text: 'Headless components',
                  link: '/examples/headless-components',
                },
                { text: 'Enforma with fields', link: '/examples/fields' },
                {
                  text: 'Enforma with fields and schema',
                  link: '/examples/fields-and-schema',
                },
                {
                  text: 'Enforma with schema only',
                  link: '/examples/schema-only',
                },
                { text: 'Mixed forms', link: '/examples/mixed-forms' },
              ],
            },
            {
              text: 'Features',
              items: [
                { text: 'Dynamic props', link: '/examples/dynamic-props' },
              ],
            },
          ],
        },
      ],
    },
    footer: {
      message: 'MIT Licensed',
      copyright: 'Copyright © 2025-present EncolaJS & Contributors',
    },
  },
  vite: {
    plugins: [
      // Initialize core plugin
      whyframe({
        defaultSrc: '/enforma/frames/default', // provide our own html
      }),

      // Initialize Vue integration plugin
      whyframeVue({
        include: /\.(?:vue|md)$/, // also scan in markdown files
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../../src'),
      },
      extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },
  },
  vue: {},
})