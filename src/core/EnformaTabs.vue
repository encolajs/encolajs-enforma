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
          {{ labelOf(tab) }}
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
          <EnformaSectionIntro :section="tab.schema" hide-title />
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
import { mergeProps } from 'vue'
import { useFormConfig } from '@/utils/useFormConfig'
import { useEnformaTabs } from './useEnformaTabs'
import EnformaSectionIntro from './EnformaSectionIntro.vue'
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

// The tabs' buttons, for the keyboard to move between them
const tabButtons: Record<string, HTMLElement | null> = {}

/**
 * The arrow keys open the next and previous tab (left and right, swapped right to left, or
 * up and down when vertical), Home and End the first and the last, and focus its button
 */
function onKeydown(event: KeyboardEvent): void {
  const names = tabs.value.map((tab) => tab.name)
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
