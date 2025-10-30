<template>
  <div class="rekaui-form-container">
    <Enforma
      :data="initialValues"
      :validator="validator"
      :submit-handler="handleSubmit"
    >
      <div class="form-grid">
        <div class="form-field">
          <RekauiField name="name" label="Full Name" />
        </div>
        <div class="form-field">
          <RekauiField name="email" label="Email Address" help="Don't worry, we don't SPAM" />
        </div>
        <div class="form-field">
          <RekauiField name="role" label="Role" input-component="select" :input-props="roleSelectProps" />
        </div>
        <div class="form-field">
          <RekauiField name="active" label="Active" input-component="switch" />
        </div>
        <div class="form-field">
          <RekauiField name="newsletter" label="Subscribe to newsletter" input-component="switch" />
        </div>
      </div>
    </Enforma>
  </div>
</template>

<script setup>
import { Enforma } from '@/index'
import { createEncolaValidator } from '@/validators/encolaValidator'
// We have to use the RekauiField due to how Reka UI works with headless components
import RekauiField from '../../../src/presets/rekaui/Field.vue'

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
.rekaui-form-container {
  padding: 1.5rem;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
