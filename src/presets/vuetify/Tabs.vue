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

    <div
      v-if="tabs.length > 0"
      :class="vertical ? 'd-flex flex-row' : undefined"
    >
      <VTabs
        v-model="active"
        :direction="orientation"
        v-bind="getPassThroughProps('pt.tabs.list')"
      >
        <VTab
          v-for="tab in tabs"
          :key="tab.name"
          :value="tab.name"
          v-bind="getPassThroughProps('pt.tabs.tab')"
        >
          {{ labelOf(tab) }}
          <EnformaErrorBadge
            :as="getConfig('pt.tabs.badge.as')"
            :count="panelFor(tab.name).errorCount"
            v-bind="getPassThroughProps('pt.tabs.badge')"
          />
        </VTab>
      </VTabs>
      <VTabsWindow
        v-model="active"
        :class="vertical ? 'flex-grow-1' : undefined"
      >
        <!-- eager: every panel is drawn from the start, so the fields of the others are checked -->
        <VTabsWindowItem
          v-for="tab in tabs"
          :key="tab.name"
          :value="tab.name"
          eager
          v-bind="getPassThroughProps('pt.tabs.panel')"
        >
          <EnformaPanel :panel="panelFor(tab.name)">
            <EnformaSectionIntro :section="tab.schema" hide-title />
            <EnformaSectionItems :name="tab.name" />
          </EnformaPanel>
        </VTabsWindowItem>
      </VTabsWindow>
    </div>
  </div>
</template>

<script setup lang="ts">
// A section drawn as Vuetify tabs (VTabs, with a VTabsWindow for the panels): its
// sub-sections are the tabs, its own fields and content above them. Vertical tabs sit beside
// their panels. Each tab counts its errors in a VChip, and opens as focusField() goes to a
// field inside it.
import { computed, mergeProps } from 'vue'
import { VTabs, VTab, VTabsWindow, VTabsWindowItem } from 'vuetify/components'
import { useFormConfig } from '@/utils/useFormConfig'
import { useEnformaTabs } from '@/core/useEnformaTabs'
import EnformaSectionIntro from '@/core/EnformaSectionIntro.vue'
import EnformaSectionItems from '@/core/EnformaSectionItems.vue'
import EnformaPanel from '@/core/EnformaPanel'
import EnformaErrorBadge from '@/core/EnformaErrorBadge.vue'

defineOptions({ name: 'VuetifyTabs' })

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

const vertical = computed(() => orientation.value === 'vertical')
</script>
