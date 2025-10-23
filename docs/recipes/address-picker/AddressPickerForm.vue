<template>
  <Enforma
    ref="formRef"
    :data="data"
    :validator="validator"
    :submit-handler="submitHandler"
  >
    <EnformaField
      class="col-start-1 col-end-3 mb-4"
      name="name"
      required
      label="Name"
      :input-props="{class: 'w-full'}"
    />
    <EnformaField
      class="col-start-1 col-end-3 mb-4"
      name="shipping_address"
      required
      label="Shipping Address"
      :input-component="AddressPicker"
      :input-props="{class: 'w-full', options: addresses}"
    />
  </Enforma>
</template>

<script setup>
import { Enforma, EnformaField } from '@'
import { createEncolaValidator } from '@/validators/encolaValidator'
import AddressPicker from './AddressPicker.vue'

const addresses = [
  {
    address: "123 Maple Street",
    city: "Springfield",
    state: "IL",
    zip: "62704",
    country: "USA"
  },
  {
    address: "456 Oak Avenue",
    city: "Boulder",
    state: "CO",
    zip: "80302",
    country: "USA"
  },
  {
    address: "789 Pine Road",
    city: "Orlando",
    state: "FL",
    zip: "32801",
    country: "USA"
  }
]

const data = {
  name: null,
  shipping_address: null
}

const validator = createEncolaValidator({
  name: 'required',
  shipping_address: 'required'
})

function submitHandler(formData) {
  alert('Form data sent to server: ' + JSON.stringify(formData))
}


</script>