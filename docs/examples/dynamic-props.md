<script setup>
import DynamicPropsExample from './features/DynamicPropsExample.vue'
</script>

# Form with Dynamic Props

> Dynamic props allow you to change schema field properties based on the values of other fields in your form, creating a responsive and interactive form experience.

This example demonstrates how to use dynamic props in a schema-based form to create fields that adapt based on the form state:

1. **Conditional Field Visibility**: Email and phone fields appear/disappear based on the selected contact preference using the `if` special prop
2. **Dynamic Input Types**: The experience field changes its input component based on the position selected
3. **Dynamic Labels and Placeholders**: Labels and placeholders adapt dynamically to the context
4. **Dynamic Required Status**: Relocation preference is only required when remote work is not selected

<ClientOnly>
    <LiveDemo :component="DynamicPropsExample"></LiveDemo>
</ClientOnly>

::: code-group
<<< @/examples/features/DynamicPropsExample.vue
:::