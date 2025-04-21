# Forms with a Schema

The schema-based approach allows you to define your form structure using a JSON object rather than explicit component declarations. This provides a more concise, data-driven way to create forms, especially useful for dynamic or server-defined forms.

## Basic Usage

A simple form using the schema-based approach:

```vue
<template>
  <Enforma :data="formData" :schema="formSchema" :submitHandler="submit" />
</template>

<script setup>
import { ref } from 'vue';
import { Enforma } from 'encolajs-formkit';

const formData = ref({
  firstName: '',
  lastName: '',
  email: ''
});

const formSchema = {
  fields: [
    { name: 'firstName', label: 'First Name', component: 'text' },
    { name: 'lastName', label: 'Last Name', component: 'text' },
    { name: 'email', label: 'Email Address', component: 'email' }
  ],
  buttons: [
    { label: 'Submit', type: 'submit' }
  ]
};

function submit(data) {
  console.log('Form submitted:', data);
  // Process form data
}
</script>
```

## Schema Structure

A form schema typically consists of:

### Top-level Properties

```js
const formSchema = {
  // Main field definitions
  fields: [...],
  
  // Grouped fields in sections
  sections: [...],
  
  // Repeatable field groups
  repeatables: [...],
  
  // Form buttons
  buttons: [...],
  
  // General form configuration
  config: {
    validateOn: ['blur', 'submit'],
    // Other settings
  }
};
```

### Field Definitions

Each field in the `fields` array can have these properties:

```js
{
  // Core properties
  name: 'username',              // Field name (required)
  component: 'text',             // Component type
  label: 'Username',             // Field label
  
  // Validation
  validators: ['required', 'min:3'],
  
  // Appearance
  placeholder: 'Enter username',
  helpText: 'Choose a unique username',
  
  // Behavior
  disabled: false,
  
  // Conditional display
  if: '$form.showUsername === true',
  
  // For select/radio/checkbox fields
  options: ['Option 1', 'Option 2', 'Option 3'],
  // or
  options: [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' }
  ]
}
```

### Sections

Sections group related fields:

```js
const formSchema = {
  sections: [
    {
      title: 'Personal Information',
      fields: [
        { name: 'firstName', label: 'First Name', component: 'text' },
        { name: 'lastName', label: 'Last Name', component: 'text' }
      ]
    },
    {
      title: 'Contact Details',
      fields: [
        { name: 'email', label: 'Email', component: 'email' },
        { name: 'phone', label: 'Phone', component: 'tel' }
      ]
    }
  ]
};
```

### Repeatables

For repeatable field groups:

```js
const formSchema = {
  repeatables: [
    {
      name: 'addresses',
      label: 'Addresses',
      min: 1,
      max: 5,
      fields: [
        { name: 'street', label: 'Street', component: 'text' },
        { name: 'city', label: 'City', component: 'text' },
        { name: 'zipCode', label: 'ZIP Code', component: 'text' }
      ]
    }
  ]
};
```

## Dynamic Schema Properties

Schema properties can be dynamic:

```js
const formSchema = {
  fields: [
    {
      name: 'country',
      component: 'select',
      label: 'Country',
      options: ['US', 'Canada', 'UK', 'Other']
    },
    {
      name: 'state',
      component: 'select',
      label: 'State/Province',
      if: '$form.country === "US" || $form.country === "Canada"',
      options: ($form) => getStatesByCountry($form.country)
    }
  ]
};
```

## Combining with EnformaSchema Component

You can use the `EnformaSchema` component to include schema-defined sections within field-based forms:

```vue
<template>
  <Enforma :data="formData">
    <h2>Personal Information</h2>
    <EnformaSchema :schema="personalInfoSchema" />
    
    <h2>Custom Fields</h2>
    <EnformaField name="customField" label="Custom Field" />
    
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>
```

## When to Use Schema-Based Forms

Schema-based forms are ideal when:

- Your forms are dynamically generated or server-defined
- You prefer a declarative, data-driven approach
- You need to serialize form definitions
- Your forms change structure based on application state
- You're building admin panels or form builders

The schema approach provides a concise way to define complex forms with minimal template code, making it particularly well-suited for dynamic applications.