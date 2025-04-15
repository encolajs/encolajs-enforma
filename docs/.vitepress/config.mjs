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
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/' }
          ]
        },
        {
          text: 'Rendering forms',
          collapsed: false,
          items: [
            { text: 'Headless components', link: '/guide/rendering/headless-components' },
            { text: 'Field components', link: '/guide/rendering/field-components' },
            { text: 'Form Schema', link: '/guide/rendering/form-schema' },
            { text: 'Mix and match', link: '/guide/rendering/mixed-and-match' }
          ]
        },
        {
          text: 'Using headless components',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/guide/headless-components/' },
            { text: 'Headless Form', link: '/guide/headless-components/form' },
            { text: 'Headless Field', link: '/guide/headless-components/field' },
            { text: 'Headless Repeatable', link: '/guide/headless-components/repeatable' },
          ]
        },
        {
          text: 'Using Enforma field components',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/guide/field-components/' },
            { text: 'Headless Form', link: '/guide/field-components/form' },
            { text: 'Headless Field', link: '/guide/field-components/field' },
            { text: 'Headless Repeatable', link: '/guide/field-components/repeatable' },
            { text: 'Headless Repeatable Table', link: '/guide/field-components/repeatable-table' },
          ]
        },
        {
          text: 'Using Enforma schema',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/guide/schema/' },
          ]
        },
        {
          text: 'Presets',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/guide/presets/' },
            { text: 'PrimeVue', link: '/guide/presets/primevue' },
            { text: 'Vuetify', link: '/guide/presets/vuetify' },
          ]
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
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