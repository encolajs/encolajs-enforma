# EnformaRepeatableTable

<TabNav :items="[
{ label: 'Usage', link: '/field-forms/enforma-repeatable-table' },
{ label: 'API', link: '/field-forms/enforma-repeatable-table_api' },
]" />

`EnformaRepeatableTable` provides a table-based interface for managing repeatable groups of fields. It's perfect for editing collections of data where a tabular layout makes sense, such as order items, contact lists, or any structured data array.

It's almost identical with the `EnformaRepeatable` component with the exception that it renders the subfields in a table.

## Basic Usage

### Using the `subfields` Prop

```vue
<template>
  <Enforma :data="formData" :submitHandler="submit">
    <EnformaRepeatableTable 
      name="products" 
      :subfields="productFields"
      add-label="Add Product"
    />
    
    <EnformaSubmitButton>Place Order</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
import { ref } from 'vue';
import { Enforma, EnformaRepeatableTable, EnformaSubmitButton } from '@encolajs/enforma';

const formData = ref({
  products: [
    { name: 'Product 1', quantity: 1, price: 9.99 }
  ]
});

const productFields = {
  name: {
    type: 'text',
    label: 'Product Name',
    validators: ['required']
  },
  quantity: {
    type: 'number',
    label: 'Quantity',
    validators: ['required', 'min:1'],
    props: { min: 1 }
  },
  price: {
    type: 'number',
    label: 'Price',
    validators: ['required', 'min:0'],
    props: { min: 0, step: 0.01 }
  }
};

function submit(data) {
  console.log('Form submitted:', data);
}
</script>
```