<template>
  <Enforma
    :data="data"
    :rules="rules"
    :custom-messages="messages"
    :submit-handler="submitHandler"
  >
    <template #default="formCtrl">
      <div class="grid grid-cols-2 gap-4">
        <EnformaField
          class="col-start-1 col-end-3"
          name="name"
          required
          label="Name"
          :input-props="{class: 'w-full'}"
        />
        <EnformaField
          class="col-start-1 col-end-3"
          name="email"
          required
          label="Email"
          :input-props="{class: 'w-full'}"
        />
        <EnformaField
          class="col-start-1 col-end-2"
          name="address.country"
          required
          label="Country"
          :input-props="{class: 'w-full'}"
        />
        <EnformaField
          class="col-start-2 col-end-3"
          name="address.city"
          required
          label="City"
          :input-props="{class: 'w-full'}"
        />
        <EnformaField
          class="col-start-1 col-end-3 toggle-field"
          name="willing_to_relocate"
          label="Willing to relocate"
          showLabelNextToInput
          component="toggle"
        />
        <EnformaField
          class="col-start-1 col-end-2"
          name="salary"
          label="Salary"
          :component="SalaryField"
          :input-props="{class: 'w-full'}"
        />
        <EnformaField
          class="col-start-2 col-end-3"
          name="available_date"
          label="Available date"
          component="datepicker"
          :input-props="{class: 'w-full'}"
        />
        <EnformaField
          name="linkedin_profile"
          label="Linkedin Profile"
          :input-props="{class: 'w-full'}"
        />
        <EnformaField
          name="personal_site"
          label="Personal site"
          :input-props="{class: 'w-full'}"
        />
      </div>
      <h3 class="w-full">Skills</h3>
      <EnformaRepeatableTable
        class="mb-4"
        name="skills"
        :subfields="skillFields"
      />
      <h3 class="w-full">Experience</h3>
      <div>
        <EnformaRepeatable
          class="mb-4"
          name="experience"
          :subfields="experienceFields"
        />
      </div>
    </template>
  </Enforma>
</template>

<script setup>
import { Enforma, EnformaField, EnformaRepeatable, EnformaRepeatableTable } from '../../../src'
import formConfig from './formConfig'
import EndDateField from './EndDateField.vue'
import SalaryField from './SalaryField.vue'

const {data, rules, messages, submitHandler} = formConfig

const skillFields = {
  name: {
    label: "Skill",
    component: 'input', // not necessary with the Primevue preset, it's the default
    inputProps:  {
      fluid: true
    }
  },
  level: {
    label: "Level",
    component: 'select',
    inputProps: {
      fluid: true,
      options: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    }
  }
}
const experienceFields = {
  company: {
    label: "Company",
    inputProps:  {
      fluid: true
    },
  },
  position: {
    label: "Position",
    inputProps:  {
      fluid: true
    },
  },
  start: {
    label: "Start",
    component: 'datepicker',
    inputProps:  {
      dateFormat: "yy-mm-dd",
      fluid: true
    },
  },
  end: {
    label: "End",
    component: EndDateField,
    inputProps:  {
      fluid: true
    },
  },
}
</script>