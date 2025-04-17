<script setup>
import LiveDemo from '../.vitepress/components/LiveDemo.vue'
import HeadlessFormExample from './components/HeadlessFormExample.vue'
import HeadlessFormExampleRaw from './components/HeadlessFormExample.vue?raw'
</script>

# Use headless form components

<ClientOnly>
    <hr>
    <LiveDemo :component="HeadlessFormExample"></LiveDemo>
</ClientOnly>

::: code-group
<<< @/examples/components/HeadlessFormExample.vue [Headless Form]
<<< @/examples/components/AppFormField.vue
<<< @/examples/components/ExperienceEndDateField.vue
:::
