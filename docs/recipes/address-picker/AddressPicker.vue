<template>
  <div class="flex gap-2">
    <Select
      class="flex-grow-1"
      v-model="selectedAddress"
      :options="selectOptions"
      placeholder="Select address."
      @focus="emit('focus')"
      @blur="emit('blur')"
      @update:modelValue="emit('change', {value: selectedAddress})">
      <template #value="{value, placeholder}">
        {{getAddressAsText(value) || placeholder}}
      </template>
      <template #option="{option}">
        {{getAddressAsText(option)}}
      </template>
    </Select>
    <Button
      severity="secondary"
      label="New address"
      @click="showAddressModal = true"
    />
  </div>
  <Dialog
    v-model:visible="showAddressModal"
    modal
    header="Add New Address" :style="{ width: '25rem' }">
    <Enforma
      ref="modalForm"
      :data="newAddress"
      :schema="addressSchema"
      :validator="addressValidator"
      :show-submit-button="false"
      :submit-handler="addAddress"
      >
    </Enforma>
    <div class="flex justify-end gap-2">
      <Button type="button" label="Cancel" severity="secondary" @click="showAddressModal = false"></Button>
      <Button type="button" label="Add address" @click="modalForm?.submit"></Button>
    </div>
  </Dialog>
</template>

<script setup>
import { Select, Dialog, Button } from 'primevue'
import { Enforma } from '../../../src/'
import { createEncolaValidator } from '../../../src/validators/encolaValidator'
import { defineProps, defineEmits, ref } from 'vue'

const props = defineProps({
  value: {type: Object, required: false, default: null},
  options: { type: Array, default: [] },
})

/**
 * - `change` and `input` are implemented because
 *   we try to keep close to the browser events
 * - `focus` and `blur` are implemented because
 *   they are attached to by default be Enforma
 * - `new_address` is a custom event that you might hook into
 *   to update the list of addresses inside the form
 */
const emit = defineEmits('change', 'input', 'blur', 'focus', 'new_address')

// internal model
const selectedAddress = ref(props.value)

/**
 * internal options for the address Select component
 * alternatively you could use the @new_address event to update the address list
 * inside the form (for example if the address list is reused by another component)
 */
const selectOptions = ref([...props.options])

const showAddressModal = ref(false)

function getAddressAsText(address) {
  if (!address || !address.address) {
    return null
  }

  return Object.values(address).filter((i) => i).join(', ')
}

const addressSchema = {
  address: {
    label: 'Address (street, building)',
    inputProps: {
      class: 'w-full',
    }
  },
  city: {
    label: 'City',
    inputProps: {
      class: 'w-full',
    }
  },
  state: {
    label: 'State',
    inputComponent: 'select',
    inputProps: {
      class: 'w-full',
      placeholder: 'Select...',
      options: ['AB', 'CA', 'WA']
    }
  },
  zip: {
    label: 'Zip',
    inputProps: {
      type: 'number',
      class: 'w-full',
    }
  },
}

// reference for the form inside the modal
const modalForm = ref(null)

// initial data for the form
let newAddress = {}

// validation rules
const addressValidator = createEncolaValidator({
  address: 'required',
  city: 'required',
  state: 'required',
  zip: 'required',
})

// submit handler called if validation passes
function addAddress(address) {
  address.country = 'USA'
  selectOptions.value.push(address)
  // emit `new_address` event
  emit('new_address', address)
  // change value in <Select>
  selectedAddress.value = address
  // this is needed to communicate the value has changed
  // as the previous line is not enough
  emit('change', {value: selectedAddress})
  // hide the modal
  showAddressModal.value = false
  // reset form data
  newAddress = {}
}

</script>

<style>
.enforma-field-wrapper {
  margin-bottom: 0.5rem;

}
</style>