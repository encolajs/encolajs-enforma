<template>
  <h1 class="text-2xl font-bold mb-4">FormKit with Fields</h1>
  <FormKitWithFields />
</template>

<script setup>
import FormKitWithFields from '../examples/FormKitWithFields.vue'
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