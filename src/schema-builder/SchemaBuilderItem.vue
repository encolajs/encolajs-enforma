<template>
  <div class="schema-item-editor">
    <!-- Actions Row -->
    <div class="flex justify-end gap-2 mb-4">
      <Button
        icon="pi pi-copy"
        size="small"
        outlined
        @click="$emit('duplicate')"
        v-tooltip="'Duplicate'"
      />
      <Button
        icon="pi pi-trash"
        size="small"
        severity="danger"
        outlined
        @click="confirmDelete"
        v-tooltip="'Delete'"
      />
    </div>

    <!-- Field Editor -->
    <div v-if="localItem.type === 'field'" class="field-editor space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Name (key) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Field Name *
          </label>
          <InputText
            :value="itemKey"
            disabled
            class="w-full"
            placeholder="field_name"
          />
          <small class="text-gray-500">Field names cannot be changed</small>
        </div>

        <!-- Label -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Label
          </label>
          <InputText
            v-model="localItem.label"
            class="w-full"
            placeholder="Field Label"
            @input="emitUpdate"
          />
        </div>

        <!-- Input Component -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Input Component *
          </label>
          <Select
            v-model="localItem.inputComponent"
            :options="availableInputComponents"
            option-label="label"
            option-value="value"
            class="w-full"
            placeholder="Select component"
            @change="emitUpdate"
          />
        </div>

        <!-- Required -->
        <div class="flex items-center">
          <Checkbox
            v-model="localItem.required"
            :binary="true"
            input-id="required"
            @change="emitUpdate"
          />
          <label for="required" class="ml-2 text-sm font-medium text-gray-700">
            Required field
          </label>
        </div>

        <!-- Help Text -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Help Text
          </label>
          <InputText
            v-model="localItem.help"
            class="w-full"
            placeholder="Optional help text"
            @input="emitUpdate"
          />
        </div>

        <!-- Section -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Section
          </label>
          <Select
            v-model="localItem.section"
            :options="sections"
            option-label="label"
            option-value="value"
            class="w-full"
            placeholder="No section"
            show-clear
            @change="emitUpdate"
          />
        </div>
      </div>

      <!-- Input Props -->
      <div v-if="localItem.inputComponent">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Input Properties
        </label>
        <div class="space-y-2">
          <!-- Common props based on input type -->
          <div v-if="localItem.inputComponent === 'input'" class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label class="block text-xs text-gray-600 mb-1">Placeholder</label>
              <InputText
                :value="getInputProp('placeholder')"
                class="w-full"
                placeholder="Enter placeholder..."
                @input="updateInputProp('placeholder', $event.target.value)"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Max Length</label>
              <InputNumber
                :value="getInputProp('maxlength')"
                class="w-full"
                placeholder="100"
                @input="updateInputProp('maxlength', $event.value)"
              />
            </div>
          </div>

          <div v-else-if="localItem.inputComponent === 'textarea'" class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label class="block text-xs text-gray-600 mb-1">Placeholder</label>
              <InputText
                :value="getInputProp('placeholder')"
                class="w-full"
                placeholder="Enter placeholder..."
                @input="updateInputProp('placeholder', $event.target.value)"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Rows</label>
              <InputNumber
                :value="getInputProp('rows') || 3"
                class="w-full"
                :min="1"
                :max="20"
                @input="updateInputProp('rows', $event.value)"
              />
            </div>
          </div>

          <div v-else-if="localItem.inputComponent === 'select'">
            <label class="block text-xs text-gray-600 mb-1">Options (one per line)</label>
            <Textarea
              :value="getSelectOptionsText()"
              rows="4"
              class="w-full"
              placeholder="Option 1\nOption 2\nOption 3"
              @input="updateSelectOptions($event.target.value)"
            />
            <small class="text-gray-500">Enter each option on a new line</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Editor -->
    <div v-else-if="localItem.type === 'section'" class="section-editor space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <InputText
            v-model="localItem.title"
            class="w-full"
            placeholder="Section Title"
            @input="emitUpdate"
          />
        </div>

        <!-- Title Component -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Title Component
          </label>
          <Select
            v-model="localItem.titleComponent"
            :options="availableTitleComponents"
            option-label="label"
            option-value="value"
            class="w-full"
            placeholder="h2"
            @change="emitUpdate"
          />
        </div>
      </div>
    </div>

    <!-- Repeatable Editor -->
    <div v-else-if="localItem.type === 'repeatable' || localItem.type === 'repeatable-table'" class="repeatable-editor space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Min Items -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Min Items
          </label>
          <InputNumber
            v-model="localItem.min"
            class="w-full"
            :min="0"
            placeholder="0"
            @input="emitUpdate"
          />
        </div>

        <!-- Max Items -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Max Items
          </label>
          <InputNumber
            v-model="localItem.max"
            class="w-full"
            :min="1"
            placeholder="No limit"
            @input="emitUpdate"
          />
        </div>

        <!-- Allow Add -->
        <div class="flex items-center">
          <Checkbox
            v-model="localItem.allowAdd"
            :binary="true"
            input-id="allowAdd"
            @change="emitUpdate"
          />
          <label for="allowAdd" class="ml-2 text-sm font-medium text-gray-700">
            Allow Add
          </label>
        </div>

        <!-- Allow Remove -->
        <div class="flex items-center">
          <Checkbox
            v-model="localItem.allowRemove"
            :binary="true"
            input-id="allowRemove"
            @change="emitUpdate"
          />
          <label for="allowRemove" class="ml-2 text-sm font-medium text-gray-700">
            Allow Remove
          </label>
        </div>
      </div>

      <!-- Subfields -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <label class="block text-sm font-medium text-gray-700">
            Subfields
          </label>
          <Button
            icon="pi pi-plus"
            label="Add Subfield"
            size="small"
            @click="addSubfield"
          />
        </div>

        <div v-if="!localItem.subfields || Object.keys(localItem.subfields).length === 0" class="text-center py-4 text-gray-500 border-2 border-dashed border-gray-200 rounded">
          No subfields defined. Click "Add Subfield" to get started.
        </div>

        <div v-else class="space-y-3">
          <Card
            v-for="([subfieldKey, subfield], index) in Object.entries(localItem.subfields)"
            :key="subfieldKey"
            class="border"
          >
            <template #content>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Name</label>
                  <InputText
                    :value="subfieldKey"
                    disabled
                    class="w-full"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Label</label>
                  <InputText
                    v-model="subfield.label"
                    class="w-full"
                    placeholder="Label"
                    @input="emitUpdate"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Component</label>
                  <Select
                    v-model="subfield.inputComponent"
                    :options="availableInputComponents"
                    option-label="label"
                    option-value="value"
                    class="w-full"
                    @change="emitUpdate"
                  />
                </div>
                <div>
                  <Button
                    icon="pi pi-trash"
                    size="small"
                    severity="danger"
                    outlined
                    @click="removeSubfield(subfieldKey)"
                  />
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import type { BaseSchema, FieldSchema, SectionSchema, RepeatableSchema } from '../types'

