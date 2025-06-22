<script setup>
import FormExample from './enforma/MixedFormExample.vue'
import StackBlitzButton from '../.vitepress/components/StackBlitzButton.vue'
</script>

# Mixed Form

This example shows how you can mix schema with custom field slots

<StackBlitzButton
    title="Enforma Mixed Form Example"
    component="MixedFormExample"
    open-file="src/components/MixedFormExample.vue"
    />

<ClientOnly>
    <LiveDemo :component="FormExample"></LiveDemo>
</ClientOnly>

## Source code

::: code-group
<<< @/examples/enforma/MixedFormExample.vue
:::
