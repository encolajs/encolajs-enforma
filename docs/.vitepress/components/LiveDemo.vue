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
import { createFormKit } from '@/index.js'
import usePrimeVuePreset from '@/presets/primevue.js'
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
  const script = document.createElement('script')
  script.src = 'https://cdn.tailwindcss.com/' // or script.textContent = 'console.log("inline script")';
  script.type = 'text/javascript'
  script.defer = true // optional: defer execution
  document.head.appendChild(script) // or document.body.appendChild(script)
})
</script>

<style>
.live-demo {
  all: revert !important;
}
</style>