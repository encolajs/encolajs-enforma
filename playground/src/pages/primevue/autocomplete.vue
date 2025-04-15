<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-6">Autocomplete Examples</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Basic Example -->
      <div class="p-4 border rounded-lg">
        <h2 class="text-xl font-semibold mb-4">Basic Autocomplete</h2>
        <p class="mb-4 text-gray-600">Simple autocomplete with array of strings</p>
        <FormKitField
          type="autocomplete"
          name="basic"
          label="Select a country"
          :options="countries"
          placeholder="Type to search..."
          @update:modelValue="(value) => updateFormData('basic', value)"
        />
        <div class="mt-2 text-sm text-gray-500">
          Selected value: {{ formData.basic }}
        </div>
      </div>
      
      <!-- Multiple Selection -->
      <div class="p-4 border rounded-lg">
        <h2 class="text-xl font-semibold mb-4">Multiple Selection</h2>
        <p class="mb-4 text-gray-600">Allow selecting multiple items</p>
        <FormKitField
          type="autocomplete"
          name="multiple"
          label="Select countries"
          :options="countries"
          :multiple="true"
          placeholder="Type to search..."
          @update:modelValue="(value) => updateFormData('multiple', value)"
        />
        <div class="mt-2 text-sm text-gray-500">
          Selected values: {{ formData.multiple }}
        </div>
      </div>
      
      <!-- CSV Format -->
      <div class="p-4 border rounded-lg">
        <h2 class="text-xl font-semibold mb-4">CSV Format</h2>
        <p class="mb-4 text-gray-600">Multiple selection with CSV output format</p>
        <FormKitField
          type="autocomplete"
          name="csv"
          label="Select countries (CSV)"
          :options="countries"
          :multiple="true"
          value-as="csv"
          placeholder="Type to search..."
          @update:modelValue="(value) => updateFormData('csv', value)"
        />
        <div class="mt-2 text-sm text-gray-500">
          Selected values (CSV): {{ formData.csv }}
        </div>
      </div>
      
      <!-- Object Options -->
      <div class="p-4 border rounded-lg">
        <h2 class="text-xl font-semibold mb-4">Object Options</h2>
        <p class="mb-4 text-gray-600">Using an object for options with key-value pairs</p>
        <FormKitField
          type="autocomplete"
          name="object"
          label="Select a language"
          :options="languages"
          placeholder="Type to search..."
          @update:modelValue="(value) => updateFormData('object', value)"
        />
        <div class="mt-2 text-sm text-gray-500">
          Selected value: {{ formData.object }}
        </div>
      </div>
      
      <!-- Async Options -->
      <div class="p-4 border rounded-lg">
        <h2 class="text-xl font-semibold mb-4">Async Options</h2>
        <p class="mb-4 text-gray-600">Loading options from an async function</p>
        <FormKitField
          type="autocomplete"
          name="async"
          label="Select a user"
          :options="getUsers"
          placeholder="Type to search..."
          @update:modelValue="(value) => updateFormData('async', value)"
        />
        <div class="mt-2 text-sm text-gray-500">
          Selected value: {{ formData.async }}
        </div>
      </div>
      
      <!-- Complex Objects -->
      <div class="p-4 border rounded-lg">
        <h2 class="text-xl font-semibold mb-4">Complex Objects</h2>
        <p class="mb-4 text-gray-600">Using objects with value and label properties</p>
        <FormKitField
          type="autocomplete"
          name="complex"
          label="Select a product"
          :options="products"
          placeholder="Type to search..."
          @update:modelValue="(value) => updateFormData('complex', value)"
        />
        <div class="mt-2 text-sm text-gray-500">
          Selected value: {{ formData.complex }}
        </div>
      </div>
    </div>
    
    <!-- Form Data Display -->
    <div class="mt-8 p-4 border rounded-lg bg-gray-50">
      <h2 class="text-xl font-semibold mb-4">Form Data</h2>
      <pre class="bg-gray-100 p-4 rounded overflow-auto">{{ JSON.stringify(formData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import FormKitField from '@/core/EnformaField.vue'

// Sample data
const countries = [
  'United States', 'Canada', 'Mexico', 'Brazil', 'Argentina', 
  'United Kingdom', 'France', 'Germany', 'Italy', 'Spain',
  'Japan', 'China', 'India', 'Australia', 'South Africa'
]

const languages = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ar': 'Arabic'
}

const products = [
  { value: 'laptop', label: 'Laptop Computer' },
  { value: 'smartphone', label: 'Smartphone' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'headphones', label: 'Headphones' },
  { value: 'monitor', label: 'Monitor' },
  { value: 'keyboard', label: 'Keyboard' },
  { value: 'mouse', label: 'Mouse' },
  { value: 'printer', label: 'Printer' },
  { value: 'camera', label: 'Camera' },
  { value: 'speaker', label: 'Speaker' }
]

// Async function to simulate API call
const getUsers = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return [
    { value: 'user1', label: 'John Doe' },
    { value: 'user2', label: 'Jane Smith' },
    { value: 'user3', label: 'Bob Johnson' },
    { value: 'user4', label: 'Alice Williams' },
    { value: 'user5', label: 'Charlie Brown' }
  ]
}

// Form data to track selected values
const formData = reactive({
  basic: '',
  multiple: [],
  csv: '',
  object: '',
  async: '',
  complex: ''
})

// Update form data when field values change
const updateFormData = (name, value) => {
  formData[name] = value
}
</script>
