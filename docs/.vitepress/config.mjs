import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "EncolaJS Enforma",
  description: "Documentation for EncolaJS Enforma",
  base: "/enforma/",
  themeConfig: {
    search: {
      provider: 'local'
    },
    editLink: {
      pattern: 'https://github.com/encolajs/encolajs-enforma/tree/main/docs/:path'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/encolajs/encolajs-enforma' },
    ],
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started/' },
      { text: 'Guides', link: '/guides/' },
      { text: 'Components', link: '/components/' },
      { text: 'Headless', link: '/headless/' },
      { text: 'API', link: '/api/' },
      { text: 'Examples', link: '/examples/' }
    ],
    sidebar: {
      '/getting-started/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/getting-started/' },
            { text: 'Installation', link: '/getting-started/installation' },
            { text: 'Quick Start', link: '/getting-started/quick-start' }
          ]
        }
      ],
      '/components/': [
        {
          text: 'Components',
          items: [
            { text: 'Overview', link: '/components/' },
            { text: 'Form', link: '/components/form' },
            { text: 'Field', link: '/components/field' },
            { text: 'Repeatable', link: '/components/repeatable' },
            { text: 'Repeatable Table', link: '/components/repeatable-table' },
            { text: 'Section', link: '/components/section' },
            { text: 'Schema', link: '/components/schema' },
            { text: 'Buttons', link: '/components/buttons' }
          ]
        }
      ],
      '/headless/': [
        {
          text: 'Headless Components',
          items: [
            { text: 'Overview', link: '/headless/' },
            { text: 'Form', link: '/headless/form' },
            { text: 'Field', link: '/headless/field' },
            { text: 'Repeatable', link: '/headless/repeatable' },
            { text: 'Building Custom Components', link: '/headless/custom' }
          ]
        }
      ],
      '/presets/': [
        {
          text: 'UI Presets',
          items: [
            { text: 'Overview', link: '/presets/' },
            { text: 'PrimeVue', link: '/presets/primevue' },
            { text: 'Vuetify', link: '/presets/vuetify' },
            { text: 'Creating Custom Presets', link: '/presets/custom' }
          ]
        }
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
            { text: 'Performance', link: '/guides/performance' }
          ]
        }
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
            { text: 'Type Definitions', link: '/api/types' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Basic Forms', link: '/examples/basic' },
            { text: 'Complex Forms', link: '/examples/complex' },
            { text: 'Dynamic Forms', link: '/examples/dynamic' },
            { text: 'Form Validation', link: '/examples/validation' },
            { text: 'Custom Components', link: '/examples/custom' }
          ]
        }
      ]
    },
    footer: {
      message: 'MIT Licensed',
      copyright:
        'Copyright © 2025-present EncolaJS & Contributors',
    },
  }
})