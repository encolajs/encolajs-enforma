<template>
  <h1 class="text-2xl font-bold mb-4">FormKit with Fields</h1>
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-8">
      <FormKit
        ref="$form"
        :data="data"
        :rules="rules"
        :custom-messages="customMessages"
        :submit-handler="submitHandler"
      >
        <template #default="formState">
          <FormKitField
            name="name"
            label="Name"
            required
            :help="help"
          />
          <FormKitField
            name="email"
            label="Email"
            placeholder="Enter your email"
            required
            help="We don't spam, don't worry"
          />
          <FormKitField
            name="age"
            label="Age"
            required
            type="select"
            :input-props="{options: [10, 20, 30, 40]}">
          </FormKitField>
        </template>
        <template #actions="{ formState, formConfig }">
          <div class="flex gap-2">
            <component :is="formConfig?.components.submitButton" />
            <component :is="formConfig?.components.resetButton" />
          </div>
        </template>
      </FormKit>
      <Button @click="help = 'Cool'" severity="warn">Change help</Button>
    </div>
    <div class="col-span-4">
      <pre class="overflow-auto">{{ $form }}xxx</pre>
    </div>
  </div>
</template>

<script setup>
import FormKit from '../../../src/components/core/FormKit.vue'
import FormKitField from '../../../src/components/core/FormKitField.vue'
import { InputText, Select } from 'primevue'
import { ref } from 'vue'

const $form = ref(null)

const help = ref('This is your name')

const data = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  friends: [
    { name: 'John', origin: 'USA' },
    { name: 'Doe', origin: 'UK' },
  ],
}

const rules = {
  name: 'required',
  email: 'required|email',
  age: 'required|number|gt:20|lt:100',
  'friends.*.name': 'required',
  'friends.*.origin': 'required',
}

const customMessages = {
  'name.required': 'You gotta have a name',
}

const submitHandler = async (formData) => {
  return new Promise((resolve) => {
    console.log(formData)
    setTimeout(resolve, 2000)
  })
}
</script>