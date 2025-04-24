import { defineConfig } from 'vitepress'
import markdownItContainer from 'markdown-it-container'
import path from 'path'

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
      { text: 'Documentation', link: '/getting-started' },
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
          ],
        },
        {
          text: 'Enforma Forms',
          collapsed: false,
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
          collapsed: false,
          items: [
            { text: 'PrimeVue Preset', link: '/ui-library-integration/primevue-preset' },
            { text: 'Vuetify Preset', link: '/ui-library-integration/vuetify-preset' },
            { text: 'Creating Your Own UI Preset', link: '/ui-library-integration/creating-your-own-ui-preset' },
          ],
        },
        {
          text: 'Extensibility',
          collapsed: true,
          items: [
            { text: 'Integrating Custom Components', link: '/extensibility/integrating-custom-components' },
            { text: 'Using Transformers', link: '/extensibility/using-transformers' },
            { text: 'Dynamic Field Props', link: '/extensibility/dynamic-field-props' },
          ],
        },
        {
          text: 'Recipes',
          collapsed: true,
          items: [
            { text: 'Async Validation', link: '/recipes/async-validation' },
            { text: 'Multi-input Fields', link: '/recipes/multi-input-fields' },
            { text: 'Conditional Forms', link: '/recipes/conditional-forms' },
            { text: 'Async Schema Loading', link: '/recipes/async-schema-loading' },
            { text: 'Custom Base Components', link: '/recipes/custom-field-forms' },
          ],
        },
        {
          text: 'Troubleshooting',
          collapsed: true,
          items: [
            { text: 'Debugging', link: '/troubleshooting/debugging' },
            { text: 'FAQ', link: '/troubleshooting/faq' },
          ],
        },
        {
          text: 'Community',
          collapsed: false,
          items: [
            { text: 'Contribution Guide', link: '/community/contribution-guide' },
            { text: 'Discord Community', link: '/community/discord-community' },
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
  ],
  vite: {
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