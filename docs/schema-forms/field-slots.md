# Field Slots

Enforma allows you to customize the rendering of specific fields in your form schema using named slots. This is particularly useful when you need to create complex custom field implementations while still leveraging the schema-based approach.

## Basic Usage

You can use slots to customize the rendering of specific fields by providing a slot with the name `field(fieldName)` where `fieldName` is the key of the field in your schema.

```vue
<template>
  <Enforma :schema="formSchema" :data="formData" :submit-handler="onSubmit">
    <!-- Custom implementation for the address.city field -->
    <template #field('address.city')="{ field, formController, config }">
      <div class="custom-city-field">
        <label>{{ field.label }}</label>
        <div class="city-selector">
          <select 
            :value="formController.getFieldValue('address.city')"
            @change="e => formController.setFieldValue('address.city', e.target.value)"
          >
            <option value="">Select a city</option>
            <option value="New York">New York</option>
            <option value="Los Angeles">Los Angeles</option>
            <option value="Chicago">Chicago</option>
            <!-- More cities... -->
          </select>
          <button @click="findNearestCity">Find nearest city</button>
        </div>
      </div>
    </template>
  </Enforma>
</template>

<script setup>
import { Enforma } from 'enforma'
import { ref } from 'vue'

const formData = ref({
  address: {
    street: '',
    city: '',
    state: '',
    zip: ''
  }
})

const formSchema = {
  'address.street': {
    type: 'field',
    label: 'Street Address'
  },
  'address.city': {
    type: 'field',
    label: 'City'
  },
  'address.state': {
    type: 'field',
    label: 'State'
  },
  'address.zip': {
    type: 'field',
    label: 'ZIP Code'
  }
}

function onSubmit(data) {
  // Handle form submission
  console.log('Form submitted:', data)
  return Promise.resolve()
}

function findNearestCity() {
  // Custom logic to find nearest city using geolocation, etc.
}
</script>
```

## Slot Props

The slot provides the following props that you can use in your custom implementation:

- `field`: The field schema object from your form schema
- `formController`: The form controller instance that provides methods to manipulate the form state
- `config`: The current form configuration

## Supported Field Types

You can use field slots for any field type in your schema:

- Regular fields (`type: 'field'`)
- Repeatable fields (`type: 'repeatable'`)
- Repeatable table fields (`type: 'repeatable-table'`)

### Example with Repeatable Field

```vue
<template>
  <Enforma :schema="formSchema" :data="formData" :submit-handler="onSubmit">
    <!-- Custom implementation for the experiences repeatable field -->
    <template #field('experiences')="{ field, formController, config }">
      <div class="custom-experiences">
        <h3>{{ field.label }}</h3>
        <div 
          v-for="(item, index) in formController.getFieldValue('experiences')" 
          :key="index"
          class="experience-item"
        >
          <div class="experience-header">
            <h4>Experience {{ index + 1 }}</h4>
            <button @click="() => formController.remove('experiences', index)">
              Remove
            </button>
          </div>
          <div class="experience-fields">
            <label>Company</label>
            <input 
              :value="item.company"
              @input="e => formController.setFieldValue(`experiences.${index}.company`, e.target.value)" 
            />
            <label>Position</label>
            <input 
              :value="item.position"
              @input="e => formController.setFieldValue(`experiences.${index}.position`, e.target.value)" 
            />
          </div>
        </div>
        <button 
          @click="() => formController.add('experiences', formController.getFieldValue('experiences').length, { company: '', position: '' })"
        >
          Add Experience
        </button>
      </div>
    </template>
  </Enforma>
</template>

<script setup>
import { Enforma } from 'enforma'
import { ref } from 'vue'

const formData = ref({
  experiences: [
    { company: 'Acme Inc', position: 'Developer' }
  ]
})

const formSchema = {
  experiences: {
    type: 'repeatable',
    label: 'Work Experience',
    subfields: {
      company: {
        type: 'field',
        label: 'Company'
      },
      position: {
        type: 'field',
        label: 'Position'
      }
    }
  }
}

function onSubmit(data) {
  // Handle form submission
  console.log('Form submitted:', data)
  return Promise.resolve()
}
</script>
```
