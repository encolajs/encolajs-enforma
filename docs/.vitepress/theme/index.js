import DefaultTheme from 'vitepress/theme'
import Tabs from '../components/Tabs.vue'
import Tab from '../components/Tab.vue'
import TabNav from '../components/TabNav.vue'
import LiveDemo from '../components/LiveDemo.vue'
import LiveBuilder from '../components/LiveBuilder.vue'
import AnnouncementBar from '../components/AnnouncementBar.vue'
import SchemaBuilder from '../components/SchemaBuilder.vue'
import Layout from './Layout.vue'
import FullPageLayout from './FullPageLayout.vue'
import './custom.css'

/** @type {import('vitepress').Theme} */
export default {
  ...DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('Tabs', Tabs)
    app.component('full-page', FullPageLayout)
    app.component('Tab', Tab)
    app.component('TabNav', TabNav)
    app.component('LiveDemo', LiveDemo)
    app.component('LiveBuilder', LiveBuilder)
    app.component('AnnouncementBar', AnnouncementBar)
    app.component('SchemaBuilder', SchemaBuilder)
  },
}