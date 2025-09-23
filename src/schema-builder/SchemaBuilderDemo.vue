<template>
  <div class="demo-container p-6">
    <h1 class="text-2xl font-bold mb-6">Schema Builder Demo</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Schema Builder -->
      <div class="schema-builder-panel">
        <div class="mb-4">
          <h2 class="text-lg font-semibold mb-2">Schema Builder</h2>
          <p class="text-sm text-gray-600">
            Create your form schema using the visual editor or JSON mode
          </p>
        </div>

        <SchemaBuilder
          v-model="schema"
          :preview-data="sampleData"
          :show-debug="showDebug"
          @update:modelValue="onSchemaUpdate"
        />
      </div>

      <!-- Live Form Preview -->
      <div class="form-preview-panel">
        <div class="mb-4">
          <h2 class="text-lg font-semibold mb-2">Live Form Preview</h2>
          <p class="text-sm text-gray-600">
            See how your schema renders as an actual form
          </p>
        </div>

        <div
          v-if="Object.keys(schema).length === 0"
          class="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg"
        >
          <div class="text-lg mb-2">No schema defined</div>
          <div class="text-sm">
            Create some fields in the schema builder to see the form preview
          </div>
        </div>

        <div v-else class="bg-white p-4 border border-gray-200 rounded-lg">
          <Enforma
            :schema="schema"
            :data="formData"
            @update:data="formData = $event"
          />

          <!-- Form Data Output -->
          <div class="mt-6 pt-4 border-t border-gray-200">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Form Data:</h3>
            <pre
              class="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32"
              >{{ JSON.stringify(formData, null, 2) }}</pre
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="mt-6 p-4 bg-gray-50 rounded-lg">
      <div class="flex flex-wrap items-center gap-4">
        <Button @click="loadSampleSchema" outlined> Load Sample Schema </Button>
        <Button @click="clearSchema" severity="secondary" outlined>
          Clear Schema
        </Button>
        <Button @click="showDebug = !showDebug" outlined>
          {{ showDebug ? 'Hide' : 'Show' }} Debug
        </Button>
        <div class="flex items-center gap-2">
          <Checkbox v-model="autoUpdate" :binary="true" input-id="autoUpdate" />
          <label for="autoUpdate" class="text-sm">Auto-update form data</label>
        </div>
      </div>
    </div>

    <!-- Sample Data Editor -->
    <div v-if="showDebug" class="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 class="text-sm font-medium text-gray-700 mb-2">
        Sample Data (for preview):
      </h3>
      <Textarea
        v-model="sampleDataText"
        rows="4"
        class="w-full font-mono text-xs"
        @input="updateSampleData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { SchemaBuilder } from './index'
import Enforma from '../core/Enforma.vue'
import type { FormSchema } from '../types'

// PrimeVue Components
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Textarea from 'primevue/textarea'

// State
const schema = ref<FormSchema>({})
const formData = ref<Record<string, any>>({})
const sampleData = ref<Record<string, any>>({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  country: 'US',
})
const sampleDataText = ref(JSON.stringify(sampleData.value, null, 2))
const showDebug = ref(false)
const autoUpdate = ref(true)

// Sample schema for testing
const sampleSchema: FormSchema = {
  personal_info: {
    type: 'section',
    title: 'Personal Information',
  },
  name: {
    type: 'field',
    section: 'personal_info',
    label: 'Full Name',
    inputComponent: 'input',
    required: true,
    help: 'Enter your full name',
    inputProps: {
      placeholder: 'e.g. John Doe',
    },
  },
  email: {
    type: 'field',
    section: 'personal_info',
    label: 'Email Address',
    inputComponent: 'email',
    required: true,
    inputProps: {
      placeholder: 'john@example.com',
    },
  },
  age: {
    type: 'field',
    section: 'personal_info',
    label: 'Age',
    inputComponent: 'number',
    inputProps: {
      min: 18,
      max: 100,
    },
  },
  country: {
    type: 'field',
    section: 'personal_info',
    label: 'Country',
    inputComponent: 'select',
    inputProps: {
      options: ['US', 'Canada', 'UK', 'Germany', 'France', 'Other'],
    },
  },
  contact_info: {
    type: 'section',
    title: 'Contact Information',
  },
  bio: {
    type: 'field',
    section: 'contact_info',
    label: 'Biography',
    inputComponent: 'textarea',
    help: 'Tell us about yourself',
    inputProps: {
      rows: 4,
      placeholder: 'Write a short bio...',
    },
  },
  skills: {
    type: 'repeatable',
    section: 'contact_info',
    allowAdd: true,
    allowRemove: true,
    min: 1,
    max: 5,
    subfields: {
      skill_name: {
        type: 'field',
        label: 'Skill',
        inputComponent: 'input',
      },
      level: {
        type: 'field',
        label: 'Level',
        inputComponent: 'select',
        inputProps: {
          options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        },
      },
    },
  },
}

// Methods
const onSchemaUpdate = (newSchema: FormSchema) => {
  console.log('Schema updated:', newSchema)

  // Auto-initialize form data for new fields
  if (autoUpdate.value) {
    const newFormData = { ...formData.value }

    Object.entries(newSchema).forEach(([key, item]) => {
      if (item.type === 'field' && !(key in newFormData)) {
        // Initialize with sample data if available
        if (key in sampleData.value) {
          newFormData[key] = sampleData.value[key]
        } else {
          // Set default values based on input type
          const inputComponent = item.inputComponent
          if (inputComponent === 'checkbox') {
            newFormData[key] = false
          } else if (inputComponent === 'number') {
            newFormData[key] = 0
          } else {
            newFormData[key] = ''
          }
        }
      }
    })

    formData.value = newFormData
  }
}

const loadSampleSchema = () => {
  schema.value = { ...sampleSchema }
}

const clearSchema = () => {
  schema.value = {}
  formData.value = {}
}

const updateSampleData = () => {
  try {
    const parsed = JSON.parse(sampleDataText.value)
    sampleData.value = parsed
  } catch (error) {
    console.error('Invalid sample data JSON:', error)
  }
}

// Watch for sample data changes
watch(
  sampleData,
  (newData) => {
    sampleDataText.value = JSON.stringify(newData, null, 2)
  },
  { deep: true }
)

// Initialize with a basic field for demonstration
onMounted(() => {
  // Start with an empty schema - user can load sample or create their own
})
</script>

<style scoped>
.demo-container {
  max-width: 100%;
  min-height: 100vh;
  background-color: #f9fafb;
}

.schema-builder-panel,
.form-preview-panel {
  background-color: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
}

.form-preview-panel pre {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>
