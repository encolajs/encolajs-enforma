# EnformaForm

`EnformaForm` is the root component for creating forms with Enforma. It manages form state, validation, and submission handling.

## Basic Usage

```vue
<template>
  <EnformaForm v-model="formData" @submit="onSubmit">
    <!-- Form fields go here -->
    <EnformaField name="firstName" label="First Name" />
    <EnformaField name="lastName" label="Last Name" />
    
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </EnformaForm>
</template>

<script setup>
import { ref } from 'vue';
import { EnformaForm, EnformaField, EnformaSubmitButton } from 'encolajs-formkit';

const formData = ref({
  firstName: '',
  lastName: ''
});

function onSubmit(data) {
  console.log('Form submitted:', data);
  // Process form data
}
</script>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `modelValue` / `v-model` | `Object` | The form data object |
| `schema` | `Object` | Optional form schema for schema-based rendering |
| `validators` | `Object` | Validation rules for form fields |
| `validateOn` | `Array` | When to trigger validation (`['input', 'blur', 'submit']`) |
| `submitHandler` | `Function` | Alternative to `@submit` event for handling form submission |
| `config` | `Object` | Form configuration options |
| `preset` | `Object` | UI component preset to use |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `submit` | `formData` | Emitted when the form is submitted and validation passes |
| `update:modelValue` | `formData` | Emitted when form data changes |
| `validation-error` | `errors` | Emitted when validation fails on submission |
| `validation-success` | `formData` | Emitted when validation passes |
| `field-change` | `{ name, value }` | Emitted when any field value changes |
| `field-blur` | `{ name, value }` | Emitted when a field is blurred |
| `field-focus` | `{ name }` | Emitted when a field is focused |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | None | The main slot for form content |
| `before` | None | Content to display before the form |
| `after` | None | Content to display after the form |
| `field:[name]` | `{ fieldProps }` | Custom rendering for a specific field |

## Form Configuration

You can configure the form behavior with the `config` prop:

```vue
<template>
  <EnformaForm 
    v-model="formData" 
    :config="formConfig"
    @submit="onSubmit"
  >
    <!-- Form fields -->
  </EnformaForm>
</template>

<script setup>
const formConfig = {
  validateOn: ['blur', 'submit'], // Don't validate on input
  validateBeforeSubmit: true,
  resetAfterSubmit: false,
  fieldDefaults: {
    // Default props for all fields
    class: 'form-control',
    errorClass: 'is-invalid'
  }
};
</script>
```

## Schema-based Forms

With the `schema` prop, you can define your form structure via JSON:

```vue
<template>
  <EnformaForm v-model="formData" :schema="formSchema" @submit="onSubmit" />
</template>

<script setup>
const formSchema = {
  fields: [
    { name: 'firstName', label: 'First Name', component: 'text' },
    { name: 'lastName', label: 'Last Name', component: 'text' }
  ],
  buttons: [
    { label: 'Submit', type: 'submit' }
  ]
};
</script>
```

## Validation

Add validation with the `validators` prop:

```vue
<template>
  <EnformaForm 
    v-model="formData" 
    :validators="validators"
    @submit="onSubmit"
  >
    <!-- Form fields -->
  </EnformaForm>
</template>

<script setup>
const validators = {
  firstName: ['required'],
  lastName: ['required'],
  email: ['required', 'email'],
  password: ['required', 'min:8']
};
</script>
```

## Working with UI Presets

Use UI library presets to change the rendered components:

```vue
<template>
  <EnformaForm 
    v-model="formData" 
    :preset="primevuePreset"
    @submit="onSubmit"
  >
    <!-- Form fields -->
  </EnformaForm>
</template>

<script setup>
import { primevuePreset } from 'encolajs-formkit/presets/primevue';
</script>
```

## Accessing Form State Programmatically

Use the `useForm` composable to access form state outside of components:

```vue
<script setup>
import { useForm } from 'encolajs-formkit';

// Get a reference to a form by its ID
const { formState, validate, reset, submit } = useForm('my-form');

// Now you can control the form programmatically
function validateAndSubmitForm() {
  const isValid = await validate();
  if (isValid) {
    await submit();
  }
}
</script>
```

## Best Practices

- Always provide an initial value in your `v-model` for all form fields
- Use the `validateOn` prop to control when validation occurs
- Consider using the `EnformaSection` component to group related fields
- Use `EnformaSchema` for dynamic parts of your form
- Implement custom validation logic with validator functions when needed