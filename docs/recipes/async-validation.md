# Async Validation

Asynchronous validation is essential for validating data against external sources like databases or APIs. Enforma provides robust support for async validation, allowing you to create seamless user experiences even when validation requires server interaction.

## Creating an Async Validator

Async validators are defined as functions that return a Promise:

### Extend the ValidationRule Class

```js
// file: @/validators/uniqueUsername
export default async function(
    value: any,
    path: string,
    data: object
): boolean | Promise<boolean> {
  // use the `required` to ensure the the field is filled
  // all other rules should assume an empty non-required value is valid
  if (!value) return true; 

  try {
    const response = await fetch(`/api/check-username?username=${value}`);

    if (!response.ok) {
      // Log error but don't fail validation if server errors
      console.error('Server error during validation:', response.status);
      return true; // Skip validation rather than fail
    }

    const data = await response.json();
    return data.isAvailable;
  } catch (error) {
    console.error('Validation request failed:', error);
    return true; // Skip validation on network errors
  }
}
```

### Add the ValidationRule to Enforma's configuration
```js
import { EnformaPlugin } from '@encolajs/enforma'
import uniqueUsername from '@/validators/uniqueUsername'

// VueJS app intialization goes here
app.use(EnformaPlugin, {
  rules: {
    unique_username: uniqueUsername
  },
  messages: {
    unique_username: 'This username is already taken'
  }
})
```

### Using Async Validators

Use async validators like regular validators:

```vue
<template>
  <Enforma :data="formData" :validator="validator" :submitHandler="submit">
    ... here goes the form's content...
  </Enforma>
</template>

<script setup>
import { ref } from 'vue';
import { createEncolaValidator } from '@encolajs/enforma/validators/encola'

const formData = ref({
  username: '',
  email: ''
})

const validator = createEncolaValidator({
  username: 'required|unique_username',
  email: 'required|email',
})

function submit(data) {
  console.log('Form submitted:', data);
}
</script>
```

## Debounced Validation

To prevent excessive validations during typing the Enforma library uses a standard 200ms debounce for validation calls regardless of the validation rule's type (completely client-side or not). 

> [!IMPORTANT] If you want to change this you must use a debounced validation function for the validator.

## Handling Loading States

Show loading state during async validation:

```vue
<template>
  <Enforma :data="formData">
    <HeadlessField name="username">
      <template #default="{ value, errors, updateValue, validating }">
        <div class="field-container">
          <label>Username</label>
          <div class="input-wrapper">
            <input 
              :value="value" 
              @input="e => updateValue(e.target.value)" 
            />
            <span v-if="validating" class="loading-spinner"></span>
          </div>
          <div v-if="errors.length" class="error-message">
            {{ errors[0] }}
          </div>
        </div>
      </template>
    </HeadlessField>
  </Enforma>
</template>
```

> [!WARNING]
> We think loading indicators for server-side based validation rules are not good UX so the `<EncolaField/>` component does not offer support for it.
> If you want to do this, you have to create your [own field component](/extensibility/custom-components.md).
