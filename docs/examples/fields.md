<script setup>
import FormExample from './enforma/FieldsFormExample.vue'
</script>

# Form using field components (EnformaField)

> [!INFO] This example is using the PrimeVue preset

<ClientOnly>
    <LiveDemo :component="FormExample"></LiveDemo>
</ClientOnly>

## Source code

::: code-group
<<< @/examples/enforma/FieldsFormExample.vue [Enforma Form with Fields]
<<< @/examples/enforma/EndDateField.vue
<<< @/examples/enforma/SalaryField.vue
:::

# Enforma forms with fields

<!-- 
This page should provide:
1. Complete working example of a Enforma form
2. Fields are rendered using EncolaField, EncolaRepeatable components
3. Props are passed directly to the field
4. Include a few simple fields
5. Include a repeatable field
6. Show validation errors
7. Submit handling (alert a message on valid form)

Page should provide not just code but a working example. 
Component file will be in ./components/FieldsFormExample.vue
-->

