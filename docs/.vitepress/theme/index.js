import DefaultTheme from 'vitepress/theme'
import DynamicLayout from '../components/DynamicLayout.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import createFormKit from '@/createFormKit.js'
import primevue from '@/presets/primevue.js'

/** @type {import('vitepress').Theme} */
export default {
  DefaultTheme,
  Layout: DynamicLayout,
}