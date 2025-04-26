<template>
  <Enforma
    :config="formConfig"
    :data="initialValues"
    :rules="rules"
    :submit-handler="handleSubmit"
  >
    <VuetifyField name="name" label="Full Name" />
    <VuetifyField name="email" label="Email Address" help="Don't worrry, we don't SPAM" />
    <VuetifyField name="role" label="Role" input-component="select" :input-props="roleSelectProps" />
    <VuetifyField name="active" label="Active" input-component="switch" />
  </Enforma>
</template>

<script setup>
import { ref } from 'vue'
import { 
  Enforma,
} from '@/index'
// We have to use the VuetifyField due to how Vuetify implements labels and hints
import VuetifyField from '../../../src/presets/vuetify/Field.vue'

const formConfig = {
  validationRules: {
    name: ['required'],
    email: ['required', 'email'],
    role: ['required'],
  }
}

const initialValues = {
  name: '',
  email: '',
  role: '',
  active: true
}

const rules = {
  name: 'required',
  email: 'required|email'
}

const roleSelectProps = {
  items: [
    { value: 'admin', title: 'Administrator' },
    { value: 'user', title: 'Regular User' },
    { value: 'guest', title: 'Guest' }
  ]
}

const handleSubmit = (values) => {
  console.log('Form submitted with values:', values)
  alert('Form submitted successfully!')
}
</script>