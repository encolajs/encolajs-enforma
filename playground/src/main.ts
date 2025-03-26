import { createApp } from 'vue'
import App from './App.vue';
import router from './router';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import createFormKit from '../../src/createFormKit'
import primevue from '../../src/presets/primevue'

const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
})
app.use(createFormKit(primevue))

app.mount('#app')