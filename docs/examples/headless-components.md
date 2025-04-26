<script setup>
import HeadlessFormExample from './headless/HeadlessFormExample.vue'
</script>

# Form Using Headless Components

> [!WARNING] The debugging messages next to some fields are deliberately placed there<br> The source code below the form contains comments about some of the decisions being made

<ClientOnly>
    <LiveDemo :component="HeadlessFormExample"></LiveDemo>
</ClientOnly>

## Source code

::: code-group
<<< @/examples/headless/HeadlessFormExample.vue [Headless Form]
<<< @/examples/headless/AppFormField.vue
<<< @/examples/headless/ExperienceEndDateField.vue
:::
