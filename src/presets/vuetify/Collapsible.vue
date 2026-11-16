<template>
  <div
    v-bind="mergeProps($attrs, getPassThroughProps('pt.collapsible.root'))"
    :data-state="open ? 'open' : 'closed'"
  >
    <!-- eager: its body is drawn while closed too, so its fields are checked -->
    <VExpansionPanels
      v-model="openPanel"
      eager
      v-bind="getPassThroughProps('pt.collapsible.body')"
    >
      <VExpansionPanel value="body">
        <VExpansionPanelTitle
          v-bind="getPassThroughProps('pt.collapsible.toggle')"
        >
          <div v-bind="getPassThroughProps('pt.collapsible.header')">
            <span
              v-bind="
                mergeProps(
                  section.titleProps || {},
                  getPassThroughProps('pt.collapsible.title')
                )
              "
            >
              {{ title }}
              <EnformaErrorBadge
                :as="getConfig('pt.collapsible.badge.as')"
                :count="panel.errorCount"
                v-bind="getPassThroughProps('pt.collapsible.badge')"
              />
            </span>
            <!-- Under the title, read while the collapsible is closed -->
            <span
              v-if="section.description"
              v-bind="
                mergeProps(
                  section.descriptionProps || {},
                  getPassThroughProps('pt.collapsible.description')
                )
              "
            >
              {{ section.description }}
            </span>
          </div>
        </VExpansionPanelTitle>
        <VExpansionPanelText>
          <EnformaPanel :panel="panel">
            <EnformaSectionItems :name="name" />
          </EnformaPanel>
        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>
  </div>
</template>

<script setup lang="ts">
// A section that opens and closes as a Vuetify expansion panel: its title (the button opening
// it) holds its title, its count of errors (a VChip) and its description. Vuetify's title is a
// button, which holds no heading: the title is drawn in a span.
import { computed, mergeProps } from 'vue'
import {
  VExpansionPanels,
  VExpansionPanel,
  VExpansionPanelTitle,
  VExpansionPanelText,
} from 'vuetify/components'
import { useFormConfig } from '@/utils/useFormConfig'
import { useEnformaCollapsible } from '@/core/useEnformaCollapsible'
import EnformaSectionItems from '@/core/EnformaSectionItems.vue'
import EnformaPanel from '@/core/EnformaPanel'
import EnformaErrorBadge from '@/core/EnformaErrorBadge.vue'

defineOptions({ name: 'VuetifyCollapsible' })

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
} = useEnformaCollapsible(
  () => props.name,
  () => props
)

// VExpansionPanels' model: the open panel's value, none while closed
const openPanel = computed({
  get: () => (open.value ? 'body' : null),
  set: (value: unknown) => {
    open.value = Array.isArray(value)
      ? value.includes('body')
      : value === 'body'
  },
})
</script>
