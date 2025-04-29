# `<HeadlessForm />` component

<!-- 
This page should provide:
1. Overview of useForm composable and HeadlessForm component
2. API reference for returned properties and methods
3. Basic implementation examples
4. Form state management
5. Handling validation and submission
6. Integration with fields and other components
7. Common patterns and best practices
8. Advanced usage examples
-->

<TabNav :items="[
    { label: 'Usage', link: '/headless-forms/form' },
    { label: 'API', link: '/headless-forms/form_api' },
]" />

EncolaJS provides a component wrapper (`HeadlessForm`) for complete control over your form's UI while maintaining robust state management and validation capabilities.

> :notebook_with_decorative_cover: For a complete working example check out the [headless components example](/examples/headless-components.md)

## Basic example

The `HeadlessForm` component wraps `useForm` with a Vue component interface:

```vue
<template>
  <HeadlessForm
    :data="formData"
    :rules="validationRules"
    :submit-handler="handleSubmit"
    @submit_success="handleSuccess"
    @submit_error="handleError"
    @validation_error="handleValidationError"
    @field_changed="handleFieldChange"
    @field_focused="handleFieldFocus"
    @field_blurred="handleFieldBlur"
    @form_initialized="handleInitialized"
    @reset="handleReset"
  >
    <template v-slot="form">
      <!-- Form content goes here -->
      <div>
        <label for="name">Name</label>
        <input id="name" v-model="form.name" />
        <div v-if="form['name.$errors'].length">
          {{ form['name.$errors'][0] }}
        </div>
      </div>
        
      <button type="submit">Submit</button>
      <button type="button" @click="form.reset">Reset</button>
    </template>
  </HeadlessForm>
</template>

<script setup>
import { reactive } from 'vue';
import { HeadlessForm } from '@encolajs/enforma';

const formData = reactive({
  name: '',
  email: ''
});

const validationRules = {
  name: 'required',
  email: 'required|email'
};

async function handleSubmit(data, formController) {
  // Handle submission
}

function handleSuccess(data, formController) {
  // Handle successful submission
}

function handleError(error, formController) {
  // Handle submission error
}

function handleFieldChange(path, value, fieldController, formController) {
  // Handle field change
}
</script>
```