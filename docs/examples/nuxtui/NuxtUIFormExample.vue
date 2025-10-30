<template>
  <div class="nuxtui-form-container">
    <Enforma
      :data="initialValues"
      :validator="validator"
      :submit-handler="handleSubmit"
    >
      <div class="form-grid">
        <div class="form-field">
          <NuxtUIField name="name" label="Full Name" />
        </div>
        <div class="form-field">
          <NuxtUIField name="email" label="Email Address" help="Don't worry, we don't SPAM" />
        </div>
        <div class="form-field">
          <NuxtUIField name="role" label="Role" input-component="select" :input-props="roleSelectProps" />
        </div>
        <div class="form-field">
          <NuxtUIField name="active" label="Active" input-component="switch" />
        </div>
        <div class="form-field">
          <NuxtUIField name="newsletter" label="Subscribe to newsletter" input-component="switch" />
        </div>
      </div>
    </Enforma>
  </div>
</template>

<script setup>
import { Enforma } from '@/index'
import { createEncolaValidator } from '@/validators/encolaValidator'
// We have to use the NuxtUIField
import NuxtUIField from '../../../src/presets/nuxtui/Field.vue'

const initialValues = {
  name: '',
  email: '',
  role: '',
  active: true,
  newsletter: false
}

const validator = createEncolaValidator({
  name: 'required',
  email: 'required|email',
  role: 'required'
})

const roleSelectProps = {
  items: [
    { value: 'admin', label: 'Administrator' },
    { value: 'user', label: 'Regular User' },
    { value: 'guest', label: 'Guest' }
  ]
}

const handleSubmit = (values) => {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      alert('Form submitted with values: ' + JSON.stringify(values))
      resolve(true)
    }, 2000)
  })
}
</script>

<style scoped>
.nuxtui-form-container {
  padding: 1.5rem;
  background: rgb(var(--color-gray-50));
  border: 1px solid rgb(var(--color-gray-200));
  border-radius: 0.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-field {
  min-width: 0;
}
</style>
