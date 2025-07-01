<template>
  <div class="schema-builder p-4">
    <!-- Header with Mode Toggle and Actions -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
          <Button
            :severity="state.currentMode !== 'json' ? '' : 'secondary'"
            size="small"
            @click="setMode('visual')"
          >
            Visual
          </Button>
          <Button
            :severity="state.currentMode === 'json' ? '' : 'secondary'"
            size="small"
            @click="setMode('json')"
          >
            JSON
          </Button>
        </div>

      <div class="flex items-center gap-2">
        <Button
          icon="pi pi-download"
          size="small"
          outlined
          @click="handleExport"
          v-tooltip="'Copy to clipboard'"
        />
        <Button
          icon="pi pi-upload"
          size="small"
          outlined
          @click="handleImport"
          v-tooltip="'Import from clipboard'"
        />
        <Button
          v-if="state.currentMode === 'json'"
          icon="pi pi-code"
          size="small"
          outlined
          @click="formatJson"
          v-tooltip="'Format JSON'"
        />
      </div>
    </div>

    <!-- Validation Errors -->
    <div v-if="state.validationErrors.length > 0" class="mb-4">
      <Message
        v-for="(error, index) in state.validationErrors"
        :key="index"
        severity="error"
        :closable="false"
        class="mb-2"
      >
        {{ error }}
      </Message>
    </div>

    <!-- Visual Mode -->
    <div v-if="state.currentMode === 'visual'" class="visual-mode">
      <!-- Toolbar for adding components -->
      <div class="mb-4">
        <Toolbar>
          <template #start>
            <div class="flex gap-2">
              <Button
                label="Field"
                size="small"
                outlined
                @click="addField"
              />
              <Button
                label="Section"
                size="small"
                outlined
                @click="addSection"
              />
              <Button
                label="Repeatable"
                size="small"
                outlined
                @click="() => addRepeatable(undefined, false)"
              />
              <Button
                label="Table"
                size="small"
                outlined
                @click="() => addRepeatable(undefined, true)"
              />
            </div>
          </template>
        </Toolbar>
      </div>

      <!-- Schema Items -->
      <div v-if="Object.keys(state.schema).length === 0" class="text-center py-8 text-gray-500">
        <div class="text-lg mb-2">No schema items yet</div>
        <div class="text-sm">Click "Add Field" or "Add Section" to get started</div>
      </div>

      <Accordion v-else :activeIndex="Array.from(state.expandedItems)" :multiple="true" class="w-full">
        <AccordionTab
          v-for="([key, item], index) in Object.entries(state.schema)"
          :key="key"
          :header="getItemHeader(key, item)"
          @tab-open="() => state.expandedItems.add(key)"
          @tab-close="() => state.expandedItems.delete(key)"
        >
          <SchemaBuilderItem
            :item-key="key"
            :item="item"
            :sections="sections"
            :available-input-components="availableInputComponents"
            :available-title-components="availableTitleComponents"
            @update="(updatedItem) => updateSchemaItem(key, updatedItem)"
            @remove="() => removeSchemaItem(key)"
            @duplicate="() => duplicateSchemaItem(key)"
          />
        </AccordionTab>
      </Accordion>
    </div>

    <!-- JSON Mode -->
    <div v-else class="json-mode">
      <div class="mb-3">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Schema JSON
        </label>
        <Textarea
          v-model="jsonTextLocal"
          rows="20"
          class="w-full font-mono text-sm"
          :class="{ 'border-red-500': state.validationErrors.length > 0 }"
          placeholder="Enter your schema JSON here..."
          @input="handleJsonInput"
        />
      </div>
      
      <div class="flex gap-2">
        <Button
          :disabled="!state.isDirty"
          @click="applyJsonChanges"
        >
          Apply Changes
        </Button>
        <Button
          outlined
          @click="resetJson"
        >
          Reset
        </Button>
      </div>
    </div>

    <!-- Schema Output (for debugging) -->
    <div v-if="showDebug" class="mt-6 p-4 bg-gray-100 rounded">
      <h4 class="font-medium mb-2">Current Schema (Debug)</h4>
      <pre class="text-xs bg-white p-2 rounded overflow-auto max-h-40">{{ JSON.stringify(state.schema, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useSchemaBuilder } from './composables/useSchemaBuilder'
import SchemaBuilderItem from './SchemaBuilderItem.vue'
import type { FormSchema } from '../types'

// PrimeVue Components
import Button from 'primevue/button'
import Toolbar from 'primevue/toolbar'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'

// Props
interface SchemaBuilderProps {
  modelValue?: FormSchema
  mode?: 'visual' | 'json'
  previewData?: Record<string, any>
  availableComponents?: string[]
  showDebug?: boolean
}

const props = withDefaults(defineProps<SchemaBuilderProps>(), {
  modelValue: () => ({}),
  mode: 'visual',
  showDebug: false
})

// Emits
interface SchemaBuilderEmits {
  'update:modelValue': [schema: FormSchema]
  'update:mode': [mode: 'visual' | 'json']
}

const emit = defineEmits<SchemaBuilderEmits>()

// Composable
const {
  state,
  schemaAsJson,
  sections,
  availableInputComponents,
  availableTitleComponents,
  setMode,
  updateJsonText,
  applyJsonChanges,
  addField,
  addSection,
  addRepeatable,
  updateSchemaItem,
  removeSchemaItem,
  duplicateSchemaItem,
  exportToClipboard,
  importFromClipboard,
  formatJson,
  syncJsonFromSchema
} = useSchemaBuilder({
  initialSchema: props.modelValue,
  initialMode: props.mode
})

// Local state for JSON textarea
const jsonTextLocal = ref(schemaAsJson.value)

// Sync local JSON text with composable
watch(schemaAsJson, (newValue) => {
  jsonTextLocal.value = newValue
})

// Watch for external schema changes
watch(() => props.modelValue, (newSchema) => {
  if (JSON.stringify(newSchema) !== JSON.stringify(state.value.schema)) {
    state.value.schema = { ...newSchema }
    syncJsonFromSchema()
  }
}, { deep: true })

// Emit schema changes
watch(() => state.value.schema, (newSchema) => {
  emit('update:modelValue', { ...newSchema })
}, { deep: true })

// Emit mode changes
watch(() => state.value.currentMode, (newMode) => {
  emit('update:mode', newMode)
})

// Methods
const handleJsonInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  updateJsonText(target.value)
}

const resetJson = () => {
  syncJsonFromSchema()
  jsonTextLocal.value = schemaAsJson.value
}

const handleExport = async () => {
  const success = await exportToClipboard()
  // TODO: Show toast notification
  console.log(success ? 'Copied to clipboard' : 'Failed to copy')
}

const handleImport = async () => {
  const success = await importFromClipboard()
  if (success) {
    jsonTextLocal.value = schemaAsJson.value
  }
  // TODO: Show toast notification
  console.log(success ? 'Imported from clipboard' : 'Failed to import')
}

const getItemHeader = (key: string, item: any) => {
  const type = item.type.charAt(0).toUpperCase() + item.type.slice(1)
  let title = key
  
  if (item.type === 'section' && item.title) {
    title = item.title
  } else if (item.type === 'field' && item.label) {
    title = item.label
  }
  
  return `${type}: ${title}`
}

// Initialize
onMounted(() => {
  if (Object.keys(state.value.schema).length > 0) {
    syncJsonFromSchema()
  }
})
</script>

<style scoped>
.schema-builder {
  max-width: 100%;
}

.visual-mode .p-accordion-tab-content {
  padding: 1rem;
}

.json-mode textarea {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>