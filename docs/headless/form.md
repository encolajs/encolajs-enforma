# Headless Form

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

EncolaJS provides both a headless form composable (`useForm`) and a component wrapper (`HeadlessForm`) for complete control over your form's UI while maintaining robust state management and validation capabilities.

## Using the useForm Composable

The `useForm` composable is the core of the form system, providing full programmatic control:

```vue
<script setup>
import { useForm } from '@encolajs/enforma';

// Initial form data
const initialData = {
  name: '',
  email: '',
  preferences: {
    newsletter: false,
    marketing: false
  }
};

// Validation rules
const validationRules = {
  name: 'required',
  email: 'required|email'
};

// Create form controller
const form = useForm(initialData, validationRules, {
  // Optional configuration
  submitHandler: async (data, formController) => {
    try {
      await api.submitData(data);
    } catch (error) {
      if (error.response?.status === 422) {
        formController.setErrors(error.response.data.errors);
      }
      throw error;
    }
  },
  onValidationError: (form) => {
    console.error('Validation failed');
  },
  onSubmitSuccess: (data) => {
    console.log('Form submitted successfully', data);
  },
  onSubmitError: (error, form) => {
    console.error('Form submission failed', error);
  },
  useGlobalEvents: false,
  validateOn: 'change'
});

// Subscribe to events
const subscription = form.on('field_changed', ({ path, value }) => {
  console.log(`Field ${path} changed to ${value}`);
});

// Clean up subscriptions when component unmounts
onBeforeUnmount(() => {
  subscription.off();
});

// Handle form submission
async function submitForm() {
  const success = await form.submit();
  
  if (success) {
    // Further actions on success
  }
}
</script>

<template>
  <form @submit.prevent="submitForm">
    <div>
      <label for="name">Name</label>
      <input 
        id="name" 
        v-model="form.name" 
        @focus="form.setFieldFocused('name')" 
        @blur="form.setFieldBlurred('name')" 
      />
      <div v-if="form['name.$errors'].length">
        {{ form['name.$errors'][0] }}
      </div>
    </div>
    
    <div>
      <label for="email">Email</label>
      <input 
        id="email" 
        v-model="form.email" 
        @focus="form.setFieldFocused('email')" 
        @blur="form.setFieldBlurred('email')" 
      />
      <div v-if="form['email.$errors'].length">
        {{ form['email.$errors'][0] }}
      </div>
    </div>
    
    <button type="submit" :disabled="form.$isSubmitting">
      {{ form.$isSubmitting ? 'Submitting...' : 'Submit' }}
    </button>
    <button type="button" @click="form.reset()">Reset</button>
  </form>
</template>
```

## Using the HeadlessForm Component

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
      <!-- Custom form UI -->
      <form @submit.prevent="form.submit">
        <div>
          <label for="name">Name</label>
          <input id="name" v-model="form.name" />
          <div v-if="form['name.$errors'].length">
            {{ form['name.$errors'][0] }}
          </div>
        </div>
        
        <button type="submit">Submit</button>
        <button type="button" @click="form.reset">Reset</button>
      </form>
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

