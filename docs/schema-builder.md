---
layout: full-page
sidebar: false
---

<script setup>
import DndSchemaBuilder from './.vitepress/components/dnd-builder/DndSchemaBuilder.vue'
</script>

# Schema Builder

Drag fields and sections from the palette onto the canvas, then click an item to edit it. The form preview and the JSON schema update as you go. When you're happy with the form, copy the JSON and use it as the `schema` prop of `<Enforma>`.

<ClientOnly>
    <LiveDemo :component="DndSchemaBuilder"></LiveDemo>
</ClientOnly>

## Taking the schema further

The builder only covers basic inputs. The JSON it produces is a starting point that you are expected to adjust:

- The schema targets the Nuxt UI preset used in these docs. Some input props depend on the UI library: the `select` options are passed as `items` for Nuxt UI, but as `options` for PrimeVue.
- `inputComponent` can be replaced with any component registered in your preset, or with your own component. See [Using Custom Components](/extensibility/custom-components.md).
- Each field accepts more properties than the builder shows (`labelProps`, `inputProps`, `if` conditions, etc.), and there are repeatable fields too. See the [Schema Reference](/schema-forms/schema-reference.md).
- The builder adds `rules: "required"` to required fields. Validation rules in the schema work only with the Encola validator. See [Validation](/core-concepts/validation.md).
