<template>
  <Enforma
    ref="formRef"
    :data="data"
    :rules="rules"
    :custom-messages="messages"
    :submit-handler="submitHandler"
  >
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
        input-component="toggle"
      />
      <EnformaField
        class="col-start-1 col-end-2"
        name="salary"
        label="Salary"
        :input-component="SalaryField"
        :input-props="{class: 'w-full'}"
      />
      <EnformaField
        class="col-start-2 col-end-3"
        name="available_date"
        label="Available date"
        inputComponent="datepicker"
        useModelValue
        :input-props="{class: 'w-full', dateFormat: 'yy-mm-dd', fluid: true}"
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
        class="mb-4 form-repeatable-experience"
        name="experience"
        :subfields="experienceFields"
      />
    </div>
  </Enforma>

  <h5 class="mt-8 mb-4">Manipulating the form from outside</h5>
  <div class="flex gap-2">
  <Button
    severity="secondary"
    @click="formRef?.submit()"
    label="Submit"
    :loading="formRef?.$isSubmitting" />
  <Button
    severity="secondary"
    @click="formRef?.setFieldValue('name', 'John Doe')"
    label="Set name to 'John Doe'" />
  <Button
    severity="secondary"
    @click="formRef?.add('skills', 0, {name: 'new skill', level: 'Expert'})"
    label="Prepend new skill" />
  </div>
  <h5 class="mt-8 mb-4">Accessing the form details from outside</h5>
  <strong>First skill</strong>: <code>{{ formRef?.getFieldValue('skills.0.name') }}</code><br>
  <strong>Email errors</strong>: <code>{{ formRef?.getFieldErrors('email') }}</code><br>

</template>

<script setup>
import { Enforma, EnformaField, EnformaRepeatable, EnformaRepeatableTable } from '@'
import useFormConfig from '../headless/useFormConfig'
import EndDateField from './EndDateField.vue'
import SalaryField from './SalaryField.vue'
import { Button } from 'primevue'
import { ref } from 'vue'

// for accessing the FormController
const formRef = ref()

const {data, rules, messages, submitHandler} = useFormConfig()

const skillFields = {
  name: {
    label: "Skill",
    inputComponent: 'input', // not necessary with the Primevue preset, it's the default
    inputProps:  {
      fluid: true
    }
  },
  level: {
    label: "Level",
    inputComponent: 'select',
    inputProps: {
      fluid: true,
      options: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    }
  }
}
const experienceFields = {
  company: {
    label: "Company",
    wrapperProps: {
      class: 'col-start-1 col-end-2'
    },
    inputProps:  {
      fluid: true
    },
  },
  position: {
    label: "Position",
    wrapperProps: {
      class: 'col-start-2 col-end-3'
    },
    inputProps:  {
      fluid: true
    },
  },
  start: {
    label: "Start",
    useModelValue: true,
    inputComponent: 'datepicker',
    inputProps:  {
      dateFormat: "yy-mm-dd",
      fluid: true
    },
  },
  end: {
    label: "End",
    useModelValue: true,
    inputComponent: EndDateField,
    inputProps:  {
      fluid: true
    },
  },
}

</script>