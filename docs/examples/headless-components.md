<script setup>
import HeadlessFormExample from './components/HeadlessFormExample.vue'
</script>

# Form using headless components

> [!Info] 
> The debugging messages next to some fields are deliberately placed there<br>
> The source code below the form contains comments about some of the decisions being made

<ClientOnly>
    <LiveDemo :component="HeadlessFormExample"></LiveDemo>
</ClientOnly>

## Source code

::: code-group
<<< @/examples/components/HeadlessFormExample.vue [Headless Form]
<<< @/examples/components/AppFormField.vue
<<< @/examples/components/ExperienceEndDateField.vue
:::