function handleFieldChange(path, value, fieldState, formController) {
  // Handle field change
}
</script>
```

## Form Controller API

The form controller returned by `useForm` provides these methods and properties:

### State Properties

| Property | Type | Description |
|----------|------|-------------|
| `$stateVersion` | `{ value: number }` | A reactive reference tracking form state changes |
| `$isValidating` | `boolean` | Whether the form is currently validating |
| `$isSubmitting` | `boolean` | Whether the form is currently submitting |
| `$isDirty` | `boolean` | Whether any field has been modified |
| `$isTouched` | `boolean` | Whether any field has been touched/focused |

### State Management Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `values()` | - | `object` | Gets the current form values |
| `errors()` | - | `object` | Gets all form errors by field path |
| `reset()` | - | `void` | Resets form to initial state |
| `validate()` | - | `Promise<boolean>` | Validates all fields |
| `validateField(path)` | `path: string` | `Promise<boolean>` | Validates a specific field |

### Field Management Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `setFieldValue(path, value, validate, stateChanges)` | `path: string, value: any, validate?: boolean, stateChanges?: object` | `Promise<void>` | Sets a field value |
| `setFieldErrors(path, errors)` | `path: string, errors: string[]` | `void` | Sets errors for a specific field |
| `setErrors(errors)` | `errors: Record<string, string[]>` | `void` | Sets errors for multiple fields |
| `setFieldFocused(path)` | `path: string` | `void` | Marks a field as focused |
| `setFieldBlurred(path)` | `path: string` | `void` | Marks a field as blurred |
| `getField(path)` | `path: string` | `FieldState` | Gets a field's state |
| `removeField(path)` | `path: string` | `void` | Removes a field from the form |
| `hasField(path)` | `path: string` | `boolean` | Checks if a field exists |

### Array Operations

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `add(arrayPath, index, item)` | `arrayPath: string, index: number, item: any` | `void` | Adds an item to an array |
| `remove(arrayPath, index)` | `arrayPath: string, index: number` | `void` | Removes an item from an array |
| `move(arrayPath, fromIndex, toIndex)` | `arrayPath: string, fromIndex: number, toIndex: number` | `void` | Moves an item in an array |
| `sort(arrayPath, callback)` | `arrayPath: string, callback: (a, b) => number` | `void` | Sorts array items |

### Event Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `on(event, handler)` | `event: string, handler: Function` | `{ off: Function }` | Subscribes to an event |
| `off(event, handler)` | `event: string, handler?: Function` | `void` | Unsubscribes from an event |
| `emit(event, data)` | `event: string, data: any` | `void` | Emits a custom event |

## Field State

Each field in the form has the following state properties:

| Path | Type | Description |
|------|------|-------------|
| `fieldPath` | `any` | Direct access to field value |
| `fieldPath.$errors` | `string[]` | Validation error messages |
| `fieldPath.$isDirty` | `boolean` | Field has been modified |
| `fieldPath.$isTouched` | `boolean` | Field has been focused/interacted with |
| `fieldPath.$isValidating` | `boolean` | Field is currently validating |
| `fieldPath.$isValid` | `boolean` | Computed property: field has no errors |

## useForm Options

The `useForm` composable accepts these configuration options:

| Option | Type | Description |
|--------|------|-------------|
| `submitHandler` | `(data: any, formController: FormController) => Promise<void> \| void` | Form submission handler |
| `onValidationError` | `(form: FormController) => void` | Called when validation fails |
| `onSubmitSuccess` | `(data: any) => void` | Called on successful submission |
| `onSubmitError` | `(error: any, form: FormController) => void` | Called when submission fails |
| `validatorFactory` | `ValidatorFactory` | Custom validator factory |
| `customMessages` | `object` | Custom validation messages |
| `validateOn` | `'input' \| 'change' \| 'blur' \| 'submit'` | When to validate fields |
| `useGlobalEvents` | `boolean` | Whether to use global event emitter |

## Advanced Server-Side Validation

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

## Building Custom Components with useForm

The headless nature of `useForm` allows you to build custom components:

```vue
<script setup>
import { defineProps, defineEmits, ref, computed, watch } from 'vue';
import { useForm } from '@encolajs/enforma';

const props = defineProps({
  // Your component props
  initialData: {
    type: Object,
    required: true
  },
  validationRules: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['submit', 'validation-error']);

// Create form
const form = useForm(
  props.initialData,
  props.validationRules,
  {
    onValidationError: (form) => {
      emit('validation-error', form.errors());
    },
    submitHandler: async (data, formController) => {
      // Emit the submit event with data and controller
      emit('submit', data, formController);
    }
  }
);

// Expose the form controller to parent components
defineExpose({
  form
});

// Watch for external data changes
watch(
  () => props.initialData,
  (newData) => {
    // Handle external data changes
  },
  { deep: true }
);

// Process form errors for template
const formattedErrors = computed(() => {
  // Process form.errors() into a format suitable for your UI
  return Object.entries(form.errors()).map(([field, errors]) => ({
    field,
    message: errors[0]
  }));
});

// Field-specific computed properties
const nameField = computed(() => ({
  value: form.name,
  errors: form['name.$errors'],
  isDirty: form['name.$isDirty'],
  isTouched: form['name.$isTouched']
}));
</script>

<template>
  <div class="custom-form">
    <slot name="errors" :errors="formattedErrors">
      <!-- Default error display -->
      <ul v-if="formattedErrors.length" class="error-list">
        <li v-for="error in formattedErrors" :key="error.field" class="error-item">
          {{ error.message }}
        </li>
      </ul>
    </slot>
    
    <form @submit.prevent="form.submit">
      <slot 
        :form="form" 
        :name-field="nameField"
        :submit="form.submit"
        :reset="form.reset"
        :is-submitting="form.$isSubmitting"
      >
        <!-- Fallback content -->
      </slot>
    </form>
  </div>
</template>
```