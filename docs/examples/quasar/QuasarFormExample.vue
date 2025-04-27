<template>
  <div class="q-mt-lg">
    <q-card class="q-pa-md">
        <Enforma
          :config="formConfig"
          :data="initialValues"
          :rules="rules"
          :submit-handler="handleSubmit"
        >
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <QuasarField name="name" label="Full Name" />
            </div>
            <div class="col-12 col-md-6">
              <QuasarField name="email" label="Email Address" help="Don't worry, we don't SPAM" />
            </div>
            <div class="col-12 col-md-6">
              <QuasarField name="role" label="Role" input-component="select" :input-props="roleSelectProps" />
            </div>
            <div class="col-12 col-md-6">
              <QuasarField name="phone" label="Phone Number" :input-props="{ mask: '(###) ###-####' }" />
            </div>
            <div class="col-12">
              <QuasarField name="address" label="Address" :input-props="{ type: 'textarea', rows: 2 }" />
            </div>
            <div class="col-12 col-md-6">
              <QuasarField name="active" label="Active" input-component="toggle" />
            </div>
            <div class="col-12 col-md-6">
              <QuasarField name="newsletter" label="Subscribe to newsletter" input-component="toggle" />
            </div>
          </div>
        </Enforma>
      </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { 
  Enforma,
} from '@/index'
// Import Quasar components
import { QBtn, QCard } from 'quasar'
// We have to use the QuasarField due to how Quasar implements labels and hints
import QuasarField from '../../../src/presets/quasar/Field.vue'

const submittedValues = ref(null)

const formConfig = {
  validationRules: {
    name: ['required'],
    email: ['required', 'email'],
    role: ['required'],
    phone: ['required'],
  }
}

const initialValues = {
  name: '',
  email: '',
  role: '',
  phone: '',
  address: '',
  active: true,
  newsletter: false
}

const rules = {
  name: 'required',
  email: 'required|email',
  role: 'required',
  phone: 'required'
}

const roleSelectProps = {
  options: [
    { value: 'admin', label: 'Administrator' },
    { value: 'user', label: 'Regular User' },
    { value: 'guest', label: 'Guest' }
  ],
  'emit-value': true,
  'map-options': true
}

const handleSubmit = (values) => {
  console.log('Form submitted with values:', values)
  submittedValues.value = values
}
</script>

<style scoped>
pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow: auto;
}
</style>