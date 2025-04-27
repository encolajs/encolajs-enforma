<template>
  <div v-bind="mergeProps($attrs, getConfig('pt.section'))">
    <component
      v-if="sectionSchema?.title"
      :is="sectionSchema.titleComponent"
      v-bind="sectionSchema.titleProps"
    >
      {{ sectionSchema.title }}
    </component>

    <template v-for="field in sortedFields" :key="field.name">
      <component
        :is="fieldComponent"
        v-bind="field"
        v-if="shouldRenderField(field)"
      />
    </template>

    <template v-for="subSection in sortedSubsections" :key="subSection.name">
      <component
        :is="sectionComponent"
        :name="subSection.name"
        v-if="shouldRenderSection(subSection)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  inject,
  resolveComponent,
  mergeProps,
  ComputedRef,
} from 'vue'
import { formSchemaKey, formControllerKey } from '@/constants/symbols'
import { FieldSchema, SectionSchema, FormSchema, FormController } from '@/types'
import { useFormConfig } from '@/utils/useFormConfig'
import applyTransformers from '@/utils/applyTransformers'

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

// this is needed because the component may render in a tree-like structure
defineOptions({ name: 'EnformaSection' })

const props = defineProps<{
  name: string
}>()

// Helper function to determine if a field should be rendered based on its 'if' property
function shouldRenderField(field: FieldSchema & { name: string }): boolean {
  // If no 'if' property, always render
  if (field['if'] === undefined) return true

  // If 'if' is a boolean, use it directly
  if (typeof field['if'] === 'boolean') return field['if']

  // If 'if' is a string in a schema it will be converted to a computed ref
  // via the dynamic props
  // @ts-expect-error at this point the field.if is an evaluted dynamic prop
  return (field['if'] as ComputedRef<boolean>).value
}

// Helper function to determine if a section should be rendered based on its 'if' property
function shouldRenderSection(
  section: SectionSchema & { name: string }
): boolean {
  // If no 'if' property, always render
  if (section['if'] === undefined) return true

  // If 'if' is a boolean, use it directly
  if (typeof section['if'] === 'boolean') return section.if

  // If 'if' is a string in a schema it will be converted to a computed ref
  // via the dynamic props
  // @ts-expect-error at this point the field.if is an evaluted dynamic prop
  return (section['if'] as ComputedRef<boolean>).value
}

// Inject dependencies
const schema = inject<FormSchema>(formSchemaKey)
const formState = inject<FormController>(formControllerKey)

// Get the configuration
const { getConfig, formConfig } = useFormConfig()

const fieldComponent = getConfig('components.field')
// this is needed because the component may render in a tree-like structure
const sectionComponent = resolveComponent('EnformaSection')

// Get the section schema for this section
const originalSectionSchema = computed(() => {
  if (!schema) return null
  const item = schema[props.name]
  if (isSectionSchema(item)) {
    return item
  }
  return null
})

// Apply section props transformers
const sectionSchema = computed(() => {
  if (!originalSectionSchema.value) return null

  // Apply section props transformers if defined in config
  const sectionPropsTransformers = getConfig(
    'transformers.section_props',
    []
  ) as Function[]

  if (sectionPropsTransformers.length === 0) {
    return originalSectionSchema.value
  }

  // Create a copy with name property for the transformer to use
  const sectionWithName = {
    ...originalSectionSchema.value,
    name: props.name,
  }

  return applyTransformers(
    sectionPropsTransformers,
    sectionWithName,
    formState,
    formConfig
  )
})

// Get fields for this section and sort them by position
const sortedFields = computed(() => {
  const fields = Object.entries(getFields(schema, props.name)).map(
    ([name, field]) => {
      const fieldWithPosition: FieldWithPosition = {
        ...field,
        name,
      }
      return fieldWithPosition
    }
  )
  return sortByPosition(fields)
})

// Get nested sections and sort them by position
const sortedSubsections = computed(() => {
  const sections = getSubSections(schema, props.name).map(
    ([name, section]) => ({ ...section, name } as SectionWithPosition)
  )
  return sortByPosition(sections)
})
</script>
