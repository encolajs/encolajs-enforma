import './main.css'

import { createApp } from 'vue'
import ui from '@nuxt/ui/vue-plugin'
import { EnformaPlugin } from '@encolajs/enforma'
import useNuxtUIPreset from '@encolajs/enforma/presets/nuxtui'
import UInput from '@nuxt/ui/components/Input.vue'
import UTextarea from '@nuxt/ui/components/Textarea.vue'
import USelect from '@nuxt/ui/components/Select.vue'
import USwitch from '@nuxt/ui/components/Switch.vue'
import UButton from '@nuxt/ui/components/Button.vue'
// Nuxt UI's UInputDate with Date objects as values
import DatePicker from './components/DatePicker.vue'
import App from './App.vue'

const app = createApp(App)

// configure Nuxt UI
app.use(ui)

// configure Enforma
app.use(EnformaPlugin)

useNuxtUIPreset({
  input: UInput,
  text: UInput,
  textarea: UTextarea,
  select: USelect,
  switch: USwitch,
  toggle: USwitch,
  datepicker: DatePicker,
  button: UButton,
})

app.mount('#app')
