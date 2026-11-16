<template>
  <div
    v-bind="mergeProps($attrs, getPassThroughProps('pt.collapsible.root'))"
    :data-state="open ? 'open' : 'closed'"
  >
    <!-- Its content stays drawn while collapsed (v-show): its fields are checked -->
    <Panel
      toggleable
      :header="title"
      :collapsed="!open"
      :toggle-button-props="{
        ariaLabel: title,
        ...getPassThroughProps('pt.collapsible.toggle'),
      }"
      v-bind="getPassThroughProps('pt.collapsible.body')"
      @update:collapsed="(collapsed: boolean) => (open = !collapsed)"
    >
      <template #header>
        <div v-bind="getPassThroughProps('pt.collapsible.header')">
          <component
            :is="section.titleComponent || 'div'"
            v-bind="
              mergeProps(
                section.titleProps || {},
                getPassThroughProps('pt.collapsible.title')
              )
            "
          >
            <span>{{ title }}</span>
            <EnformaErrorBadge
              :as="getConfig('pt.collapsible.badge.as')"
              :count="panel.errorCount"
              v-bind="getPassThroughProps('pt.collapsible.badge')"
            />
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
      </template>

      <EnformaPanel :panel="panel">
        <EnformaSectionItems :name="name" />
      </EnformaPanel>
    </Panel>
  </div>
</template>

<script setup lang="ts">
// A section that opens and closes as a toggleable PrimeVue Panel: its header holds its title,
// its count of errors (a Badge) and its description; Panel's button opens and closes it.
import { mergeProps } from 'vue'
import { Panel } from 'primevue'
import { useFormConfig } from '@/utils/useFormConfig'
import { useEnformaCollapsible } from '@/core/useEnformaCollapsible'
import EnformaSectionItems from '@/core/EnformaSectionItems.vue'
import EnformaPanel from '@/core/EnformaPanel'
import EnformaErrorBadge from '@/core/EnformaErrorBadge.vue'

defineOptions({ name: 'PrimeVueCollapsible' })

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
