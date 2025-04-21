# The `useForm` Composable

If the HeadlessForm component is not flexible enough, you can use the `useForm` composable to build your own forms:

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

const emit = defineEmits(['submit', 'validation_error']);

// Create form
const form = useForm(
  props.initialData,
  props.validationRules,
  {
    onValidationError: (form) => {
      emit('validation_error', form.errors());
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

