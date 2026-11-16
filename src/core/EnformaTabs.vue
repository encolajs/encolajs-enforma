<template>
  <div
    v-bind="mergeProps($attrs, getPassThroughProps('pt.tabs.root'))"
    :data-orientation="orientation"
  >
    <component
      :is="section.titleComponent || 'h2'"
      v-if="section.title"
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

    <!-- Its own fields and content, above the tabs -->
    <EnformaSectionItems
      :name="name"
      :kinds="['field', 'repeatable', 'content']"
    />

    <template v-if="tabs.length > 0">
      <div
        role="tablist"
        :aria-orientation="orientation"
        v-bind="getPassThroughProps('pt.tabs.list')"
        @keydown="onKeydown"
      >
        <button
          v-for="tab in tabs"
          :id="tabId(tab.name)"
          :key="tab.name"
          :ref="(el) => (tabButtons[tab.name] = el as HTMLElement | null)"
          type="button"
          role="tab"
          :aria-selected="tab.name === active ? 'true' : 'false'"
          :aria-controls="panelId(tab.name)"
          :tabindex="tab.name === active ? 0 : -1"
          v-bind="getPassThroughProps('pt.tabs.tab')"
          @click="active = tab.name"
        >
          {{ tab.schema.title || tab.name }}
          <EnformaErrorBadge
            :count="panelFor(tab.name).errorCount"
            v-bind="getPassThroughProps('pt.tabs.badge')"
          />
        </button>
      </div>

      <!-- Every panel is drawn, one shown: the fields of the others are checked too -->
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
          <component
            :is="tab.schema.descriptionComponent || 'p'"
            v-if="tab.schema.description"
            v-bind="tab.schema.descriptionProps"
          >
            {{ tab.schema.description }}
          </component>
          <EnformaSectionItems :name="tab.name" />
        </EnformaPanel>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
// A section drawn as tabs: its sub-sections are the tabs, each titled by its sub-section's
// title, which the panel doesn't repeat; its own fields and content are drawn above them.
// `props.active` names the tab open at first (the first one otherwise), `props.orientation`
// lays the tabs out `horizontal` (by default) or `vertical`. A tab shows how many of its
// fields have errors, and opens as focusField() goes to one of them.
import { computed, mergeProps, ref, watch } from 'vue'
import { useFormConfig } from '@/utils/useFormConfig'
import { generateId } from '@/utils/helpers'
import { useEnformaSection } from './useEnformaSection'
import { useEnformaPanel, type EnformaPanelState } from './useEnformaPanel'
import EnformaSectionItems from './EnformaSectionItems.vue'
import EnformaPanel from './EnformaPanel'
import EnformaErrorBadge from './EnformaErrorBadge.vue'

defineOptions({ name: 'EnformaTabs' })

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
  /** The sub-section whose tab is open at first */
  active?: string | null
  /** How the tabs are laid out */
  orientation?: 'horizontal' | 'vertical' | null
}>()

const { getPassThroughProps } = useFormConfig()
const { schema: section, items } = useEnformaSection(
  () => props.name,
  () => props
)

const orientation = computed(() =>
  section.value.orientation === 'vertical' ? 'vertical' : 'horizontal'
)

// The sub-sections shown (by their `if`) are the tabs
const tabs = computed(() =>
  items.value.filter((item) => item.kind === 'section')
)
const tabNames = computed(() => tabs.value.map((tab) => tab.name))

// The open tab: the one chosen, or the first while that one is hidden
const chosen = ref<string | null>(section.value.active ?? null)
const active = computed<string | null>({
  get: () =>
    chosen.value && tabNames.value.includes(chosen.value)
      ? chosen.value
      : tabNames.value[0] ?? null,
  set: (name) => (chosen.value = name),
})
// A hidden open tab gives way to the first for good
watch(tabNames, (names) => {
  if (chosen.value && !names.includes(chosen.value)) {
    chosen.value = names[0] ?? null
  }
})

// Each tab's panel, which focusField() opens it through and which counts its errors
const panels = new Map<string, EnformaPanelState>()
function panelFor(name: string): EnformaPanelState {
  let panel = panels.get(name)
  if (!panel) {
    panel = useEnformaPanel({ reveal: () => (active.value = name) })
    panels.set(name, panel)
  }
  return panel
}

const idBase = generateId('tabs', props.name)
const idPart = (name: string) => name.replace(/[^a-zA-Z0-9_-]/g, '_')
const tabId = (name: string) => `${idBase}-tab-${idPart(name)}`
const panelId = (name: string) => `${idBase}-panel-${idPart(name)}`

// The tabs' buttons, for the keyboard to move between them
const tabButtons: Record<string, HTMLElement | null> = {}

/**
 * The arrow keys open the next and previous tab (left and right, swapped right to left, or
 * up and down when vertical), Home and End the first and the last, and focus its button
 */
function onKeydown(event: KeyboardEvent): void {
  const names = tabNames.value
  if (names.length === 0 || !active.value) return
  const vertical = orientation.value === 'vertical'
  const list = event.currentTarget as HTMLElement | null
  const rightToLeft =
    !vertical &&
    !!list &&
    typeof getComputedStyle === 'function' &&
    getComputedStyle(list).direction === 'rtl'
  const nextKey = vertical
    ? 'ArrowDown'
    : rightToLeft
    ? 'ArrowLeft'
    : 'ArrowRight'
  const previousKey = vertical
    ? 'ArrowUp'
    : rightToLeft
    ? 'ArrowRight'
    : 'ArrowLeft'
  const at = names.indexOf(active.value)
  let to: number
  switch (event.key) {
    case nextKey:
      to = (at + 1) % names.length
      break
    case previousKey:
      to = (at - 1 + names.length) % names.length
      break
    case 'Home':
      to = 0
      break
    case 'End':
      to = names.length - 1
      break
    default:
      return
  }
  event.preventDefault()
  active.value = names[to]
  tabButtons[names[to]]?.focus()
}
</script>
