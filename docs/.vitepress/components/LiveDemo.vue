<template>
  <div class="live-demo" ref="el">
    <div :is="component" />
  </div>
</template>

<script setup>
import 'primeicons/primeicons.css'
import { ref, onMounted, onUnmounted } from 'vue'
import { createApp, h } from 'vue'
import { EnformaPlugin } from '../../../src'
import usePrimeVuePreset from '../../../src/presets/primevue.ts'
import useVuetifyPreset from '../../../src/presets/vuetify.ts'
import useQuasarPreset from '../../../src/presets/quasar.ts'
import { InputText } from 'primevue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

// Import for Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { VTextField } from 'vuetify/components'

// Import for Quasar
import { Quasar } from 'quasar'
import 'quasar/dist/quasar.css'
import '@quasar/extras/material-icons/material-icons.css'
import { QInput } from 'quasar'

const props = defineProps({
  component: String | Object,
  preset: {
    type: String,
    default: 'primevue'
  }
})

const el = ref()

onMounted(() => {
  const app = createApp({
    render: () => h(props.component)
  })

  // configure Enforma
  app.use(EnformaPlugin)

  if (props.preset === 'primevue') {
    // configure PrimeVue
    app.use(PrimeVue, {
      theme: {
        preset: Aura,
        options: {
          prefix: 'p',
          darkModeSelector: 'system',
          cssLayer: false
        }
      }
    })
    usePrimeVuePreset({
      input: InputText,
      text: InputText,
    })
  } else if (props.preset === 'vuetify') {
    // Configure Vuetify
    const vuetify = createVuetify({
      theme: {
        defaultTheme: 'light'
      }
    })
    app.use(vuetify)
    
    // Apply Vuetify preset
    useVuetifyPreset({
      input: VTextField,
      text: VTextField,
    })
  } else if (props.preset === 'quasar') {
    // Configure Quasar
    app.use(Quasar, {
      plugins: {}, // import Quasar plugins here if needed
      config: {
        brand: {
          primary: '#1976D2',
          secondary: '#26A69A',
          accent: '#9C27B0',
          positive: '#21BA45',
          negative: '#C10015',
          info: '#31CCEC',
          warning: '#F2C037'
        }
      }
    })
    
    // Apply Quasar preset
    useQuasarPreset({
      input: QInput,
      text: QInput,
    })
  }

  app.mount(el.value)

  onUnmounted(app.unmount)
})
</script>

<style>
.live-demo {
  all: revert !important;
}
</style>