<template>
  <div v-bind="mergeProps($attrs, getPassThroughProps('pt.section'))">
    <component
      :is="sectionSchema.titleComponent"
      v-if="sectionSchema?.title"
      v-bind="sectionSchema.titleProps"
    >
      {{ sectionSchema.title }}
    </component>

    <template v-for="item in sortedItems" :key="item.name">
      <template v-if="isSectionSchema(item)">
        <component
          :is="sectionComponent"
          v-bind="item"
          v-if="shouldRenderSection(item)"
        />
      </template>
      <template v-else-if="shouldRenderField(item)">
        <!-- Use parentSlots directly -->
        <component
          :is="parentSlots?.[`field(${item.name})`]"
          v-if="hasFieldSlot(item.name)"
          :field="item"
          :formController="formCtrl"
          :config="formConfig"
        />
        <component :is="getComponent(item)" v-else v-bind="item" />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, mergeProps, unref, type Ref } from 'vue'
import {
  formSchemaKey,
  formControllerKey,
  formFieldSlotsKey,
  formContextKey,
} from '@/constants/symbols'
import { FieldSchema, SectionSchema, FormSchema, FormController } from '@/types'
import { useFormConfig } from '@/utils/useFormConfig'
import applyTransformers from '@/utils/applyTransformers'
import { evaluateCondition } from '@/utils/evaluateCondition'
import EnformaField from './EnformaField.vue'
import EnformaRepeatable from './EnformaRepeatable.vue'
import EnformaRepeatableTable from './EnformaRepeatableTable.vue'

interface FieldWithPosition extends FieldSchema {
  position?: number
  name: string
}

interface SectionWithPosition extends SectionSchema {
  position?: number
  name: string
}

function isSectionSchema(value: any): value is SectionSchema {
  return value && typeof value === 'object' && value?.type === 'section'
}

function getFields(
  schema: FormSchema | undefined,
  sectionName: string
): Record<string, FieldSchema> {
  if (!schema) return {}

  const entries = Object.entries(schema)
    .filter(([_, field]) => {
      if (!field) return false
      if (isSectionSchema(field)) return false

      // For default section, include fields without a section
      if (sectionName === 'default') {
        return !('section' in field) || field.section === sectionName
      }
      // For other sections, only include fields that belong to this section
      return field.section === sectionName
    })
    .map(([key, field]) => [key, field as FieldSchema])

  return Object.fromEntries(entries)
}

function getSubSections(
  schema: FormSchema | undefined,
  sectionName: string
): Array<[string, SectionSchema]> {
  if (!schema) return []

  // Find all sections that belong to this section
  return Object.entries(schema).filter(([_, field]) => {
    if (!field) return false
    if (!isSectionSchema(field)) return false

    // For default section, include fields without a section
    if (sectionName === 'default') {
      return !('section' in field) || field.section === sectionName
    }
    // For other sections, only include fields that belong to this section
    return field.section === sectionName
  }) as Array<[string, SectionSchema]>
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

// this is needed because the component may render in a tree-like structure
defineOptions({ name: 'EnformaSection' })

const props = defineProps<{
  name: string
  title?: string
  titleComponent?: string | object
  titleProps?: object | null
  section?: string | null
  position?: number | null
}>()

// Helper function to determine if a field should be rendered based on its 'if' property
function shouldRenderField(field: FieldSchema & { name: string }): boolean {
  // If no 'if' property, always render
  if (field['if'] === undefined) return true
  if (typeof field['if'] !== 'string') return field['if']

  return evaluateCondition(
    field['if'],
    formCtrl,
    unref(formContext),
    formConfig
  )
}

// Helper function to determine if a section should be rendered based on its 'if' property
function shouldRenderSection(
  section: SectionSchema & { name: string }
): boolean {
  // If no 'if' property, always render
  if (section['if'] === undefined) return true
  if (typeof section['if'] !== 'string') return section['if']

  return evaluateCondition(
    section['if'],
    formCtrl,
    unref(formContext),
    formConfig
  )
}

// Inject dependencies. The schema and the context may be refs (Enforma provides computeds),
// read where they're used, so a changed schema re-renders the section.
const injectedSchema = inject<FormSchema | Ref<FormSchema>>(formSchemaKey, {})
const formCtrl = inject<FormController>(formControllerKey)
const formContext = inject<any>(formContextKey, null)

// Get the configuration
const { getConfig, getPassThroughProps, formConfig } = useFormConfig()

// this is needed because the component may render in a tree-like structure
const sectionComponent = getConfig('components.section') || 'EnformaSection'

// Access parent slots injected from Enforma
const parentSlots = inject(formFieldSlotsKey, null)

// Check if a specific field slot exists
function hasFieldSlot(fieldName: string): boolean {
  if (!parentSlots) return false
  const slotName = `field(${fieldName})`
  return slotName in parentSlots
}

// Get the section schema for this section
const originalSectionSchema = computed(() => {
  const schema = unref(injectedSchema)
  if (!schema) return null
  const item = schema[props.name]
  if (isSectionSchema(item)) {
    return item
  }
  return null
})

// Apply section props transformers
const sectionSchema = computed(() => {
  // Create a copy with name property for the transformer to use
  const mergedProps: Record<string, any> = {
    ...(originalSectionSchema.value || {}),
  }
  Object.entries(props).forEach(
    ([k, v]) => v !== undefined && (mergedProps[k] = v)
  )

  // Apply section props transformers if defined in config
  const sectionPropsTransformers = getConfig(
    'transformers.section_props',
    []
  ) as Function[]

  if (sectionPropsTransformers.length === 0) {
    return mergedProps
  }

  return applyTransformers(
    sectionPropsTransformers,
    mergedProps,
    formCtrl,
    formConfig
  )
})

function getComponent(field: any): string | object {
  if (field.component && typeof field.component === 'object') {
    return field.component
  }
  const componentMap: Record<string, string> = {
    field: 'field',
    repeatable: 'repeatable',
    repeatable_table: 'repeatableTable',
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

// Get fields for this section and sort them by position
const sortedFields = computed(() => {
  const fields = Object.entries(
    getFields(unref(injectedSchema), props.name)
  ).map(([name, field]) => {
    const fieldWithPosition: FieldWithPosition = {
      ...field,
      name,
    }
    return fieldWithPosition
  })

  return sortByPosition(fields)
})

// Get nested sections and sort them by position
const sortedSubsections = computed(() => {
  const sections = getSubSections(unref(injectedSchema), props.name).map(
    ([name, section]) => ({ ...section, name } as SectionWithPosition)
  )
  return sortByPosition(sections)
})

// Fields and nested sections, in the order they are rendered
const sortedItems = computed(() =>
  mergeByPosition(sortedFields.value, sortedSubsections.value)
)
</script>
