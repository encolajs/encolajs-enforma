<script setup>
import FormExample from './enforma/SchemaFormExample.vue'
import StackBlitzButton from '../.vitepress/components/StackBlitzButton.vue'
</script>

# Form Using Schema

This example is using the PrimeVue preset

<StackBlitzButton
    title="Enforma Schema Form Example"
    component="SchemaFormExample"
    open-file="src/components/SchemaFormExample.vue"
/>

<ClientOnly>
    <LiveDemo :component="FormExample"></LiveDemo>
</ClientOnly>

## Source code

::: code-group
<<< @/examples/enforma/SchemaFormExample.vue
:::

