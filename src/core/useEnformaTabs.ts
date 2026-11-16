/**
 * The state of a section drawn as tabs (`component: 'tabs'`), for Enforma's own tabs and a
 * kit's: its sub-sections shown are the tabs, one is open, and each has a panel that counts
 * its errors and opens its tab as `focusField()` goes to a field inside it.
 */
import {
  computed,
  ref,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
  type WritableComputedRef,
} from 'vue'
import { generateId } from '@/utils/helpers'
import { useEnformaSection, type EnformaSectionItem } from './useEnformaSection'
import { useEnformaPanel, type EnformaPanelState } from './useEnformaPanel'

/** A tabs section, from `useEnformaTabs()`. Reactive */
export interface EnformaTabsState {
  /** The tabs section's schema, with the props its component was given over it */
  schema: ComputedRef<Record<string, any>>
  /** How the tabs are laid out: `props.orientation`, `horizontal` by default */
  orientation: ComputedRef<'horizontal' | 'vertical'>
  /** The sub-sections shown (by their `if`), each a tab */
  tabs: ComputedRef<EnformaSectionItem[]>
  /**
   * The open tab's name: `props.active` at first, or the first tab. Set it to open another;
   * when the open one hides, the first opens
   */
  active: WritableComputedRef<string | null>
  /** The label of a tab: its sub-section's title, or its name */
  labelOf(tab: EnformaSectionItem): string
  /** The panel of a tab, to give `<EnformaPanel>` around its content and to count its errors */
  panelFor(name: string): EnformaPanelState
  /** The id of a tab's button, for `aria-labelledby` */
  tabId(name: string): string
  /** The id of a tab's panel, for `aria-controls` */
  panelId(name: string): string
}

/**
 * The state of the tabs section `name`. `props` are those its component was given, which its
 * schema merges over its entry. Call it in `setup()`, under a form
 */
export function useEnformaTabs(
  name: MaybeRefOrGetter<string>,
  props: MaybeRefOrGetter<Record<string, any>> = {}
): EnformaTabsState {
  const { schema, items } = useEnformaSection(name, props)

  const orientation = computed(() =>
    schema.value.orientation === 'vertical' ? 'vertical' : 'horizontal'
  )
  const tabs = computed(() =>
    items.value.filter((item) => item.kind === 'section')
  )
  const tabNames = computed(() => tabs.value.map((tab) => tab.name))

  // The tab chosen; the first one stands in while it is hidden
  const chosen = ref<string | null>(schema.value.active ?? null)
  const active = computed<string | null>({
    get: () =>
      chosen.value && tabNames.value.includes(chosen.value)
        ? chosen.value
        : tabNames.value[0] ?? null,
    set: (tab) => (chosen.value = tab),
  })
  // A hidden open tab gives way to the first for good
  watch(tabNames, (names) => {
    if (chosen.value && !names.includes(chosen.value)) {
      chosen.value = names[0] ?? null
    }
  })

  const panels = new Map<string, EnformaPanelState>()
  function panelFor(tab: string): EnformaPanelState {
    let panel = panels.get(tab)
    if (!panel) {
      panel = useEnformaPanel({
        reveal: () => {
          active.value = tab
        },
      })
      panels.set(tab, panel)
    }
    return panel
  }

  const idBase = generateId('tabs', String(schema.value.name ?? ''))
  const idPart = (tab: string) => tab.replace(/[^a-zA-Z0-9_-]/g, '_')

  return {
    schema,
    orientation,
    tabs,
    active,
    labelOf: (tab) => tab.schema.title || tab.name,
    panelFor,
    tabId: (tab) => `${idBase}-tab-${idPart(tab)}`,
    panelId: (tab) => `${idBase}-panel-${idPart(tab)}`,
  }
}
