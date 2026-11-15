import {
  camelize,
  capitalize,
  computed,
  getCurrentInstance,
  inject,
  toValue,
  unref,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref,
  type Slot,
} from 'vue'
import {
  formSchemaKey,
  formControllerKey,
  formFieldSlotsKey,
  formContextKey,
} from '@/constants/symbols'
import type { SectionSchema, FormSchema, FormController } from '@/types'
import { useFormConfig } from '@/utils/useFormConfig'
import applyTransformers from '@/utils/applyTransformers'
import { evaluateCondition } from '@/utils/evaluateCondition'
import EnformaField from './EnformaField.vue'
import EnformaRepeatable from './EnformaRepeatable.vue'
import EnformaRepeatableTable from './EnformaRepeatableTable.vue'
// Used when a section renders, never as this module loads: the two import each other
import EnformaSection from './EnformaSection.vue'

/** What an item of a section is: a field, a sub-section or a repeatable */
export type EnformaSectionItemKind = 'field' | 'section' | 'repeatable'

/** One item of a section, as `useEnformaSection()` gives it, in render order */
export interface EnformaSectionItem {
  /** What it is */
  kind: EnformaSectionItemKind
  /** Its key in the schema: a field's path, a section's name */
  name: string
  /** Its schema entry, with its name */
  schema: Record<string, any> & { name: string }
  /** What draws it: its own component, or the config's for its kind */
  component: string | object
  /** What its component is given */
  props: Record<string, any>
  /**
   * The form's slot for this field (`field(email)`), drawn instead of its component, with
   * `{ field, formController, config }`
   */
  slot?: Slot
}

/** A section, from `useEnformaSection()`. Reactive */
export interface EnformaSectionState {
  /** The section's schema: its entry, with the props its component was given over it, after the `section_props` transformers */
  schema: ComputedRef<Record<string, any>>
  /** Whether it is shown, by its `if` */
  shown: ComputedRef<boolean>
  /** Its items, in render order, those hidden by their `if` left out */
  items: ComputedRef<EnformaSectionItem[]>
}

// The component names sections gave that nothing has, each warned about once
const unknownSectionComponents = new Set<string>()

export function isSectionSchema(value: any): value is SectionSchema {
  return value && typeof value === 'object' && value?.type === 'section'
}

/**
 * Whether an entry sits in section `sectionName`. The `default` section is the root:
 * it holds the entries that name no section (left out, null or empty) and those
 * naming `default`.
 */
function belongsTo(
  entry: { section?: string | null },
  sectionName: string
): boolean {
  if (sectionName === 'default') {
    return !entry.section || entry.section === sectionName
  }
  return entry.section === sectionName
}

// Helper function to sort items by position
function sortByPosition<T extends { position?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    // If both items have position, sort by position
    if (a.position !== undefined && b.position !== undefined) {
      return a.position - b.position
    }
    // If only one item has position, it comes first
    if (a.position !== undefined) return -1
    if (b.position !== undefined) return 1
    // If neither has position, maintain original order
    return 0
  })
}

/**
 * Merges the sorted fields and sub-sections into the rendering order.
 * Fields come first, unless a sub-section and a field both have a position
 * and the sub-section's position is lower
 */
function mergeByPosition<
  F extends { position?: number },
  S extends { position?: number }
>(fields: F[], sections: S[]): Array<F | S> {
  const items: Array<F | S> = []
  let f = 0
  let s = 0
  while (f < fields.length && s < sections.length) {
    const fieldPosition = fields[f].position
    const sectionPosition = sections[s].position
    if (
      fieldPosition !== undefined &&
      sectionPosition !== undefined &&
      sectionPosition < fieldPosition
    ) {
      items.push(sections[s++])
    } else {
      items.push(fields[f++])
    }
  }
  return items.concat(fields.slice(f), sections.slice(s))
}

/** What kind of item an entry is */
function kindOf(entry: Record<string, any>): EnformaSectionItemKind {
  if (isSectionSchema(entry)) return 'section'
  if (
    entry.type === 'repeatable' ||
    entry.type === 'repeatable-table' ||
    entry.type === 'repeatable_table'
  ) {
    return 'repeatable'
  }
  return 'field'
}

/**
 * The state of the section named `name` of the form's schema: its schema, whether it is
 * shown, and its items in render order. `props` are those its component was given, which
 * its schema merges over its entry. Call it in `setup()`, under a form (`<Enforma>`, or
 * `provideEnformaForm()`). A kit's section component draws its own frame around
 * `<EnformaSectionItems :name>`, or draws the items itself (sub-sections as tabs).
 */
