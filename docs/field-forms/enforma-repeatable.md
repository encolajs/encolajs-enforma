# EnformaRepeatable

<TabNav :items="[
{ label: 'Usage', link: '/field-forms/enforma-repeatable' },
{ label: 'API', link: '/field-forms/enforma-repeatable_api' },
]" />

`EnformaRepeatable` provides a way to create repeatable groups of fields. This is ideal for handling arrays of objects in your form data, such as multiple addresses, contact details, or any list of similar items.

## Basic Usage

```vue
<template>
  <Enforma :data="formData" :submitHandler="submit">
    <EnformaRepeatable name="contacts" add-label="Add Contact">
      <template #default="{ index }">
        <div class="contact-item">
          <h4>Contact {{ index + 1 }}</h4>
          <EnformaField :name="`contacts.${index}.name`" label="Name" />
          <EnformaField :name="`contacts.${index}.email`" label="Email" />
          <EnformaField :name="`contacts.${index}.phone`" label="Phone" />
        </div>
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

## Array Notation

The repeatable component uses dot notation for field names. The general pattern is:

```
arrayName.index.fieldName
```

For example:
- `contacts.0..name`
- `addresses.2.street`
- `products.1.quantity`

## Adding Controls

By default, `EnformaRepeatable` provides add, remove, and move buttons, but you can customize them:

```vue
<template>
  <Enforma :data="formData">
    <EnformaRepeatable 
      name="skills" 
      add-label="Add Another Skill" 
      :min="1" 
      :max="5"
    >
      <template #default="{ index, remove }">
        <div class="skill-row">
          <EnformaField :name="`skills.${index}.name`" label="Skill Name" />
          <EnformaField 
            :name="`skills.${index}.level`" 
            inputComponent="select" 
            label="Skill Level" 
            :options="['Beginner', 'Intermediate', 'Advanced', 'Expert']" 
          />
          <button 
            type="button" 
            class="remove-btn" 
            @click="remove"
          >
            Remove
          </button>
        </div>
      </template>
      
      <!-- Custom add button -->
      <template #add-button="{ add, canAdd }">
        <button 
          type="button" 
          class="custom-add-btn" 
          @click="add" 
          :disabled="!canAdd"
        >
          <i class="plus-icon"></i> Add New Skill
        </button>
      </template>
    </EnformaRepeatable>
  </Enforma>
</template>
```

## Default Values for New Items

Specify default values for new items with the `addItemTemplate` prop:

```vue
<template>
  <Enforma :data="formData">
    <EnformaRepeatable 
      name="addresses" 
      :addItemTemplate="addressTemplate"
    >
      <template #default="{ index }">
        <EnformaField :name="`addresses.${index}.street`" label="Street" />
        <EnformaField :name="`addresses.${index}.city`" label="City" />
        <EnformaField :name="`addresses.${index}.country`" label="Country" />
        <EnformaField :name="`addresses.${index}.isPrimary`" type="checkbox" label="Primary Address" />
      </template>
    </EnformaRepeatable>
  </Enforma>
</template>

<script setup>
const addressTemplate = {
  street: '',
  city: '',
  country: 'United States',
  isPrimary: false
};
</script>
```

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