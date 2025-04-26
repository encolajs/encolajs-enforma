# EnformaRepeatable

<TabNav :items="[
{ label: 'Usage', link: '/field-forms/enforma-repeatable' },
{ label: 'API', link: '/field-forms/enforma-repeatable_api' },
]" />

`EnformaRepeatable` provides a way to create repeatable groups of fields. This is ideal for handling arrays of objects in your form data, such as multiple addresses, contact details, or any list of similar items.

## Basic Usage

### Using Fields and the Default Slot 

This gives you full and instant control over the layout of the repeatable

```vue
<template>
  <Enforma :data="formData" :submitHandler="submit">
    <EnformaRepeatable name="contacts" add-label="Add Contact">
      <template
        #default="{ value, add, remove, canAdd, moveUp, moveDown, count }"
      >
        <div class="contact-item" v-for="(contact, index) in value" :key="index">
          <h4>Contact {{ index + 1 }}</h4>
          <EnformaField :name="`contacts.${index}.name`" label="Name" />
          <EnformaField :name="`contacts.${index}.email`" label="Email" />
          <EnformaField :name="`contacts.${index}.phone`" label="Phone" />
        </div>
        <button @click="add({})">Add contact</button>
      </template>
    </EnformaRepeatable>
  </Enforma>
</template>

<script setup>
import { ref } from 'vue';
import { Enforma, EnformaRepeatable, EnformaField, EnformaSubmitButton } from '@encolajs/enforma';

const formData = ref({
  contacts: [
    { name: '', email: '', phone: '' }
  ]
});

function submit(data) {
  console.log('Form submitted:', data);
}
</script>
```

### Using the Subfields Prop

This is simpler and fits most of the cases. The `subfiels` format has to match the [field schema definitions](/schema-forms/schema-reference.md#field-schema)

```vue
<EnformaRepeatable
  name="contacts"
  type="repeatable"
  :subfields="{
    name: { label: 'Name' },
    email: { label: 'Email' },
    phone: { label: 'Phone' }
  }"
  :allowSort="false" 
/>
```

## Array Notation

The repeatable component uses dot notation for field names. The general pattern is:

```
arrayName.index.fieldName
```

For example:
- `contacts.0..name`
- `addresses.2.street`
- `products.1.quantity`

## Validation

You can validate repeatable items:

```vue
<template>
  <Enforma :data="formData" :rules="rules">
    <EnformaRepeatable name="contacts">
      <template #default="{ index }">
        <EnformaField 
          :name="`contacts.${index}.name`" 
          label="Name" 
        />
        <EnformaField 
          :name="`contacts.${index}.email`" 
          
          label="Email" 
        />
      </template>
    </EnformaRepeatable>
  </Enforma>
</template>

<script setup>
// Validation for repeatable items uses array notation
const rules = {
  'contacts.*.name': ['required'],
  'contacts.*.email': ['required', 'email']
};
</script>
```