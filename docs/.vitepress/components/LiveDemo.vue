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
import useRekauiPreset from '../../../src/presets/rekaui.ts'
import useNuxtUIPreset from '../../../src/presets/nuxtui.ts'
import { InputText, Select, ToggleSwitch, Button } from 'primevue'
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

// Import for Reka UI
import RekauiInput from '../../examples/rekaui/RekauiInput.vue'
import RekauiSelect from '../../examples/rekaui/RekauiSelect.vue'
import RekauiSwitch from '../../examples/rekaui/RekauiSwitch.vue'
import RekauiButton from '../../examples/rekaui/RekauiButton.vue'

// Import for Nuxt UI (requires the `@nuxt/ui/vite` plugin in the VitePress config)
import '../../examples/nuxtui/nuxtui.css'
import NuxtUI from '@nuxt/ui/vue-plugin'
import UInput from '@nuxt/ui/components/Input.vue'
import USelect from '@nuxt/ui/components/Select.vue'
import USwitch from '@nuxt/ui/components/Switch.vue'
import UButton from '@nuxt/ui/components/Button.vue'

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
      select: Select,
      toggle: ToggleSwitch,
      button: Button
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
  } else if (props.preset === 'rekaui') {
    // Apply Reka UI preset
    useRekauiPreset({
      input: RekauiInput,
      text: RekauiInput,
      select: RekauiSelect,
      switch: RekauiSwitch,
      toggle: RekauiSwitch,
      button: RekauiButton,
    })
  } else if (props.preset === 'nuxtui') {
    // Configure Nuxt UI
    app.use(NuxtUI)

    // Apply Nuxt UI preset
    useNuxtUIPreset({
      input: UInput,
      text: UInput,
      select: USelect,
      switch: USwitch,
      toggle: USwitch,
      button: UButton,
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