<template>
  <component
    :is="section.titleComponent"
    v-if="section.title && section.titleComponent && !hideTitle"
    v-bind="section.titleProps"
  >
    {{ section.title }}
  </component>
  <component
    :is="section.descriptionComponent || 'p'"
    v-if="section.description"
    v-bind="section.descriptionProps"
  >
    {{ section.description }}
  </component>
</template>

<script setup lang="ts">
// A section's title, drawn with its `titleComponent` (a section without one shows no title, as
// EnformaSection's), and its description (`p` unless its `descriptionComponent` names another),
// for the tabs drawing a section
defineOptions({ name: 'EnformaSectionIntro' })

defineProps<{
  /** The section's schema */
  section: Record<string, any>
  /** Leaves the title out: a tab's panel, whose title is its tab's */
  hideTitle?: boolean
}>()
</script>
