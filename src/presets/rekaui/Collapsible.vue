<template>
  <!-- unmount-on-hide off: its body is drawn while closed too, so its fields are checked -->
  <CollapsibleRoot
    v-model:open="open"
    :unmount-on-hide="false"
    v-bind="mergeProps($attrs, getPassThroughProps('pt.collapsible.root'))"
  >
    <div v-bind="getPassThroughProps('pt.collapsible.header')">
      <component
        :is="section.titleComponent || 'h2'"
        v-bind="
          mergeProps(
            section.titleProps || {},
            getPassThroughProps('pt.collapsible.title')
          )
        "
      >
        <CollapsibleTrigger
          :id="headerId"
          v-bind="getPassThroughProps('pt.collapsible.toggle')"
        >
          {{ title }}
          <EnformaErrorBadge
            :as="getConfig('pt.collapsible.badge.as')"
            :count="panel.errorCount"
            v-bind="getPassThroughProps('pt.collapsible.badge')"
          />
        </CollapsibleTrigger>
      </component>
      <!-- Under the title, read while the collapsible is closed -->
      <component
        :is="section.descriptionComponent || 'p'"
        v-if="section.description"
        v-bind="
          mergeProps(
            section.descriptionProps || {},
            getPassThroughProps('pt.collapsible.description')
          )
        "
      >
        {{ section.description }}
      </component>
    </div>
    <CollapsibleContent v-bind="getPassThroughProps('pt.collapsible.body')">
      <EnformaPanel :panel="panel">
        <EnformaSectionItems :name="name" />
      </EnformaPanel>
    </CollapsibleContent>
  </CollapsibleRoot>
</template>

<script setup lang="ts">
// A section that opens and closes as a Reka UI collapsible: its title is the trigger, with how
// many of its fields have errors, its description under it; its items are its content.
import { mergeProps } from 'vue'
import {
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent,
} from 'reka-ui'
import { useFormConfig } from '@/utils/useFormConfig'
import { useEnformaCollapsible } from '@/core/useEnformaCollapsible'
import EnformaSectionItems from '@/core/EnformaSectionItems.vue'
import EnformaPanel from '@/core/EnformaPanel'
import EnformaErrorBadge from '@/core/EnformaErrorBadge.vue'

defineOptions({ name: 'RekaUICollapsible', inheritAttrs: false })

// `open` left out stays undefined, not false (as a Boolean prop would be): open at first
const props = withDefaults(
  defineProps<{
    name: string
    title?: string
    titleComponent?: string | object
    titleProps?: object | null
    description?: string
    descriptionComponent?: string | object
    descriptionProps?: object | null
    section?: string | null
    position?: number | null
    columns?: number | Record<string, number> | null
    span?: number | Record<string, number> | null
    open?: boolean | null
  }>(),
  { open: undefined }
)

const { getConfig, getPassThroughProps } = useFormConfig()
const {
  schema: section,
  title,
  open,
  panel,
  headerId,
} = useEnformaCollapsible(
  () => props.name,
  () => props
)
</script>
