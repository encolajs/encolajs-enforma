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
    { label: 'Usage', link: '/headless/form' },
    { label: 'API', link: '/headless/form_api' },
]" />

EncolaJS provides a component wrapper (`HeadlessForm`) for complete control over your form's UI while maintaining robust state management and validation capabilities.

##### :notebook_with_decorative_cover: For a complete working example check out the [Headless components example](/examples/headless-components)

## Basic example

The `HeadlessForm` component wraps `useForm` with a Vue component interface:

```vue
<template>
  <HeadlessForm
    :data="formData"
    :rules="validationRules"
    :submit-handler="handleSubmit"
    @submit-success="handleSuccess"
    @submit-error="handleError"
    @validation-error="handleValidationError"
    @field-changed="handleFieldChange"
    @field-focused="handleFieldFocus"
    @field-blurred="handleFieldBlur"
    @form-initialized="handleInitialized"
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

## Server-Side Validation

A powerful pattern is to handle API validation errors by setting form errors:

```javascript
import { useForm } from '@encolajs/enforma';

// Create form
const form = useForm(
  { email: 'test@example.com', username: 'testuser' },
  {
    email: 'required|email',
    username: 'required|min:3'
  },
  {
    async submitHandler(data, formController) {
      try {
        // Submit to API
        const response = await api.createUser(data);
        return response;
      } catch (error) {
        // Handle 422 Validation errors from API
        if (error.response?.status === 422) {
          // Process API validation errors
          const serverErrors = error.response.data.errors;
          
          // Set errors on form - will automatically trigger UI updates
          formController.setErrors(serverErrors);
          
          // Example output format from server:
          // {
          //   'email': ['This email is already registered'],
          //   'username': ['Username must be unique']
          // }
        }
        
        // Re-throw to trigger error handling
        throw error;
      }
    }
  }
);
```