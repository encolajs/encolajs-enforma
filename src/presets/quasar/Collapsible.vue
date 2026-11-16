<template>
  <div
    v-bind="mergeProps($attrs, getPassThroughProps('pt.collapsible.root'))"
    :data-state="open ? 'open' : 'closed'"
  >
    <!-- Its content stays drawn while closed (v-show): its fields are checked -->
    <QExpansionItem
      v-model="open"
      v-bind="getPassThroughProps('pt.collapsible.body')"
    >
      <template #header>
        <QItemSection v-bind="getPassThroughProps('pt.collapsible.header')">
          <QItemLabel
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
          </QItemLabel>
          <!-- Under the title, read while the collapsible is closed -->
          <QItemLabel
            v-if="section.description"
            caption
            v-bind="
              mergeProps(
                section.descriptionProps || {},
                getPassThroughProps('pt.collapsible.description')
              )
            "
          >
            {{ section.description }}
          </QItemLabel>
        </QItemSection>
      </template>

      <EnformaPanel :panel="panel">
        <EnformaSectionItems :name="name" />
      </EnformaPanel>
    </QExpansionItem>
  </div>
</template>

<script setup lang="ts">
// A section that opens and closes as a Quasar QExpansionItem: its header holds its title, its
// count of errors (a QBadge) and its description, as the item's caption.
import { mergeProps } from 'vue'
import { QExpansionItem, QItemSection, QItemLabel } from 'quasar'
import { useFormConfig } from '@/utils/useFormConfig'
import { useEnformaCollapsible } from '@/core/useEnformaCollapsible'
import EnformaSectionItems from '@/core/EnformaSectionItems.vue'
import EnformaPanel from '@/core/EnformaPanel'
import EnformaErrorBadge from '@/core/EnformaErrorBadge.vue'

defineOptions({ name: 'QuasarCollapsible' })

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
</script>
