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
import { createFormKit } from '../../../src'
import usePrimeVuePreset from '../../../src/presets/primevue.ts'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

const props = defineProps({
  component: String
})

const el = ref()

onMounted(() => {
  const app = createApp({ render: () => h(props.component) })

  app.use(PrimeVue, {
    theme: {
      preset: Aura
    }
  })
  app.use(createFormKit({}))
  usePrimeVuePreset()
  app.mount(el.value)
})
</script>

<style>
.live-demo {
  all: revert !important;
}
</style>