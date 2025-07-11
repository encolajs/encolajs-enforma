import { defineConfig } from 'vitepress'
import markdownItContainer from 'markdown-it-container'
import path from 'path'

export default defineConfig({
  title: 'EncolaJS Enforma',
  description: 'Enforma - Complete form solution for VueJS apps',
  base: '/enforma/',
  themeConfig: {
    search: {
      provider: 'local',
    },
    editLink: {
      pattern:
        'https://github.com/encolajs/encolajs-enforma/tree/main/docs/:path',
    },
    logo: '/logo.png',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/encolajs/encolajs-enforma' },
    ],
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Documentation', link: '/getting-started' },
      { text: 'Recipes', link: '/recipes/' },
      { text: 'Examples', link: '/examples/' },
      { text: 'More...',
        items: [
          {text: 'EncolaJS Validator', link: 'https://encolajs.com/validator/'},
          {text: 'EncolaJS Hydrator', link: 'https://encolajs.com/hydrator/'},
        ]
      },
    ],
    sidebar: {
      '/': [
        { text: 'Overview', link: '/getting-started' },
        { text: 'Installation', link: '/installation' },
        { text: 'Quick Start', link: '/quick-start' },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Architecture Overview', link: '/core-concepts/architecture-overview' },
            { text: 'Configuration', link: '/core-concepts/configuration' },
            { text: 'Validation System', link: '/core-concepts/validation' },
            { text: 'Rendering Modes', link: '/core-concepts/rendering-modes' },
            { text: 'Accessibility', link: '/core-concepts/accessibility' },
          ],
        },
        {
          text: 'Enforma Forms',
          items: [
            {
              text: 'Forms with Fields',
              link: '/field-forms/',
              items: [
                { text: 'Enforma', link: '/field-forms/enforma-form' },
                { text: 'EnformaField', link: '/field-forms/enforma-field' },
                { text: 'EnformaRepeatable', link: '/field-forms/enforma-repeatable' },
                { text: 'EnformaRepeatableTable', link: '/field-forms/enforma-repeatable-table' },
              ]
            },
            {
              text: 'Forms with Schema',
              link: '/schema-forms/',
              items: [
                { text: 'Schema Reference', link: '/schema-forms/schema-reference' },
                { text: 'Field Slots', link: '/schema-forms/field-slots' },
                { text: 'Dynamic Props', link: '/schema-forms/dynamic-props' },
                { text: 'Transformers', link: '/schema-forms/transformers' },
                { text: 'Mixed Forms', link: '/schema-forms/mixed-forms' },
              ]
            },
            {
              text: 'Headless Forms',
              link: '/headless-forms/',
              collapsed: true,
              items: [
                { text: 'HeadlessForm', link: '/headless-forms/form' },
                { text: 'HeadlessField', link: '/headless-forms/field' },
                { text: 'HeadlessRepeatable', link: '/headless-forms/repeatable' },
              ],
            },
          ],
        },

        {
          text: 'UI Library Integration',
          link: '/ui-library-integration/',
          items: [
            { text: 'PrimeVue Preset', link: '/ui-library-integration/primevue-preset' },
            { text: 'Vuetify Preset', link: '/ui-library-integration/vuetify-preset' },
            { text: 'Quasar Preset', link: '/ui-library-integration/quasar-preset' },
            { text: 'Creating Your Own UI Preset', link: '/ui-library-integration/creating-your-own-ui-preset' },
          ],
        },
        {
          text: 'Extensibility',
          link: '/extensibility/',
          items: [
            { text: 'Using Custom Components', link: '/extensibility/custom-components' },
            { text: 'Using Transformers', link: '/extensibility/using-transformers' },
            { text: 'Using Dynamic Props', link: '/extensibility/dynamic-props' },
          ],
        },
        { text: 'F.A.Q.', link: '/faq' },
        { text: 'Contribution Guide', link: '/contribution-guide' },
      ],
      '/recipes/': [
        { text: 'Recipes', link: '/recipes/' },
        {
          text: 'Components',
          items: [
            { text: 'Multi-input Fields', link: '/recipes/multi-input-field' },
            { text: 'Address Picker', link: '/recipes/address-picker' },
          ],
        },
        {
          text: 'Validation',
          items: [
            { text: 'Async Validation Rule', link: '/recipes/async-validation' },
          ],
        },
        {
          text: 'Other',
          items: [
            { text: 'Form in Modal', link: '/recipes/form-in-modal' },
          ],
        },
      ],
      '/examples/': [
        { text: 'Examples', link: '/examples/' },
        {
          text: 'Render Mode',
          items: [
            { text: 'Form with Fields', link: '/examples/fields' },
            {
              text: 'Form with Schema Only',
              link: '/examples/schema-only',
            },
            { text: 'Mixed Form', link: '/examples/mixed-form' },
            {
              text: 'Form with Headless Components',
              link: '/examples/headless-components',
            },
          ],
        },
        {
          text: 'Features',
          items: [
            { text: 'Dynamic Props', link: '/examples/dynamic-props' },
          ],
        },
        {
          text: 'Presets',
          items: [
            { text: 'Vuetify', link: '/examples/vuetify-preset' },
            { text: 'Quasar', link: '/examples/quasar-preset' },
          ],
        },
        {
          text: 'Other',
          items: [
            { text: 'Integration with EncolaJS Hydrator', link: '/examples/hydrator' },
          ],
        },
      ],
    },
    footer: {
      message: 'Enforma is free for local and development use. A <a href="https://encolajs.com/">commercial license</a> is required for production or business use',
      copyright: 'Copyright © 2025-present EncolaJS & Contributors',
    },
  },
  markdown: {
    config(md) {
      // ::: Tabs
      md.use(markdownItContainer, 'Tabs', {
        render(tokens, idx) {
          const token = tokens[idx]
          return token.nesting === 1
            ? `<Tabs>\n`
            : `</Tabs>\n`
        },
      })

      // ::: Tab "Label"
      md.use(markdownItContainer, 'Tab', {
        validate(params) {
          return params.trim().match(/^Tab\s+(.*)$/)
        },
        render(tokens, idx) {
          const m = tokens[idx].info.trim().match(/^Tab\s+(.*)$/)
          if (tokens[idx].nesting === 1) {
            const label = m[1].replace(/"/g, '')
            const name = label.toLowerCase().replace(/\s+/g, '-')
            return `<Tab name="${name}" label="${label}">\n`
          } else {
            return '</Tab>\n'
          }
        },
      })
    },
  },
  head: [
    [
      'script',
      {
        src: 'https://cdn.tailwindcss.com/',
        async: true,
        defer: true
      }
    ],
    ['link', { rel: 'icon', href: '/enforma/favicon.ico' }],
    [
      'script',
      {
        async: true,
        src: 'https://www.googletagmanager.com/gtag/js?id=G-4CP1E3Z3Q0',
      },
    ],
    [
      'script',
      {},
      "window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);};gtag('js', new Date());gtag('config', 'G-4CP1E3Z3Q0');",
    ],
  ],
  vite: {
    ssr: {
      noExternal: [/\.css$/, /^vuetify/]
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../../src'),
      },
      extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },
  },
  vue: {
    template: {
      compilerOptions: {
        // Suppress the "Extraneous non-props attributes" warning
        warnExtraProps: false
      }
    }
  },
})