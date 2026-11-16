<template>
  <div
    v-bind="mergeProps($attrs, getPassThroughProps('pt.tabs.root'))"
    :data-orientation="orientation"
  >
    <EnformaSectionIntro :section="section" />

    <!-- Its own fields and content, above the tabs -->
    <EnformaSectionItems
      :name="name"
      :kinds="['field', 'repeatable', 'content']"
    />

    <!-- Every panel stays drawn (unmount-on-hide off): the fields of the others are checked -->
    <component
      :is="getConfig('pt.tabs.list.as')"
      v-if="tabs.length > 0"
      v-model="active"
      :items="items"
      :orientation="orientation"
      :unmount-on-hide="false"
      v-bind="getPassThroughProps('pt.tabs.list')"
    >
      <template #trailing="{ item }">
        <EnformaErrorBadge
          :as="getConfig('pt.tabs.badge.as')"
          :count="panelFor(item.value).errorCount"
          v-bind="getPassThroughProps('pt.tabs.badge')"
        />
      </template>
      <template #content="{ item }">
        <EnformaPanel :panel="panelFor(item.value)">
          <EnformaSectionIntro :section="item.section" hide-title />
          <EnformaSectionItems :name="item.value" />
        </EnformaPanel>
      </template>
    </component>
  </div>
</template>

<script setup lang="ts">
// A section drawn as Nuxt UI tabs (UTabs, given to the preset as `tabs`): its sub-sections are
// the tabs, its own fields and content above them. Each tab counts its errors in a UBadge
// (`badge`), and opens as focusField() goes to a field inside it.
import { computed, mergeProps } from 'vue'
import { useFormConfig } from '@/utils/useFormConfig'
import { useEnformaTabs } from '@/core/useEnformaTabs'
import EnformaSectionIntro from '@/core/EnformaSectionIntro.vue'
import EnformaSectionItems from '@/core/EnformaSectionItems.vue'
import EnformaPanel from '@/core/EnformaPanel'
import EnformaErrorBadge from '@/core/EnformaErrorBadge.vue'

defineOptions({ name: 'NuxtUITabs' })

const props = defineProps<{
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
  active?: string | null
  orientation?: 'horizontal' | 'vertical' | null
}>()

const { getConfig, getPassThroughProps } = useFormConfig()
const {
  schema: section,
  orientation,
  tabs,
  active,
  labelOf,
  panelFor,
} = useEnformaTabs(
  () => props.name,
  () => props
)

// UTabs' items: a tab's label, its sub-section's name as its value, and its sub-section
const items = computed(() =>
  tabs.value.map((tab) => ({
    label: labelOf(tab),
    value: tab.name,
    section: tab.schema,
  }))
)
</script>
