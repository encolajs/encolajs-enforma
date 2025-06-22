<script setup>
import FormExample from './enforma/FieldsFormExample.vue'
import StackBlitzButton from '../.vitepress/components/StackBlitzButton.vue'
</script>

# Form Using Field Components

This example is using the PrimeVue preset

<StackBlitzButton />

<ClientOnly>
    <LiveDemo :component="FormExample"></LiveDemo>
</ClientOnly>

## Source code

::: code-group
<<< @/examples/enforma/FieldsFormExample.vue [Enforma Form with Fields]
<<< @/examples/enforma/EndDateField.vue
<<< @/examples/enforma/SalaryField.vue
:::

