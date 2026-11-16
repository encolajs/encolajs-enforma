/**
 * Panels: what hides a form's fields until it is opened, such as a tab or a collapsible.
 *
 * The component drawing the panels makes one with `useEnformaPanel({ reveal })` for each, and
 * wraps each panel's content in `<EnformaPanel :panel>`. The fields inside register with it, and
 * with the panels around it: `focusField()` opens them, the outermost first, before it goes to a
 * field, and a tab's header shows `panel.errorCount`. The header sits outside the panel's content,
 * so the component drawing both holds the panel.
 */
import {
  computed,
  inject,
  onBeforeUnmount,
  reactive,
  shallowReactive,
  toRaw,
} from 'vue'
import { enformaPanelScopeKey } from '@/constants/symbols'

export interface EnformaPanelOptions {
  /** Opens the panel: makes its tab the active one, expands it */
  reveal: () => void | Promise<void>
}

/** A panel, from `useEnformaPanel()`. Reactive */
export interface EnformaPanelState {
  /** Opens the panel */
  reveal(): void | Promise<void>
  /** How many of the fields inside it, at any depth, have errors */
  readonly errorCount: number
}

/** A field inside a panel, as it registers with it */
export interface EnformaPanelEntry {
  /** Its path: two entries for one path (a slot drawing an EnformaField) count once */
  path(): string
  /** Whether it has errors */
  hasError(): boolean
}

/** A panel, as `<EnformaPanel>` provides it to what is inside, with the panel around it */
export interface EnformaPanelScope {
  readonly panel: EnformaPanelState
  readonly parent: EnformaPanelScope | null
}

// The fields registered with each panel
const entriesOf = new WeakMap<object, Set<EnformaPanelEntry>>()

/**
 * A panel (a tab, a collapsible) whose fields `focusField()` opens it for. Give it to
 * `<EnformaPanel :panel>` around the panel's content; the same object for as long as the
 * panel is drawn
 */
export function useEnformaPanel(
  options: EnformaPanelOptions
): EnformaPanelState {
  const entries = shallowReactive(new Set<EnformaPanelEntry>())
  const panel = reactive({
    reveal: () => options.reveal(),
    errorCount: computed(() => {
      const failing = new Set<string>()
      for (const entry of entries) {
        if (entry.hasError()) failing.add(entry.path())
      }
      return failing.size
    }),
  }) as EnformaPanelState
  entriesOf.set(toRaw(panel), entries)
  return panel
}

/** The panels holding the component calling it (in its `setup()`), the outermost first */
export function usePanelsAround(): () => EnformaPanelState[] {
  const scope = inject<EnformaPanelScope | null>(enformaPanelScopeKey, null)
  return () => {
    const panels: EnformaPanelState[] = []
    for (let at = scope; at; at = at.parent) panels.unshift(at.panel)
    return panels
  }
}

/**
 * Registers a field of the component calling it (in its `setup()`) with the panels holding
 * it, which count it while it has errors, until it unmounts. Gives those panels, the
 * outermost first
 */
export function registerInPanels(
  entry: EnformaPanelEntry
): () => EnformaPanelState[] {
  const panelsAround = usePanelsAround()
  const registeredIn = panelsAround()
    .map((panel) => entriesOf.get(toRaw(panel)))
    .filter((entries): entries is Set<EnformaPanelEntry> => !!entries)
  registeredIn.forEach((entries) => entries.add(entry))
  onBeforeUnmount(() =>
    registeredIn.forEach((entries) => entries.delete(entry))
  )
  return panelsAround
}
