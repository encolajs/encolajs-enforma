<template>
  <div class="app">
    <header class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        Enforma Schema Builder
      </h1>
      <p class="text-gray-600">
        Visual schema builder for creating Enforma forms with real-time preview
      </p>
    </header>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-full">
      <!-- Schema Builder Panel -->
      <div class="schema-builder-panel">
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Schema Builder</h2>
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <span>{{ Object.keys(schema).length }} items</span>
            </div>
          </div>
          
          <SchemaBuilder 
            v-model="schema" 
            :preview-data="sampleData"
            @update:modelValue="onSchemaUpdate"
          />
        </div>
      </div>
      
      <!-- Live Form Preview Panel -->
      <div class="form-preview-panel col-span-2">
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Live Preview</h2>
            <div class="flex items-center gap-2">
              <Button 
                size="small" 
                outlined 
                @click="resetFormData"
                label="Reset Data"
              />
            </div>
          </div>
          
          <div v-if="Object.keys(schema).length === 0" class="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <div class="text-lg mb-2">No form to preview</div>
            <div class="text-sm">Create some fields in the schema builder to see the form preview</div>
          </div>
          
          <div v-else>
            <Enforma 
              :schema="schema" 
              :data="formData" 
              @update:data="formData = $event"
            />
            
            <!-- Form Data Display -->
            <div class="mt-6 pt-4 border-t border-gray-200">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-medium text-gray-700">Form Data:</h3>
                <Button 
                  size="small" 
                  text 
                  @click="showFormData = !showFormData"
                  :label="showFormData ? 'Hide' : 'Show'"
                />
              </div>
              <pre 
                v-if="showFormData"
                class="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-40 text-left"
              >{{ JSON.stringify(formData, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="mt-8 p-4 bg-gray-50 rounded-lg">
      <div class="flex flex-wrap items-center justify-center gap-3">
        <Button 
          @click="loadSampleSchema" 
          outlined
          label="Load Sample Schema"
        />
        <Button 
          @click="clearSchema" 
          severity="secondary" 
          outlined
          label="Clear Schema"
        />
        <Button 
          @click="exportSchema" 
          outlined
          label="Export Schema"
        />
        <Button 
          @click="importSchema" 
          outlined
          label="Import Schema"
        />
      </div>
    </div>

    <!-- Toast for notifications -->
    <Toast />
    
    <!-- Confirm dialog -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { SchemaBuilder } from '@/schema-builder'
import { Enforma } from '@'
import type { FormSchema } from '@/types'

// Composables
const toast = useToast()
const confirm = useConfirm()

// State
const schema = ref<FormSchema>({})
const formData = ref<Record<string, any>>({})
const showFormData = ref(false)
const sampleData = ref<Record<string, any>>({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  country: 'US',
  bio: 'Software developer with 5+ years of experience.'
})

// Sample schema for demonstration
const sampleSchema: FormSchema = {
  personal_info: {
    type: 'section',
    title: 'Personal Information'
  },
  name: {
    type: 'field',
    section: 'personal_info',
    label: 'Full Name',
    inputComponent: 'input',
    required: true,
    help: 'Enter your full name',
    inputProps: {
      placeholder: 'e.g. John Doe'
    }
  },
  email: {
    type: 'field',
    section: 'personal_info',
    label: 'Email Address',
    inputComponent: 'input',
    required: true,
    inputProps: {
      placeholder: 'john@example.com'
    }
  },
  age: {
    type: 'field',
    section: 'personal_info',
    label: 'Age',
    inputComponent: 'number',
    inputProps: {
      min: 18,
      max: 100
    }
  },
  country: {
    type: 'field',
    section: 'personal_info',
    label: 'Country',
    inputComponent: 'select',
    inputProps: {
      options: ['US', 'Canada', 'UK', 'Germany', 'France', 'Australia', 'Other']
    }
  },
  about_section: {
    type: 'section',
    title: 'About You'
  },
  bio: {
    type: 'field',
    section: 'about_section',
    label: 'Biography',
    inputComponent: 'textarea',
    help: 'Tell us about yourself',
    inputProps: {
      rows: 4,
      placeholder: 'Write a short bio...'
    }
  },
  newsletter: {
    type: 'field',
    section: 'about_section',
    label: 'Subscribe to newsletter',
    inputComponent: 'checkbox'
  },
  skills: {
    type: 'repeatable',
    section: 'about_section',
    allowAdd: true,
    allowRemove: true,
    min: 1,
    max: 5,
    subfields: {
      skill_name: {
        type: 'field',
        label: 'Skill',
        inputComponent: 'input'
      },
      level: {
        type: 'field',
        label: 'Level',
        inputComponent: 'select',
        inputProps: {
          options: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
        }
      }
    }
  }
}

// Methods
const onSchemaUpdate = (newSchema: FormSchema) => {
  console.log('Schema updated:', newSchema)
  
  // Auto-initialize form data for new fields
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

const loadSampleSchema = () => {
  confirm.require({
    message: 'This will replace your current schema. Continue?',
    header: 'Load Sample Schema',
    icon: 'pi pi-question-circle',
    acceptClass: 'p-button-primary',
    accept: () => {
      schema.value = { ...sampleSchema }
      toast.add({
        severity: 'success',
        summary: 'Schema Loaded',
        detail: 'Sample schema has been loaded',
        life: 3000
      })
    }
  })
}

const clearSchema = () => {
  confirm.require({
    message: 'This will remove all schema items. Continue?',
    header: 'Clear Schema',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => {
      schema.value = {}
      formData.value = {}
      toast.add({
        severity: 'info',
        summary: 'Schema Cleared',
        detail: 'All schema items have been removed',
        life: 3000
      })
    }
  })
}

const resetFormData = () => {
  formData.value = {}
  toast.add({
    severity: 'info',
    summary: 'Data Reset',
    detail: 'Form data has been reset',
    life: 3000
  })
}

const exportSchema = async () => {
  try {
    const schemaJson = JSON.stringify(schema.value, null, 2)
    await navigator.clipboard.writeText(schemaJson)
    toast.add({
      severity: 'success',
      summary: 'Schema Exported',
      detail: 'Schema copied to clipboard',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Export Failed',
      detail: 'Failed to copy schema to clipboard',
      life: 3000
    })
  }
}

const importSchema = async () => {
  try {
    const text = await navigator.clipboard.readText()
    const parsed = JSON.parse(text)
    
    confirm.require({
      message: 'This will replace your current schema. Continue?',
      header: 'Import Schema',
      icon: 'pi pi-question-circle',
      acceptClass: 'p-button-primary',
      accept: () => {
        schema.value = parsed
        toast.add({
          severity: 'success',
          summary: 'Schema Imported',
          detail: 'Schema imported from clipboard',
          life: 3000
        })
      }
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Import Failed',
      detail: 'Invalid JSON in clipboard or clipboard access denied',
      life: 3000
    })
  }
}

// Watch for schema changes and auto-initialize form data
watch(schema, onSchemaUpdate, { deep: true })
</script>

<style scoped>
.app {
  width: 1400px;
  max-width: 100%;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background: #f8fafc;
}

@media (max-width: 1280px) {
  .app {
    padding: 1rem;
  }
}

pre {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* Ensure proper spacing for grid layout */
.grid {
  gap: 1.5rem;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>