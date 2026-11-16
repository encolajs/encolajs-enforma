<template>
  <label class="flex items-center gap-2 mb-4 text-sm">
    <input v-model="vertical" type="checkbox" />
    Vertical tabs
  </label>

  <Enforma
    :data="data"
    :validator="validator"
    :schema="schema"
    :submit-handler="submitHandler"
  />
</template>

<script setup>
import { computed, ref } from 'vue'
import { Enforma } from '@'
import { createEncolaValidator } from '../../../src/validators/encolaValidator'

const vertical = ref(false)

const data = ref({
  name: '',
  email: '',
  iban: '',
  companyName: '',
  vat: '',
  notes: '',
})

const validator = createEncolaValidator({
  name: 'required',
  email: 'required|email',
  iban: 'required',
  vat: 'required',
})

const schema = computed(() => ({
  // The tabs: its sub-sections are the tabs. It opens on Preferences
  account: {
    type: 'section',
    component: 'tabs',
    props: {
      active: 'preferences',
      orientation: vertical.value ? 'vertical' : 'horizontal',
    },
  },

  profile: {
    type: 'section',
    section: 'account',
    title: 'Profile',
    description: 'Who the account is for',
  },
  name: { section: 'profile', label: 'Name' },
  email: { section: 'profile', label: 'Email' },

  billing: { type: 'section', section: 'account', title: 'Billing' },
  iban: { section: 'billing', label: 'IBAN' },
  // A collapsible inside the Billing tab, closed at first
  company: {
    type: 'section',
    section: 'billing',
    component: 'collapsible',
    title: 'Company details',
    description: 'For invoices made out to a company',
    props: { open: false },
  },
  companyName: { section: 'company', label: 'Company name' },
  vat: { section: 'company', label: 'VAT number' },

  preferences: { type: 'section', section: 'account', title: 'Preferences' },
  notes: { section: 'preferences', label: 'Notes', inputComponent: 'textarea' },
}))

const submitHandler = (formData) => {
  alert('Data sent to server: ' + JSON.stringify(formData))
  return Promise.resolve(true)
}
</script>
