<template>
  <div class="live-demo" ref="el">
    <div :is="component" />
  </div>
</template>

<script setup>
import 'primeicons/primeicons.css'
import { ref, onMounted } from 'vue'
import { createApp, h } from 'vue'
import { createEnforma } from '../../../src'
import usePrimeVuePreset from '../../../src/presets/primevue.ts'
import { InputText } from 'primevue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

const props = defineProps({
  component: String | Object
})

const el = ref()

onMounted(() => {
  const app = createApp({
    render: () => h(props.component)
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

  // configure Enforma
  app.use(createEnforma({}))
  usePrimeVuePreset({
    input: InputText,
    text: InputText,
  })

  app.mount(el.value)
})
</script>

<style>
</style>