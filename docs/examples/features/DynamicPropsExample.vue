<template>
  <Enforma
    ref="formRef"
    :data="data"
    :rules="rules"
    :custom-messages="messages"
    :submit-handler="submitHandler"
    :schema="schema"
    :context="context"
    class="example"
  >
  </Enforma>

  <h5 class="mt-8 mb-4">Form Data Preview</h5>
  <pre class="bg-gray-100 p-4 rounded text-sm">{{ JSON.stringify(data, null, 2) }}</pre>
</template>

<script setup>
import { Enforma } from '@'
import { ref } from 'vue'

// Form reference for accessing controller methods
const formRef = ref()

// Form data
const data = ref({
  name: '',
  contactPreference: 'email',
  email: '',
  phone: '',
  position: '',
  experienceDetails: '',
  availableDate: null,
  remoteWork: false,
  relocationPreference: 'Maybe',
  additionalDetails: ''
})

// Context for dynamic props expressions
const context = {
  positions: ['Developer', 'Manager', 'Designer', 'Other'],
  getExperienceLabel(position) {
    if (!position) return 'Experience Details'
    position = position.toLowerCase()
    
    if (position.includes('developer')) {
      return 'Technical Experience'
    } else if (position.includes('manager')) {
      return 'Management Experience'
    } else if (position.includes('designer')) {
      return 'Design Experience'
    } else {
      return 'Experience Details'
    }
  },
  getExperienceComponent(position) {
    if (!position) return 'input'
    position = position.toLowerCase()
    
    if (position.includes('developer') || position.includes('manager')) {
      return 'textarea'
    } else {
      return 'input'
    }
  },
  getExperienceProps(position) {
    if (!position) return { class: 'w-full' }
    position = position.toLowerCase()
    
    const baseProps = { class: 'w-full' }
    
    if (position.includes('developer')) {
      return {
        ...baseProps,
        rows: 5,
        placeholder: 'Describe your technical experience, languages, frameworks, etc.'
      }
    } else if (position.includes('manager')) {
      return {
        ...baseProps,
        rows: 5,
        placeholder: 'Describe your management experience and leadership style'
      }
    } else {
      return {
        ...baseProps,
        placeholder: 'Enter your experience details'
      }
    }
  }
}

// Define the entire form structure using schema with dynamic props
const schema = {
  name: {
    type: 'field',
    class: 'col-start-1 col-end-3',
    label: 'Name',
    required: true,
    inputProps: { class: 'w-full' },
  },
  contactPreference: {
    type: 'field',
    class: 'col-start-1 col-end-3',
    label: 'Preferred Contact Method',
    required: true,
    inputComponent: 'select',
    inputProps: {
      class: 'w-full',
      options: ['email', 'phone', 'both']
    },
  },
  email: {
    type: 'field',
    class: 'col-start-1 col-end-3',
    label: 'Email Address',
    required: true,
    inputProps: { class: 'w-full' },
    if: '${form.getFieldValue("contactPreference") === "email" || form.getFieldValue("contactPreference") === "both"}',
  },
  phone: {
    type: 'field',
    class: 'col-start-1 col-end-3',
    label: '${form.getFieldValue("contactPreference")}',
    required: true,
    inputProps: { class: 'w-full' },
    if: '${form.getFieldValue("contactPreference") === "phone" || form.getFieldValue("contactPreference") === "both"}',
  },
  position: {
    type: 'field',
    class: 'col-start-1 col-end-3',
    label: 'Position Applied For',
    required: true,
    inputComponent: 'select',
    inputProps: {
      class: 'w-full',
      options: '${context.positions}'
    },
  },
  experienceDetails: {
    type: 'field',
    class: 'col-start-1 col-end-3',
    label: '${context.getExperienceLabel(form.getFieldValue("position"))}',
    required: true,
    inputComponent: '${context.getExperienceComponent(form.getFieldValue("position"))}',
    inputProps: '${context.getExperienceProps(form.getFieldValue("position"))}',
  },
  availableDate: {
    type: 'field',
    class: 'col-start-1 col-end-3',
    label: 'Date Available',
    required: true,
    inputComponent: 'datepicker',
    inputProps: { class: 'w-full', dateFormat: 'yy-mm-dd', fluid: true },
  },
  remoteWork: {
    type: 'field',
    class: 'col-start-1 col-end-3 toggle-field',
    label: 'Interested in remote work',
    showLabelNextToInput: true,
    inputComponent: 'toggle',
  },
  // relocationPreference: {
  //   type: 'field',
  //   props: {
  //     class: 'col-start-1 col-end-3',
  //     label: 'Willing to relocate',
  //     required: '${!form.getFieldValue("remoteWork")}',
  //     inputComponent: 'select',
  //     inputProps: {
  //       class: 'w-full',
  //       options: ['Yes', 'No', 'Maybe']
  //     },
  //     if: '${!form.getFieldValue("remoteWork")}',
  //   },
  // },
  // additionalDetails: {
  //   type: 'field',
  //   props: {
  //     class: 'col-start-1 col-end-3',
  //     label: '${form.getFieldValue("remoteWork") ? "Remote Work Setup" : "Relocation Preferences"}',
  //     inputComponent: 'textarea',
  //     inputProps: {
  //       class: 'w-full',
  //       rows: 3,
  //       placeholder: '${form.getFieldValue("remoteWork") ? "Describe your home office setup" : "Describe your relocation preferences"}'
  //     },
  //   },
  // }
}

// Validation rules
const rules = {
  name: 'required',
  contactPreference: 'required',
  email: 'required|email|min_length:5',
  phone: 'required|min_length:10',
  position: 'required',
  experienceDetails: 'required|min_length:10',
  availableDate: 'required'
}

// Custom error messages
const messages = {
  'email.required': 'Email address is required when email is selected as contact method',
  'phone.required': 'Phone number is required when phone is selected as contact method',
  'experienceDetails.required': 'Please provide details about your experience',
  'relocationPreference.validation_failed': 'Please indicate your relocation preference'
}

// Submit handler
const submitHandler = (values) => {
  alert('Form submitted successfully!')
  console.log('Form values:', values)
  return Promise.resolve()
}
</script>

<style>
.example .enforma-section {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}
</style>