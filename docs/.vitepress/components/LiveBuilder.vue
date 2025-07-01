<template>
  <div ref="el" class="live-builder" />
</template>

<script setup>
import 'primeicons/primeicons.css'
import { ref, onMounted, onUnmounted } from 'vue'
import { createApp, h } from 'vue'
import { EnformaPlugin } from '@'
import usePrimeVuePreset from '../../../src/presets/primevue.ts'
import { 
  InputText, 
  Select, 
  ToggleSwitch, 
  Button, 
  ConfirmPopup,
  Dropdown,
  Checkbox,
  Card,
  InputNumber,
  Textarea,
  Toolbar,
  Accordion,
  AccordionTab,
  Message
} from 'primevue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ConfirmationService from 'primevue/confirmationservice'
import SchemaBuilder from './SchemaBuilder.vue'

const el = ref()

onMounted(() => {
  const app = createApp({
    render: () => h(SchemaBuilder)
  })

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
  app.use(ConfirmationService)

  // configure Enforma
  app.use(EnformaPlugin)

  usePrimeVuePreset({
    input: InputText,
    text: InputText,
    select: Select,
    toggle: ToggleSwitch,
    button: Button
  })

  // Register PrimeVue components globally for SchemaBuilder
  app.component('Button', Button)
  app.component('InputText', InputText)
  app.component('Dropdown', Dropdown)
  app.component('Checkbox', Checkbox)
  app.component('Card', Card)
  app.component('InputNumber', InputNumber)
  app.component('Textarea', Textarea)
  app.component('Toolbar', Toolbar)
  app.component('Accordion', Accordion)
  app.component('AccordionTab', AccordionTab)
  app.component('Message', Message)

  app.mount(el.value)
  onUnmounted(app.unmount)
})
</script>

<style scoped>
.builder-container {
  display: grid;
  grid-template-columns: 1fr 3fr;
  grid-gap: 2rem;
}
@media (max-width: 700px) {
  .builder-container {
    display: block;
  }
}
</style>