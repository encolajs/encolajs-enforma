<script setup>
import LiveDemo from '../.vitepress/components/LiveDemo.vue'
import HeadlessFormExample from './components/HeadlessFormExample.vue'
import HeadlessFormExampleRaw from './components/HeadlessFormExample.vue?raw'
</script>

# Form using headless components

## Resume form

<ClientOnly>
    <LiveDemo :component="HeadlessFormExample"></LiveDemo>
</ClientOnly>

## Source code

::: code-group
<<< @/examples/components/HeadlessFormExample.vue [Headless Form]
<<< @/examples/components/AppFormField.vue
<<< @/examples/components/ExperienceEndDateField.vue
:::