// PrimeVue Components
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
//import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import Card from 'primevue/card'

// Props
interface SchemaBuilderItemProps {
  itemKey: string
  item: BaseSchema
  sections: Array<{ label: string; value: string }>
  availableInputComponents: Array<{ label: string; value: string }>
  availableTitleComponents: Array<{ label: string; value: string }>
}

const props = defineProps<SchemaBuilderItemProps>()

// Emits
interface SchemaBuilderItemEmits {
  update: [item: BaseSchema]
  remove: []
  duplicate: []
}

const emit = defineEmits<SchemaBuilderItemEmits>()

// Local reactive copy of the item
const localItem = reactive({ ...props.item })

// Watch for external changes
watch(() => props.item, (newItem) => {
  Object.assign(localItem, newItem)
}, { deep: true })

// Methods
const emitUpdate = () => {
  emit('update', { ...localItem })
}

const confirmDelete = () => {
  // Use native confirm as fallback if PrimeVue confirm service is not available
  if (window.confirm('Are you sure you want to delete this item?')) {
    emit('remove')
  }
}

// Input props helpers for field type
const getInputProp = (key: string) => {
  if (!localItem.inputProps) return ''
  return localItem.inputProps[key] || ''
}

const updateInputProp = (key: string, value: any) => {
  if (!localItem.inputProps) {
    localItem.inputProps = {}
  }
  if (value === '' || value === null || value === undefined) {
    delete localItem.inputProps[key]
  } else {
    localItem.inputProps[key] = value
  }
  emitUpdate()
}

const getSelectOptionsText = () => {
  const options = getInputProp('options')
  if (Array.isArray(options)) {
    return options.join('\n')
  }
  return ''
}

const updateSelectOptions = (text: string) => {
  const options = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
  
  updateInputProp('options', options.length > 0 ? options : null)
}

// Subfield helpers for repeatable types
const addSubfield = () => {
  if (!localItem.subfields) {
    localItem.subfields = {}
  }
  
  const subfieldName = `subfield_${Date.now()}`
  localItem.subfields[subfieldName] = {
    type: 'field',
    label: 'New Subfield',
    inputComponent: 'input'
  }
  
  emitUpdate()
}

const removeSubfield = (subfieldKey: string) => {
  if (localItem.subfields && localItem.subfields[subfieldKey]) {
    delete localItem.subfields[subfieldKey]
    emitUpdate()
  }
}

// Initialize defaults
onMounted(() => {
  // Set defaults for different types
  if (localItem.type === 'field') {
    if (!localItem.inputComponent) {
      localItem.inputComponent = 'input'
      emitUpdate()
    }
  } else if (localItem.type === 'section') {
    if (!localItem.titleComponent) {
      localItem.titleComponent = 'h2'
      emitUpdate()
    }
  } else if (localItem.type === 'repeatable' || localItem.type === 'repeatable-table') {
    if (localItem.allowAdd === undefined) {
      localItem.allowAdd = true
      emitUpdate()
    }
    if (localItem.allowRemove === undefined) {
      localItem.allowRemove = true
      emitUpdate()
    }
  }
})
</script>

<style scoped>
.schema-item-editor {
  /* Add any specific styling here */
}
</style>