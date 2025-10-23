# `<HeadlessForm />` API

<TabNav :items="[
{ label: 'Usage', link: '/headless-forms/form' },
{ label: 'API', link: '/headless-forms/form_api' },
]" />


A form component that provides no UI, just the form state and logic.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `Object` | Yes | The form data object |
| `validator` | `FormValidator` | No | Validator instance (created with `createEncolaValidator`, `createZodValidator`, etc.) |
| `submitHandler` | `Function` | No | Form submission handler |
| `validateOn` | `String` | No | When to validate fields |
| ~~`rules`~~ | ~~`Object`~~ | No | **DEPRECATED:** Use `validator` prop instead |
| ~~`customMessages`~~ | ~~`Object`~~ | No | **DEPRECATED:** Use `validator` prop instead |

::: warning DEPRECATED PROPS
The `:rules` and `:customMessages` props are deprecated in v1.3.0. Use the `:validator` prop with a validator factory function instead:

```vue
<script setup>
import { createEncolaValidator } from '@encolajs/enforma/validators/encola'

const validator = createEncolaValidator(
  { email: 'required|email' },
  { 'email.required': 'Email is required' }
)
</script>
<template>
  <HeadlessForm :data="formData" :validator="validator" />
</template>
```

See the [Migration Guide](/migration-guide-1_3) for complete migration instructions.
:::

## Events

| Event | Parameters | Description |
|-------|------------|-------------|
| `submit_success` | `(data, formController)` | Emitted when form submits successfully |
| `submit_error` | `(error, formController)` | Emitted when submission fails |
| `validation_fail` | `(formController)` | Emitted when validation fails |
| `reset` | `(formController)` | Emitted when form is reset |
| `field_changed` | `(path, value, fieldController, formController)` | Emitted when any field value changes |
| `field_focused` | `(path, fieldController, formController)` | Emitted when a field receives focus |
| `field_blurred` | `(path, fieldController, formController)` | Emitted when a field loses focus |
| `form_initialized` | `(formController)` | Emitted when form is initialized |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | Form state object | Slot for form content and fields |
