<template>
  <Enforma
    ref="formRef"
    :data="data"
    :validator="validator"
    :schema="schema"
    :submit-handler="submitHandler"
    :config="config"
  />

  <div class="flex gap-2 mt-4">
    <UButton color="neutral" variant="outline" @click="serverErrors">
      Simulate errors from the server
    </UButton>
  </div>

  <h5 class="mt-8 mb-4">Form Data Preview</h5>
  <pre class="bg-gray-100 text-gray-800 p-4 rounded text-sm">{{ JSON.stringify(data, null, 2) }}</pre>
</template>

<script setup>
import { ref } from 'vue'
import UButton from '@nuxt/ui/components/Button.vue'
import { Enforma } from '@'
import { createEncolaValidator } from '../../../src/validators/encolaValidator'

const formRef = ref()

// Room above the form's buttons, below the tabs
const config = { pt: { actions: { class: 'flex gap-2 mt-8' } } }

const data = ref({
  applyingAs: 'Individual',
  name: '',
  email: '',
  phone: '',
  address: { street: '', city: '', country: '' },
  jobs: [{ title: '', company: '' }],
  company: { name: '', vat: '', billingEmail: '' },
  notifications: { frequency: '' },
  privacy: { note: '' },
})

const validator = createEncolaValidator(
  {
    name: 'required',
    email: 'required|email',
    'address.city': 'required',
    'jobs.*.title': 'required',
    'jobs.*.company': 'required',
    // checked while the Company tab shows: a hidden field isn't
    'company.name': 'required',
    'company.vat': 'required',
    'company.billingEmail': 'email',
    'notifications.frequency': 'required',
  },
  {
    'address.city:required': 'We need the city to send the contract',
  }
)

const schema = {
  // The tabs section; its own field, Applying as, is drawn above the tabs
  application: { type: 'section', component: 'tabs' },
  applyingAs: {
    section: 'application',
    label: 'Applying as',
    inputComponent: 'select',
    inputProps: { items: ['Individual', 'Company'], class: 'w-full' },
  },

  // Applicant, with a closed collapsible for the address
  applicant: {
    type: 'section',
    section: 'application',
    title: 'Applicant',
    description: 'How we reach you',
  },
  name: { section: 'applicant', label: 'Name', inputProps: { class: 'w-full' } },
  email: { section: 'applicant', label: 'Email', inputProps: { class: 'w-full' } },
  phone: { section: 'applicant', label: 'Phone', inputProps: { class: 'w-full' } },
  addressDetails: {
    type: 'section',
    section: 'applicant',
    component: 'collapsible',
    title: 'Address',
    description: 'Where we send the contract',
    props: { open: false },
  },
  'address.street': { section: 'addressDetails', label: 'Street', inputProps: { class: 'w-full' } },
  'address.city': { section: 'addressDetails', label: 'City', inputProps: { class: 'w-full' } },
  'address.country': { section: 'addressDetails', label: 'Country', inputProps: { class: 'w-full' } },

  // Experience, with a repeatable: each item's fields count in the tab
  experience: {
    type: 'section',
    section: 'application',
    title: 'Experience',
    description: 'Your last jobs, the latest first',
  },
  jobs: {
    type: 'repeatable',
    section: 'experience',
    defaultValue: { title: '', company: '' },
    subfields: {
      title: { label: 'Job title', inputProps: { class: 'w-full' } },
      company: { label: 'Company', inputProps: { class: 'w-full' } },
    },
  },

  // Company: a tab shown only to companies
  companyTab: {
    type: 'section',
    section: 'application',
    title: 'Company',
    if: '${form.values().applyingAs === "Company"}',
  },
  'company.name': { section: 'companyTab', label: 'Company name', inputProps: { class: 'w-full' } },
  'company.vat': { section: 'companyTab', label: 'VAT number', inputProps: { class: 'w-full' } },
  billingContact: {
    type: 'section',
    section: 'companyTab',
    component: 'collapsible',
    title: 'Billing contact',
    props: { open: false },
  },
  'company.billingEmail': { section: 'billingContact', label: 'Billing email', inputProps: { class: 'w-full' } },

  // Preferences: vertical tabs inside a tab
  preferences: { type: 'section', section: 'application', title: 'Preferences' },
  preferenceTabs: {
    type: 'section',
    section: 'preferences',
    component: 'tabs',
    props: { orientation: 'vertical' },
  },
  notificationsTab: { type: 'section', section: 'preferenceTabs', title: 'Notifications' },
  'notifications.frequency': {
    section: 'notificationsTab',
    label: 'Email me',
    inputComponent: 'select',
    inputProps: { items: ['Daily', 'Weekly', 'Never'], class: 'w-full' },
  },
  privacyTab: { type: 'section', section: 'preferenceTabs', title: 'Privacy' },
  'privacy.note': {
    section: 'privacyTab',
    label: 'Anything we should keep private?',
    inputComponent: 'textarea',
    inputProps: { class: 'w-full' },
  },
}

// The server refuses the city: setErrors() doesn't move the page, focusFirstError() does
function serverErrors() {
  formRef.value.setErrors({ 'address.city': ['We don\'t send contracts to this city'] })
  formRef.value.focusFirstError()
}

const submitHandler = (formData) => {
  alert('Data sent to server: ' + JSON.stringify(formData))
  return Promise.resolve(true)
}
</script>
