import DefaultTheme from 'vitepress/theme'
import Tabs from '../components/Tabs.vue'
import Tab from '../components/Tab.vue'
import TabNav from '../components/TabNav.vue'
import LiveDemo from '../components/LiveDemo.vue'
import './custom.css'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { createEnforma } from '@'

/** @type {import('vitepress').Theme} */
export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('Tabs', Tabs)
    app.component('Tab', Tab)
    app.component('TabNav', TabNav)
    app.component('LiveDemo', LiveDemo)

    app.use(PrimeVue, {
      theme: {
        preset: Aura
      }
    })
    app.use(createEnforma({}))

  },
}