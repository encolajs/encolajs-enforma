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

    <Tabs
      v-if="tabs.length > 0"
      :value="active ?? undefined"
      v-bind="mergeProps(getPassThroughProps('pt.tabs.list'), verticalLayout)"
      @update:value="(value: string | number) => (active = String(value))"
    >
      <TabList
        :pt="vertical ? verticalTabList : undefined"
        @keydown="onVerticalKeydown"
      >
        <Tab
          v-for="tab in tabs"
          :key="tab.name"
          :value="tab.name"
          v-bind="getPassThroughProps('pt.tabs.tab')"
        >
          <span>{{ labelOf(tab) }}</span>
          <EnformaErrorBadge
            :as="getConfig('pt.tabs.badge.as')"
            :count="panelFor(tab.name).errorCount"
            v-bind="getPassThroughProps('pt.tabs.badge')"
          />
        </Tab>
      </TabList>
      <!-- Not lazy: every panel is drawn, one shown, so the fields of the others are checked -->
      <TabPanels :style="vertical ? { flex: '1' } : undefined">
        <TabPanel
          v-for="tab in tabs"
          :key="tab.name"
          :value="tab.name"
          v-bind="getPassThroughProps('pt.tabs.panel')"
        >
          <EnformaPanel :panel="panelFor(tab.name)">
            <EnformaSectionIntro :section="tab.schema" hide-title />
            <EnformaSectionItems :name="tab.name" />
          </EnformaPanel>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
// A section drawn as PrimeVue tabs: its sub-sections are the tabs, its own fields and content
// above them. Each tab counts its errors in a Badge, and opens as focusField() goes to a field
// inside it. PrimeVue's tabs are horizontal only: vertical ones are laid out here, the tabs in
// a column beside the panels, moved between with the up and down arrows.
import { computed, mergeProps } from 'vue'
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primevue'
import { useFormConfig } from '@/utils/useFormConfig'
import { useEnformaTabs } from '@/core/useEnformaTabs'
import EnformaSectionIntro from '@/core/EnformaSectionIntro.vue'
import EnformaSectionItems from '@/core/EnformaSectionItems.vue'
import EnformaPanel from '@/core/EnformaPanel'
import EnformaErrorBadge from '@/core/EnformaErrorBadge.vue'

defineOptions({ name: 'PrimeVueTabs' })

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

// Vertical: the tabs in a column beside the panels, without the bar under the active tab
// (PrimeVue places it for horizontal tabs), the tab list saying it is vertical
const verticalLayout = computed(() =>
  vertical.value ? { style: { display: 'flex', alignItems: 'flex-start' } } : {}
)
const verticalTabList = {
  tabList: {
    style: { flexDirection: 'column' },
    'aria-orientation': 'vertical',
  },
  activeBar: { style: { display: 'none' } },
}

/** Vertical: the up and down arrows move to the previous and next tab, as PrimeVue's left and right do */
function onVerticalKeydown(event: KeyboardEvent): void {
  if (!vertical.value) return
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
  const list = event.currentTarget as HTMLElement
  const buttons = Array.from(
    list.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])')
  )
  if (buttons.length === 0) return
  const at = buttons.indexOf(document.activeElement as HTMLElement)
  const step = event.key === 'ArrowDown' ? 1 : -1
  const to = (Math.max(at, 0) + step + buttons.length) % buttons.length
  event.preventDefault()
  buttons[to].focus()
}
</script>
