<template>
  <Enforma
    :data="data"
    :rules="rules"
    :custom-messages="messages"
    :submit-handler="submitHandler"
    :schema="schema"
  >
  </Enforma>
</template>

<script setup>
import { Enforma } from '@'
import SalaryField from './SalaryField.vue'
import EndDateField from './EndDateField.vue'
import formConfig from '../headless/formConfig'

const {data, rules, messages, submitHandler} = formConfig

// Define the entire form structure using schema
const schema = {
  section_top: {
    type: 'section',
    class: 'grid grid-cols-2 gap-4',
  },
  name: {
    type: 'field',
    section: 'section_top',
    class: 'col-start-1 col-end-3',
    label: 'Name',
    required: true,
    inputProps: { class: 'w-full' },
  },
  email: {
    type: 'field',
    section: 'section_top',
    class: 'col-start-1 col-end-3',
    label: 'Email',
    required: true,
    inputProps: { class: 'w-full' },
  },
  'address.country': {
    type: 'field',
    section: 'section_top',
    class: 'col-start-1 col-end-2',
    label: 'Country',
    required: true,
    inputProps: { class: 'w-full' },
  },
  'address.city': {
    type: 'field',
    section: 'section_top',
    class: 'col-start-2 col-end-3',
    label: 'City',
    required: true,
    inputProps: { class: 'w-full' },
  },
  willing_to_relocate: {
    type: 'field',
    section: 'section_top',
    class: 'col-start-1 col-end-3 toggle-field',
    label: 'Willing to relocate',
    showLabelNextToInput: true,
    inputComponent: 'toggle',
  },
  salary: {
    type: 'field',
    section: 'section_top',
    class: 'col-start-1 col-end-2',
    label: 'Salary',
    inputComponent: SalaryField,
    inputProps: { class: 'w-full' },
  },
  available_date: {
    type: 'field',
    section: 'section_top',
    class: 'col-start-2 col-end-3',
    label: 'Available date',
    inputComponent: 'datepicker',
    inputProps: { class: 'w-full', dateFormat: 'yy-mm-dd', fluid: true },
  },
  linkedin_profile: {
    type: 'field',
    section: 'section_top',
    label: 'Linkedin Profile',
    inputProps: { class: 'w-full' },
  },
  personal_site: {
    type: 'field',
    section: 'section_top',
    label: 'Personal site',
    inputProps: { class: 'w-full' },
  },
  skills_section: {
    type: 'section',
    title: 'Skills',
    titleComponent: 'h3',
    titleProps: { class: 'w-full' },
  },
  skills: {
    type: 'repeatable_table',
    section: 'skills_section',
    class: 'mb-4',
    subfields: {
      name: {
        label: 'Skill',
        inputComponent: 'input',
        inputProps: { fluid: true },
      },
      level: {
        label: 'Level',
        inputComponent: 'select',
        inputProps: {
          fluid: true,
          options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        },
      },
    },
  },
  experience_section: {
    type: 'section',
    title: 'Experience',
    titleComponent: 'h3',
    titleProps: { class: 'w-full' },
  },
  experience: {
    type: 'repeatable',
    section: 'experience_section',
    class: 'mb-4 form-repeatable-experience',
    subfields: {
      company: {
        label: 'Company',
        wrapperProps: { class: 'col-start-1 col-end-2' },
        inputProps: { fluid: true },
      },
      position: {
        label: 'Position',
        wrapperProps: { class: 'col-start-2 col-end-3' },
        inputProps: { fluid: true },
      },
      start: {
        label: 'Start',
        inputComponent: 'datepicker',
        inputProps: {
          dateFormat: 'yy-mm-dd',
          fluid: true,
        },
      },
      end: {
        label: 'End',
        inputComponent: EndDateField,
        inputProps: { fluid: true },
      },
    },
  }
}
</script>