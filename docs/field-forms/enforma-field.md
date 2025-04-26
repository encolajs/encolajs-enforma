# `<EnformaField/>` Component

<TabNav :items="[
{ label: 'Usage', link: '/field-forms/enforma-field' },
{ label: 'API', link: '/field-forms/enforma-field_api' },
]" />

`EnformaField` is the core component for rendering individual form fields. It handles state management, validation, and UI rendering for a single form input.

This component automatically connects to the form state management system to track:

- Field value
- Validation state
- Dirty state (whether the field has been changed)
- Touched state (whether the field has been interacted with)


## Basic Usage

```vue
<template>
  <Enforma :data="formData" :submitHandler="submit">
    <EnformaField 
      name="firstName"
      ... rest of the props go here
      ... when NOT using schema+fields rendering mode
      inputComponent="input"
    />
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
const formData = ref({
  firstName: ''
})

function submit(data) {
  console.log('Form submitted:', data)
}
</script>
```

## The `inputComponent` Prop

This prop determines the type of component to be used for the input part of the field. This can be:
- A basic HTML tag like `input` or `textarea`
- A component globally registered within the Vue app (eg: 'InputText')
- A component supported by a preset (see [the PrimeVue preset](/presets/primevue.md))
- An actual input-type component imported in your Vue component:

```vue
<template>
  <Enforma ... ommited for brevity ... >
    <EnformaField
      name="firstName"
      label="First Name"
      :inputComponent="InputText"
      :inputProps="propsToBePassedToTheInputComponent"
    />
  </Enforma>
</template>

<script setup>
import { InputText } from 'your-ui-library-of-choice'  
</script>
```

### Input Components

The `EnformaField` component is generic and, while it has opinions on the layout of the field, it requires you to "bring your own" input fields. More about this in the [UI Library Integration](/ui-library-integration/) section.


## Conditional Rendering

### Component-based forms

Use Vue's native `v-if` directive on the `EnformaField` component
```vue
<EnformaField 
  v-if="formData.hasAccount"
  name="accountDetails" 
  label="Account Details"
/>
```

### Schema-based forms
Use the `if` property in the field schema definition
```js
const schema = {
  hasAccount: {
    label: 'Do you have an existing account?',
    type: 'field',
    component: 'checkbox'
  },
  accountDetails: {
    label: 'Account Details',
    type: 'field',
    if: '{{ formData.hasAccount }}' // Conditional rendering based on field value
  }
}
```
