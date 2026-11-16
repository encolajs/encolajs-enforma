/**
 * The state of a section that opens and closes (`component: 'collapsible'`), for Enforma's own
 * collapsible and a kit's: whether it is open, and its panel, which counts its errors and opens
 * it as `focusField()` goes to a field inside it.
 */
import {
  computed,
  ref,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'
import { generateId } from '@/utils/helpers'
import { useEnformaSection } from './useEnformaSection'
import { useEnformaPanel, type EnformaPanelState } from './useEnformaPanel'

/** A collapsible section, from `useEnformaCollapsible()`. Reactive */
export interface EnformaCollapsibleState {
  /** Its schema, with the props its component was given over it */
  schema: ComputedRef<Record<string, any>>
  /** Its title: the section's title, or its name */
  title: ComputedRef<string>
  /** Whether it is open: at first, unless `props.open` is false */
  open: Ref<boolean>
  /** Its panel, to give `<EnformaPanel>` around its body and to count its errors */
  panel: EnformaPanelState
  /** The id of its toggle, for `aria-labelledby` */
  headerId: string
  /** The id of its body, for `aria-controls` */
  bodyId: string
}

/**
 * The state of the collapsible section `name`. `props` are those its component was given,
 * which its schema merges over its entry. Call it in `setup()`, under a form
 */
export function useEnformaCollapsible(
  name: MaybeRefOrGetter<string>,
  props: MaybeRefOrGetter<Record<string, any>> = {}
): EnformaCollapsibleState {
  const { schema } = useEnformaSection(name, props)
  const open = ref(schema.value.open !== false)
  const panel = useEnformaPanel({
    reveal: () => {
      open.value = true
    },
  })
  const idBase = generateId('collapsible', String(schema.value.name ?? ''))
  return {
    schema,
    title: computed(() =>
      String(schema.value.title || schema.value.name || '')
    ),
    open,
    panel,
    headerId: `${idBase}-header`,
    bodyId: `${idBase}-body`,
  }
}
