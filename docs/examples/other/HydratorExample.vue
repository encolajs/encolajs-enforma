<template>
  <Enforma
    :data="data"
    :validator="validator"
    :submit-handler="submitHandler"
    :schema="schema"
  >
  </Enforma>
</template>

<script setup>
import { Enforma } from '@'
import { createEncolaValidator } from '@/validators/encolaValidator'
import { ref, watch, computed } from 'vue'
import castingManager from './useHydrator'

// Initial form data
const data = castingManager.cast({
  number: "ORD-" + Math.floor(Math.random() * 10000),
  date: new Date(),
  customer: "",
  items: [
    {
      name: "Sample Product",
      quantity: 1,
      price: 19.99
    }
  ]
}, 'order')

// Validation rules and custom messages
const validator = createEncolaValidator(
  {
    number: 'required',
    date: 'required|date',
    customer: 'required',
    'items.*.name': 'required',
    'items.*.quantity': 'required|integer|gte:1',
    'items.*.price': 'required|number|gte:0'
  },
  {
    'customer_name:required': 'Please enter the customer name',
    'items.*.name:required': 'Product name is required',
    'items.*.quantity:min': 'Quantity must be at least 1',
    'items.*.price:min': 'Price cannot be negative'
  }
)

// Form submission handler
const submitHandler = (formData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      alert('Order submitted: ' + JSON.stringify(formData))
      resolve(true)
    }, 1000)
  })
}

// Define the form schema
const schema = {
  order_section: {
    type: 'section',
    title: 'Order Information',
    titleComponent: 'h3',
    class: 'grid grid-cols-2 gap-4 mb-4',
  },
  number: {
    type: 'field',
    section: 'order_section',
    class: 'col-start-1 col-end-2',
    label: 'Order Number',
    required: true,
    inputProps: { class: 'w-full', readonly: true },
  },
  date: {
    type: 'field',
    section: 'order_section',
    class: 'col-start-2 col-end-3',
    label: 'Order Date',
    required: true,
    inputComponent: 'datepicker',
    inputProps: { class: 'w-full', dateFormat: 'yy-mm-dd', fluid: true },
  },
  customer: {
    type: 'field',
    section: 'order_section',
    class: 'col-start-1 col-end-3',
    label: 'Customer Name',
    required: true,
    inputProps: { class: 'w-full' },
  },
  items_section: {
    type: 'section',
    title: 'Order Items',
    titleComponent: 'h3',
    titleProps: { class: 'w-full' },
  },
  items: {
    type: 'repeatable_table',
    section: 'items_section',
    class: 'mb-4',
    min: 1, // Require at least one item
    defaultValue: { name: '', quantity: 1, price: 0, total: 0 },
    subfields: {
      name: {
        label: 'Product Name',
        inputComponent: 'input',
        inputProps: { fluid: true },
      },
      quantity: {
        label: 'Quantity',
        inputComponent: 'input',
        inputProps: { 
          fluid: true, 
          type: 'number',
          min: 1,
          step: 1
        },
      },
      price: {
        label: 'Price',
        inputComponent: 'input',
        inputProps: { 
          fluid: true, 
          type: 'number',
          min: 0,
          step: 0.01
        },
      },
      total: {
        label: 'Total',
        inputComponent: 'input',
        inputProps: { 
          fluid: true, 
          type: 'number',
          readonly: true
        },
      },
    },
  },
  summary_section: {
    type: 'section',
    class: 'flex justify-end mt-4',
  },
  total: {
    type: 'field',
    section: 'summary_section',
    label: 'Order Total',
    inputComponent: 'input',
    inputProps: { 
      class: 'w-48', 
      readonly: true
    },
  }
}
</script>
