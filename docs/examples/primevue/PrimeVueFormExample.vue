<template>
  <Enforma
    :data="initialValues"
    :validator="validator"
    :submit-handler="handleSubmit"
  >
    <div class="grid grid-cols-2 gap-4 mb-4">
      <EnformaField
        class="col-start-1 col-end-3"
        name="name"
        label="Full Name"
        :input-props="{ fluid: true }"
      />
      <EnformaField
        class="col-start-1 col-end-3"
        name="email"
        label="Email Address"
        help="Don't worry, we don't SPAM"
        :input-props="{ fluid: true }"
      />
      <EnformaField
        class="col-start-1 col-end-2"
        name="role"
        label="Role"
        input-component="select"
        :input-props="roleSelectProps"
      />
      <EnformaField
        class="col-start-2 col-end-3"
        name="start_date"
        label="Start date"
        input-component="datepicker"
        use-model-value
        :input-props="{ dateFormat: 'yy-mm-dd', fluid: true }"
      />
      <EnformaField
        class="col-start-1 col-end-3 toggle-field"
        name="active"
        label="Active"
        show-label-next-to-input
        input-component="toggle"
      />
    </div>
  </Enforma>
</template>

<script setup>
import { Enforma, EnformaField } from '@'
import { createEncolaValidator } from '../../../src/validators/encolaValidator'

const validator = createEncolaValidator({
  name: 'required',
  email: 'required|email',
  role: 'required',
  start_date: 'required|date:yy-mm-dd',
})

const initialValues = {
  name: '',
  email: '',
  role: '',
  start_date: null,
  active: true
}

const roleSelectProps = {
  fluid: true,
  optionLabel: 'label',
  optionValue: 'value',
  options: [
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
