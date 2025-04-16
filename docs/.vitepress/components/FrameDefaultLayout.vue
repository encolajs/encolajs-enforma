<script setup>
import { ref, onMounted } from 'vue'
// Special api to mount the app
import { createApp } from 'whyframe:app'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { createFormKit } from '@/'

const el = ref()

onMounted(() => {
  // Mount the app to the ref
  const app = createApp(el.value, {
    enhanceApp(app) {
      app.use(PrimeVue, {
        theme: {
          preset: Aura,
        },
      })
      app.use(createFormKit(primevue))
      const script = document.createElement('script')
      script.src = 'https://cdn.tailwindcss.com/' // or script.textContent = 'console.log("inline script")';
      script.type = 'text/javascript'
      script.defer = true // optional: defer execution
      document.head.appendChild(script) // or document.body.appendChild(script)
    },
  })
})
</script>

<template>
  <div ref="el"></div>
</template>
