import { ref, computed, watch, Ref } from 'vue'
import type { FormSchema, FieldSchema, SectionSchema, RepeatableSchema, RepeatableTableSchema, BaseSchema } from '../../types'

export type SchemaBuilderMode = 'visual' | 'json'

export interface SchemaBuilderState {
  schema: Record<string, BaseSchema>
  currentMode: SchemaBuilderMode
  jsonText: string
  selectedItem: string | null
  expandedItems: Set<string>
  validationErrors: string[]
  isDirty: boolean
}

export interface UseSchemaBuilderOptions {
  initialSchema?: FormSchema
  initialMode?: SchemaBuilderMode
}

export function useSchemaBuilder(options: UseSchemaBuilderOptions = {}) {
  const state = ref<SchemaBuilderState>({
    schema: options.initialSchema || {},
    currentMode: options.initialMode || 'visual',
    jsonText: '',
    selectedItem: null,
    expandedItems: new Set(),
    validationErrors: [],
    isDirty: false
  })

  // Sync JSON text with schema
  const syncJsonFromSchema = () => {
    try {
      state.value.jsonText = JSON.stringify(state.value.schema, null, 2)
      state.value.validationErrors = []
    } catch (error) {
      state.value.validationErrors = ['Failed to serialize schema to JSON']
    }
  }

  // Sync schema from JSON text
  const syncSchemaFromJson = () => {
    try {
      const parsed = JSON.parse(state.value.jsonText)
      if (typeof parsed === 'object' && parsed !== null) {
        state.value.schema = parsed
        state.value.validationErrors = []
        return true
      } else {
        state.value.validationErrors = ['Schema must be a valid JSON object']
        return false
      }
    } catch (error) {
      state.value.validationErrors = [`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`]
      return false
    }
  }

  // Initialize JSON text from schema
  if (Object.keys(state.value.schema).length > 0) {
    syncJsonFromSchema()
  } else {
    state.value.jsonText = '{}'
  }

  // Available input components for 90% use cases
  const availableInputComponents = [
    { label: 'Text Input', value: 'input' },
    { label: 'Textarea', value: 'textarea' },
    { label: 'Select', value: 'select' },
    { label: 'Checkbox', value: 'checkbox' },
    { label: 'Radio Button', value: 'radio' },
    { label: 'Number Input', value: 'number' },
    { label: 'Date Input', value: 'date' },
    { label: 'Email Input', value: 'email' },
    { label: 'Password Input', value: 'password' }
  ]

  const availableTitleComponents = [
    { label: 'Heading 2', value: 'h2' },
    { label: 'Heading 3', value: 'h3' },
    { label: 'Heading 4', value: 'h4' },
    { label: 'Div', value: 'div' }
  ]

  // Computed properties
  const schemaAsJson = computed(() => state.value.jsonText)
  const sections = computed(() => {
    return Object.entries(state.value.schema)
      .filter(([, item]) => item.type === 'section')
      .map(([key, item]) => ({ label: (item as SectionSchema).title, value: key }))
  })

  const schemaItems = computed(() => {
    return Object.entries(state.value.schema).map(([key, item]) => ({ key, ...item }))
  })

  // Methods
  const setMode = (mode: SchemaBuilderMode) => {
    if (mode === 'json' && state.value.currentMode === 'visual') {
      syncJsonFromSchema()
    } else if (mode === 'visual' && state.value.currentMode === 'json') {
      syncSchemaFromJson()
    }
    state.value.currentMode = mode
  }

  const updateJsonText = (text: string) => {
    state.value.jsonText = text
    state.value.isDirty = true
  }

  const applyJsonChanges = () => {
    if (syncSchemaFromJson()) {
      state.value.isDirty = false
      return true
    }
    return false
  }

  const addField = (name?: string) => {
    const fieldName = name || `field_${Date.now()}`
    const newField: FieldSchema = {
      type: 'field',
      label: fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/_/g, ' '),
      inputComponent: 'input',
      required: false
    }
    state.value.schema[fieldName] = newField
    state.value.selectedItem = fieldName
    state.value.expandedItems.add(fieldName)
    state.value.isDirty = true
    syncJsonFromSchema()
  }

  const addSection = (name?: string) => {
    const sectionName = name || `section_${Date.now()}`
    const newSection: SectionSchema = {
      type: 'section',
      title: sectionName.charAt(0).toUpperCase() + sectionName.slice(1).replace(/_/g, ' '),
      titleComponent: 'h2'
    }
    state.value.schema[sectionName] = newSection
    state.value.selectedItem = sectionName
    state.value.expandedItems.add(sectionName)
    state.value.isDirty = true
    syncJsonFromSchema()
  }

  const addRepeatable = (name?: string, isTable = false) => {
    const repeatableName = name || `repeatable_${Date.now()}`
    const newRepeatable: RepeatableSchema | RepeatableTableSchema = {
      type: isTable ? 'repeatable-table' : 'repeatable',
      allowAdd: true,
      allowRemove: true,
      subfields: {
        name: {
          type: 'field',
          label: 'Name',
          inputComponent: 'input'
        }
      }
    }
    state.value.schema[repeatableName] = newRepeatable
    state.value.selectedItem = repeatableName
    state.value.expandedItems.add(repeatableName)
    state.value.isDirty = true
    syncJsonFromSchema()
  }

  const updateSchemaItem = (key: string, updatedItem: BaseSchema) => {
    state.value.schema[key] = updatedItem
    state.value.isDirty = true
    syncJsonFromSchema()
  }

  const removeSchemaItem = (key: string) => {
    delete state.value.schema[key]
    if (state.value.selectedItem === key) {
      state.value.selectedItem = null
    }
    state.value.expandedItems.delete(key)
    state.value.isDirty = true
    syncJsonFromSchema()
  }

  const duplicateSchemaItem = (key: string) => {
    const originalItem = state.value.schema[key]
    if (originalItem) {
      const newKey = `${key}_copy_${Date.now()}`
      const newItem = JSON.parse(JSON.stringify(originalItem))
      if (newItem.type === 'section') {
        newItem.title += ' (Copy)'
      } else if (newItem.type === 'field') {
        newItem.label += ' (Copy)'
      }
      state.value.schema[newKey] = newItem
      state.value.selectedItem = newKey
      state.value.expandedItems.add(newKey)
      state.value.isDirty = true
      syncJsonFromSchema()
    }
  }

  const toggleExpanded = (key: string) => {
    if (state.value.expandedItems.has(key)) {
      state.value.expandedItems.delete(key)
    } else {
      state.value.expandedItems.add(key)
    }
  }

  const selectItem = (key: string) => {
    state.value.selectedItem = key
    state.value.expandedItems.add(key)
  }

  // Import/Export functions
  const exportToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(state.value.jsonText)
      return true
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      return false
    }
  }

  const importFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      state.value.jsonText = text
      return syncSchemaFromJson()
    } catch (error) {
      console.error('Failed to read from clipboard:', error)
      return false
    }
  }

  const formatJson = () => {
    try {
      const parsed = JSON.parse(state.value.jsonText)
      state.value.jsonText = JSON.stringify(parsed, null, 2)
      state.value.validationErrors = []
    } catch (error) {
      state.value.validationErrors = [`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`]
    }
  }

  const validateSchema = () => {
    const errors: string[] = []
    
    Object.entries(state.value.schema).forEach(([key, item]) => {
      if (!item.type) {
        errors.push(`Item '${key}': Missing required 'type' property`)
      }
      
      if (item.type === 'section' && !(item as SectionSchema).title) {
        errors.push(`Section '${key}': Missing required 'title' property`)
      }
      
      if (item.type === 'field' && !key) {
        errors.push(`Field: Missing name/key`)
      }
    })
    
    state.value.validationErrors = errors
    return errors.length === 0
  }

  return {
    state: state as Readonly<Ref<SchemaBuilderState>>,
    
    // Computed
    schemaAsJson,
    sections,
    schemaItems,
    availableInputComponents,
    availableTitleComponents,
    
    // Methods
    setMode,
    updateJsonText,
    applyJsonChanges,
    addField,
    addSection,
    addRepeatable,
    updateSchemaItem,
    removeSchemaItem,
    duplicateSchemaItem,
    toggleExpanded,
    selectItem,
    exportToClipboard,
    importFromClipboard,
    formatJson,
    validateSchema,
    
    // Sync methods
    syncJsonFromSchema,
    syncSchemaFromJson
  }
}