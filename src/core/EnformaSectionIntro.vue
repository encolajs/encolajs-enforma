<template>
  <component
    :is="section.titleComponent || 'h2'"
    v-if="section.title && !hideTitle"
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
// A section's title (`h2` unless its `titleComponent` names another) and description (`p`
// unless its `descriptionComponent` does), for the tabs and collapsibles drawing a section
defineOptions({ name: 'EnformaSectionIntro' })

defineProps<{
  /** The section's schema */
  section: Record<string, any>
  /** Leaves the title out: a tab's panel, whose title is its tab's */
  hideTitle?: boolean
}>()
</script>
