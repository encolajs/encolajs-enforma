<template>
  <div class="builder-container">
    <div class="builder">
      <SchemaBuilder v-if="mounted" v-model="schema" />
    </div>
    <div class="preview">
      <Enforma :schema="schema" :data="formData" :submit-handler="() => {}" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { SchemaBuilder } from '../../../src/schema-builder'
import { Enforma } from '@'
import { ref } from 'vue'
import useFormConfig from '../../examples/headless/useFormConfig'
import SalaryField from '../../examples/enforma/SalaryField.vue'
import EndDateField from '../../examples/enforma/EndDateField.vue'

const schema = ref({
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
    useModelValue: true,
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
        useModelValue: true,
        inputComponent: 'datepicker',
        inputProps: {
          dateFormat: 'yy-mm-dd',
          fluid: true,
        },
      },
      end: {
        label: 'End',
        useModelValue: true,
        inputComponent: EndDateField,
        inputProps: { fluid: true },
      },
    },
  },
})
const formData = useFormConfig().data
const mounted = ref(true)
</script>
<style scoped>
.builder-container {
  display: grid;
  grid-template-columns: 1fr 3fr;
  grid-gap: 2rem;
}
@media (max-width: 700px) {
  .builder-container {
    display: block;
  }
}
</style>