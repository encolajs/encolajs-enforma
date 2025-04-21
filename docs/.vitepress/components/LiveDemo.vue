<template>
  <div class="live-demo" ref="el">
    fasfasdafssdasdf
    <div :is="component" />
  </div>
</template>

<script setup>
import 'primeicons/primeicons.css'
import { ref, onMounted } from 'vue'
import { createApp, h } from 'vue'
import { createEnforma } from '../../../src'
import usePrimeVuePreset from '../../../src/presets/primevue.ts'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

const props = defineProps({
  component: String | Object
})

const el = ref()

onMounted(() => {
  const app = createApp({ render: () => h(props.component) })

  app.use(PrimeVue, {
    theme: {
      preset: Aura
    }
  })
  app.use(createEnforma({}))
  usePrimeVuePreset()
  app.mount(el.value)
})
</script>

<style>
.live-demo {
  all: revert !important;
}
</style>