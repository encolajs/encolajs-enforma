<template>
  <Enforma
    ref="formRef"
    :data="data"
    :rules="rules"
    :submit-handler="submitHandler"
  >
    <div class="grid grid-cols-2 gap-4 mb-4">
      <EnformaField
        class="col-start-1 col-end-3"
        name="name"
        required
        label="Name"
        help="Only John Wick can submit this form"
        :input-props="{class: 'w-full'}"
      />
      <EnformaField
        class="col-start-1 col-end-3"
        name="email"
        required
        label="Email"
        :input-props="{class: 'w-full'}"
        :rules="rules.email"
      />
    </div>
  </Enforma>
</template>

<script setup>
import { Enforma, EnformaField } from '@'

const data = {
  name: null,
  email: 'johnwick@gmail.com'
}

const rules = {
  name: 'required',
  email: 'required|email',
}

// The submit handler simulates talking to the server and returning errors
const submitHandler = (formData, formController) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (formData.name !== 'John Wick') {
        formController.setErrors({
          name: ['You are not allowed in this establishment']
        })
        reject(false)
        return
      }
      alert('Data sent to server: ' + JSON.stringify(formData))
      resolve(true)
    }, 1000)
  })
}
</script>