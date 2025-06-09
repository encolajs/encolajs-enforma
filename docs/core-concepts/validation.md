# Validation System

Enforma provides a comprehensive validation system powered by EncolaJS Validator, ensuring data integrity while maintaining a smooth user experience.

Enforma's validation approach focuses on:

- **Immediate feedback** - Issues are detected and reported as users interact with the form
- **Clear error messages** - Helpful, specific messages guide users to correct issues
- **Localization** - Support for internationalized validation messages
- **Cross-field validation** - Fields can be validated in relation to one another

## Form Validation

Enforma supports validation at multiple levels:

1. **Form-level validation** - Rules and messages passed to the `<Enforma>` component
2. **Field-level validation** - Rules and messages specified on individual `<EnformaField>` components  
3. **Schema-level validation** - Rules and messages defined in form schemas

### Form-Level Validation

Forms receive 2 key props related to validation:

- `rules` - Validation rules using the pipe notation
- `customMessages` - Optional custom error messages

Validation rules are specified using the pipe notation, making it easy to chain multiple rules:

```vue
<template>
   <Enforma v-bind=formProps>
    ... form content goes here ...
  </Enforma>
</template>

<script setup>
const formProps = {
  data: {
    email: '',
    password: ''
  },
  rules: {
    email: 'required|email',
    password: 'required|min:8|same_as:@password_confirmation',
    password_confirmation: 'required'
  },
  customMessages: {
    'email.required': 'Please provide your email address',
    'password.min': 'Password must be at least 8 characters',
    'password.same_as': 'Passwords must match',
  }
};
</script>
```

### Field-Level Validation

You can specify validation rules and custom error messages directly on individual `<EnformaField>` components using the `rules` and `messages` props:

```vue
<template>
  <Enforma :data="formData" :submitHandler="submit">
    <EnformaField 
      name="email"
      label="Email"
      inputComponent="input"
      rules="required|email"
      :messages="{
        required: 'Email is required',
        email: 'Please enter a valid email address'
      }"
    />
    <EnformaField 
      name="phone"
      label="Phone"
      inputComponent="input"
      rules="required|phone"
      :messages="{
        required: 'Phone number is required',
        phone: 'Please enter a valid phone number'
      }"
    />
  </Enforma>
</template>
```

### Validation Precedence

When validation rules and messages are specified at multiple levels, they are merged with the following precedence (highest to lowest):

1. **Form-level** - Rules and messages passed to the `<Enforma>` component via `rules` and `messages` props
2. **Field-level** - Rules and messages specified on individual `<EnformaField>` components

This flexibility allows you to define base validation in schemas or field components while overriding specific rules or messages at the form level when needed.

> [!WARNING] Rules and messages defined in the form schema should not be overwritten at form level

## Built-in Validators

Enforma uses EncolaJS Validator for all validation needs. For a complete list of available validation rules and their usage, visit [EncolaJS Validator Documentation](https://encolajs.com/validator/).

Common validation rules include:

- `required` - Field must not be empty
- `email` - Must be a valid email address
- `gt:{value}` - Minimum value (exclusive)
- `gte:{value}` - Minimum value (inclusive)
- `date:{format}` - Must be a valid date
- `number` - Must be a number
- ... and [many more](https://encolajs.com/validator/guide/validation-rules.html)

## Cross-field Validation

Enforma supports validators that reference other field values through the pipe notation:

```js
const formConfig = {
  data: {
    password: '',
    password_confirmation: ''
  },
  rules: {
    password: 'required|min:8|same_as:@password_confirmation',
    password_confirmation: 'required'
  }
};
```

## Async Validation

The **EncolaJS Validator** library is async by default so any function that returns a boolean-resolving `Promise` can be used as a validation rule.

For implementing an server-calling validation rule check out the ["Async Validation" recipe](/recipes/async-validation.md)

## Validation Architecture

The validation system consists of:

1. **Validators** - Functions that test field values against specific rules
2. **Validation Engine** - Coordinates validation execution and result tracking
3. **Error Message System** - Generates and manages user-friendly error feedback
4. **Validation UI Integration** - Connects validation results with visual feedback