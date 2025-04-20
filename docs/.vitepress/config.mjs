import { defineConfig } from 'vitepress'
import markdownItContainer from 'markdown-it-container'
import path from 'path'
import vue from '@vitejs/plugin-vue'

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
      { text: 'Getting Started', link: '/getting-started' },
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
          collapsed: false,
          items: [
            { text: 'Architecture Overview', link: '/core-concepts/architecture-overview' },
            { text: 'Form Configuration', link: '/core-concepts/form-configuration' },
            { text: 'Validation System', link: '/core-concepts/validation-system' },
            { text: 'Rendering Modes', link: '/core-concepts/rendering-modes' },
            { text: 'Dynamic Props', link: '/core-concepts/dynamic-props' },
          ],
        },
        {
          text: 'Form Rendering Modes',
          collapsed: false,
          items: [
            { text: 'Forms with Fields', link: '/form-rendering-modes/forms-with-fields' },
            { text: 'Forms with a Schema', link: '/form-rendering-modes/forms-with-schema' },
            { text: 'Headless Forms', link: '/form-rendering-modes/headless-forms' },
            { text: 'Mixed Forms', link: '/form-rendering-modes/mixed-forms' },
          ],
        },
        {
          text: 'Built-in Base Components',
          collapsed: false,
          items: [
            { text: 'Enforma Form', link: '/built-in-components/enforma-form' },
            { text: 'EnformaField', link: '/built-in-components/enforma-field' },
            { text: 'EnformaRepeatable', link: '/built-in-components/enforma-repeatable' },
            { text: 'EnformaRepeatableTable', link: '/built-in-components/enforma-repeatable-table' },
            { text: 'EnformaSection', link: '/built-in-components/enforma-section' },
            { text: 'EnformaSchema', link: '/built-in-components/enforma-schema' },
          ],
        },
        {
          text: 'Headless Components',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/headless/' },
            { text: 'HeadlessForm', link: '/headless/form' },
            { text: 'HeadlessField', link: '/headless/field' },
            { text: 'HeadlessRepeatable', link: '/headless/repeatable' },
          ],
        },
        {
          text: 'Validation',
          collapsed: false,
          items: [
            { text: 'Built-in Validators', link: '/validation/built-in-validators' },
            { text: 'Validation Customization', link: '/validation/validation-customization' },
          ],
        },
        {
          text: 'UI Library Integration',
          collapsed: false,
          items: [
            { text: 'Working with Any UI Library', link: '/ui-library-integration/working-with-any-ui-library' },
            { text: 'PrimeVue Preset', link: '/ui-library-integration/primevue-preset' },
            { text: 'Vuetify Preset', link: '/ui-library-integration/vuetify-preset' },
            { text: 'Creating Your Own UI Preset', link: '/ui-library-integration/creating-your-own-ui-preset' },
          ],
        },
        {
          text: 'Extensibility',
          collapsed: false,
          items: [
            { text: 'Global vs Form-level Configuration', link: '/extensibility/global-vs-form-level-configuration' },
            { text: 'Integrating Custom Components', link: '/extensibility/integrating-custom-components' },
            { text: 'Using Transformers', link: '/extensibility/using-transformers' },
            { text: 'Dynamic Field Props', link: '/extensibility/dynamic-field-props' },
          ],
        },
        {
          text: 'Recipes',
          collapsed: false,
          items: [
            { text: 'Async Validation', link: '/recipes/async-validation' },
            { text: 'Multi-input Fields', link: '/recipes/multi-input-fields' },
            { text: 'Conditional Forms', link: '/recipes/conditional-forms' },
            { text: 'Async Schema Loading', link: '/recipes/async-schema-loading' },
            { text: 'Custom Base Components', link: '/recipes/custom-base-components' },
          ],
        },
        {
          text: 'Troubleshooting',
          collapsed: false,
          items: [
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
  vite: {
    build: {
      rollupOptions: {
        external: [
          // Match the file(s) you want to ignore
          /\/src\//,
        ]
      }
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