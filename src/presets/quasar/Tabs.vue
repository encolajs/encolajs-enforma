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

    <div v-if="tabs.length > 0" :class="vertical ? 'row no-wrap' : undefined">
      <QTabs
        v-model="active"
        :vertical="vertical"
        v-bind="getPassThroughProps('pt.tabs.list')"
      >
        <QTab
          v-for="tab in tabs"
          :id="tabId(tab.name)"
          :key="tab.name"
          :name="tab.name"
          :label="labelOf(tab)"
          :aria-controls="panelId(tab.name)"
          v-bind="getPassThroughProps('pt.tabs.tab')"
        >
          <EnformaErrorBadge
            :as="getConfig('pt.tabs.badge.as')"
            :count="panelFor(tab.name).errorCount"
            v-bind="getPassThroughProps('pt.tabs.badge')"
          />
        </QTab>
      </QTabs>

      <!--
        The panels, drawn here rather than by QTabPanels, which draws the open one only: every
        panel is drawn, one shown, so the fields of the others are checked
      -->
      <div :class="vertical ? 'col' : undefined">
        <div
          v-for="tab in tabs"
          v-show="tab.name === active"
          :id="panelId(tab.name)"
          :key="tab.name"
          role="tabpanel"
          :aria-labelledby="tabId(tab.name)"
          v-bind="getPassThroughProps('pt.tabs.panel')"
        >
          <EnformaPanel :panel="panelFor(tab.name)">
            <EnformaSectionIntro :section="tab.schema" hide-title />
            <EnformaSectionItems :name="tab.name" />
          </EnformaPanel>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// A section drawn as Quasar tabs (QTabs): its sub-sections are the tabs, its own fields and
// content above them. Vertical tabs sit beside their panels. Each tab counts its errors in a
// QBadge, and opens as focusField() goes to a field inside it.
import { computed, mergeProps } from 'vue'
import { QTabs, QTab } from 'quasar'
import { useFormConfig } from '@/utils/useFormConfig'
import { useEnformaTabs } from '@/core/useEnformaTabs'
import EnformaSectionIntro from '@/core/EnformaSectionIntro.vue'
import EnformaSectionItems from '@/core/EnformaSectionItems.vue'
import EnformaPanel from '@/core/EnformaPanel'
import EnformaErrorBadge from '@/core/EnformaErrorBadge.vue'

defineOptions({ name: 'QuasarTabs' })

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
  tabId,
  panelId,
} = useEnformaTabs(
  () => props.name,
  () => props
)

const vertical = computed(() => orientation.value === 'vertical')
</script>
