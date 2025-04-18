import DefaultTheme from 'vitepress/theme'
import Tabs from '../components/Tabs.vue'
import Tab from '../components/Tab.vue'
import TabNav from '../components/TabNav.vue'
/** @type {import('vitepress').Theme} */
export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('Tabs', Tabs)
    app.component('Tab', Tab)
    app.component('TabNav', TabNav)
    const script = document.createElement('script')
    script.src = 'https://cdn.tailwindcss.com/' // or script.textContent = 'console.log("inline script")';
    script.type = 'text/javascript'
    script.defer = true // optional: defer execution
    document.head.appendChild(script) // or document.body.appendChild(script)
  },
}