export function useEnformaSection(
  name: MaybeRefOrGetter<string>,
  props: MaybeRefOrGetter<Record<string, any>> = {}
): EnformaSectionState {
  // The schema and the context may be refs (Enforma provides computeds), read where
  // they're used, so a changed schema changes the section
  const injectedSchema = inject<FormSchema | Ref<FormSchema>>(formSchemaKey, {})
  const formCtrl = inject<FormController>(formControllerKey)
  const formContext = inject<any>(formContextKey, null)
  const parentSlots = inject<Record<string, Slot> | null>(
    formFieldSlotsKey,
    null
  )
  const { getConfig, formConfig } = useFormConfig()
  // The config's section component, or Enforma's own
  const sectionComponent = (getConfig('components.section') ||
    EnformaSection) as string | object
  // The components registered in the Vue app, which a section may name
  const appComponents = getCurrentInstance()?.appContext.components ?? {}

  /** Whether an entry is shown, by its `if` */
  function isShown(entry: Record<string, any>): boolean {
    if (entry['if'] === undefined) return true
    if (typeof entry['if'] !== 'string') return entry['if']
    return evaluateCondition(
      entry['if'],
      formCtrl as FormController,
      unref(formContext),
      formConfig
    )
  }

  /**
   * The component drawing a sub-section: the one its `component` names, from the form's
   * config (`components.card`) or the Vue app, or the component it gives itself; the
   * config's section component without one, or when nothing has the name it gives.
   */
  function sectionComponentFor(
    section: Record<string, any> & { name: string }
  ): string | object {
    const named = section.component
    if (named && typeof named === 'object') return named
    if (typeof named !== 'string' || named === '') return sectionComponent
    const component =
      getConfig(`components.${named}`) ??
      appComponents[named] ??
      appComponents[camelize(named)] ??
      appComponents[capitalize(camelize(named))]
    if (component) return component as string | object
    if (!unknownSectionComponents.has(named)) {
      unknownSectionComponents.add(named)
      console.warn(
        `[Enforma] The section "${section.name}" names the component "${named}", which neither the form's config nor the Vue app has: it is drawn with the section component`
      )
    }
    return sectionComponent
  }

  /** The component drawing a field or a repeatable: its own, or the config's for its type */
  function fieldComponentFor(field: Record<string, any>): string | object {
    if (field.component && typeof field.component === 'object') {
      return field.component
    }
    const componentMap: Record<string, string> = {
      field: 'field',
      repeatable: 'repeatable',
      repeatable_table: 'repeatableTable',
      'repeatable-table': 'repeatableTable',
    }
    // Enforma's own, where the config names none
    const fallbacks: Record<string, object> = {
      field: EnformaField,
      repeatable: EnformaRepeatable,
      repeatableTable: EnformaRepeatableTable,
    }
    const component = componentMap[field.type || `field`] || field
    return (getConfig(`components.${component}`) ||
      fallbacks[component as string]) as string | object
  }

  /**
   * What a sub-section's component is given: its schema, but the component drawing it,
   * with its `props` spread over it (a card's `variant`)
   */
  function sectionBindings(section: Record<string, any>): Record<string, any> {
    const { component: _component, props: given, ...bindings } = section
    return { ...bindings, ...(given || {}) }
  }

  const schema = computed(() => {
    const entry = unref(injectedSchema)?.[toValue(name)]
    // The entry, with the props its component was given over it
    const merged: Record<string, any> = {
      ...(isSectionSchema(entry) ? entry : {}),
    }
    Object.entries(toValue(props)).forEach(
      ([key, value]) => value !== undefined && (merged[key] = value)
    )
    merged.name = toValue(name)

    // Apply section props transformers if defined in config
    const transformers = getConfig(
      'transformers.section_props',
      []
    ) as Function[]
    if (transformers.length === 0) return merged
    return applyTransformers(
      transformers,
      merged,
      formCtrl as FormController,
      formConfig
    )
  })

  const shown = computed(() => isShown(schema.value))

  const items = computed(() => {
    const sectionName = toValue(name)
    const entries = Object.entries(unref(injectedSchema) || {}).filter(
      ([key, entry]) =>
        entry &&
        key !== sectionName &&
        belongsTo(entry as { section?: string | null }, sectionName)
    )
    const withName = ([key, entry]: [string, any]) =>
      ({ ...entry, name: key } as Record<string, any> & {
        name: string
        position?: number
      })
    const fields = sortByPosition(
      entries.filter(([, entry]) => !isSectionSchema(entry)).map(withName)
    )
    const sections = sortByPosition(
      entries.filter(([, entry]) => isSectionSchema(entry)).map(withName)
    )

    return mergeByPosition(fields, sections)
      .filter(isShown)
      .map((entry): EnformaSectionItem => {
        const kind = kindOf(entry)
        if (kind === 'section') {
          return {
            kind,
            name: entry.name,
            schema: entry,
            component: sectionComponentFor(entry),
            props: sectionBindings(entry),
          }
        }
        const slot = parentSlots?.[`field(${entry.name})`]
        return {
          kind,
          name: entry.name,
          schema: entry,
          component: fieldComponentFor(entry),
          props: entry,
          ...(slot ? { slot } : {}),
        }
      })
  })

  return { schema, shown, items }
}
