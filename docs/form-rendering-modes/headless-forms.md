# Headless Forms

Headless forms provide full control over the UI by separating form behavior from presentation. This approach gives you complete freedom to customize the appearance and interaction patterns of your forms while still leveraging Enforma's powerful form state management and validation.

## Understanding Headless Forms

In the headless approach:

1. Enforma provides state management, validation, and behavior
2. You provide the UI components and markup
3. The two are connected through scoped slots and events

This is ideal for projects with custom UI requirements or when integrating with design systems.

## Basic Usage

A simple headless form looks like this:

```vue
<template>
  <HeadlessForm :data="formData" :rules="validators" :submitHandler="submit">
    <template #default="{ submitForm, formState, reset }">
      <form @submit.prevent="submitForm">
        <HeadlessField name="firstName">
          <template #default="{ value, errors, updateValue, dirty, touched }">
            <div :class="{ 'field_error': errors.length && touched }">
              <label>First Name</label>
              <input
                :value="value"
                @input="e => updateValue(e.target.value)"
                @blur="touched = true"
              />
              <div v-if="errors.length && touched" class="error-message">
                {{ errors[0] }}
              </div>
            </div>
          </template>
        </HeadlessField>
        
        <HeadlessField name="email">
          <template #default="field">
            <div :class="{ 'field_error': field.errors.length && field.touched }">
              <label>Email</label>
              <input
                type="email"
                :value="field.value"
                @input="e => field.updateValue(e.target.value)"
                @blur="field.touched = true"
              />
              <div v-if="field.errors.length && field.touched" class="error-message">
                {{ field.errors[0] }}
              </div>
            </div>
          </template>
        </HeadlessField>
        
        <div class="form-actions">
          <button type="submit" :disabled="formState.isSubmitting">
            {{ formState.isSubmitting ? 'Submitting...' : 'Submit' }}
          </button>
          <button type="button" @click="reset">Reset</button>
        </div>
      </form>
    </template>
  </HeadlessForm>
</template>

<script setup>
import { ref } from 'vue';
import { HeadlessForm, HeadlessField } from 'encolajs-formkit/headless';

const formData = ref({
  firstName: '',
  email: ''
});

const validators = {
  firstName: ['required'],
  email: ['required', 'email']
};

function submit(data) {
  console.log('Form submitted:', data);
  // Process form submission
}
</script>
```

## Headless Components

Enforma provides three core headless components:

1. **HeadlessForm** - Manages form state and behavior
2. **HeadlessField** - Handles field state and validation
3. **HeadlessRepeatable** - Manages repeatable field groups

## HeadlessForm Slot Props

The `HeadlessForm` component provides these slot props:

```ts
interface HeadlessFormSlotProps {
  // Form state object with all field values
  formState: {
    values: Record<string, any>;
    isDirty: boolean;
    isSubmitting: boolean;
    isValid: boolean;
    errors: Record<string, string[]>;
  };
  
  // Form actions
  submitForm: () => Promise<void>;
  reset: () => void;
  setFieldValue: (name: string, value: any) => void;
  validateField: (name: string) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
}
```

## HeadlessField Slot Props

The `HeadlessField` component provides these slot props:

```ts
interface HeadlessFieldSlotProps {
  // Field state
  value: any;
  errors: string[];
  dirty: boolean;
  touched: boolean;
  
  // Field actions
  updateValue: (newValue: any) => void;
  reset: () => void;
  validate: () => Promise<boolean>;
}
```

## Integrating with UI Libraries

Headless forms work seamlessly with any UI library:

```vue
<template>
  <HeadlessForm :data="formData" :submitHandler="submit">
    <template #default="{ submitForm }">
      <v-form @submit.prevent="submitForm">
        <HeadlessField name="firstName">
          <template #default="{ value, errors, updateValue }">
            <v-text-field
              label="First Name"
              :value="value"
              @input="updateValue"
              :error-messages="errors"
            />
          </template>
        </HeadlessField>
        
        <!-- More fields -->
        
        <v-btn type="submit" color="primary">Submit</v-btn>
      </v-form>
    </template>
  </HeadlessForm>
</template>
```

## Creating Reusable Field Components

For consistent form styling, create reusable field wrappers:

```vue
<!-- AppFormField.vue -->
<template>
  <HeadlessField :name="name">
    <template #default="{ value, errors, updateValue, touched }">
      <div class="form-field" :class="{ 'has-error': errors.length && touched }">
        <label v-if="label">{{ label }}</label>
        <input
          :type="type"
          :value="value"
          @input="e => updateValue(e.target.value)"
          @blur="touched = true"
          :placeholder="placeholder"
        />
        <div v-if="errors.length && touched" class="error-message">
          {{ errors[0] }}
        </div>
      </div>
    </template>
  </HeadlessField>
</template>

<script>
export default {
  props: {
    name: { type: String, required: true },
    label: { type: String, default: '' },
    type: { type: String, default: 'text' },
    placeholder: { type: String, default: '' }
  }
};
</script>
```

Then use it in your forms:

```vue
<template>
  <HeadlessForm :data="formData" :submitHandler="submit">
    <template #default="{ submitForm }">
      <form @submit.prevent="submitForm">
        <AppFormField name="firstName" label="First Name" />
        <AppFormField name="email" label="Email" type="email" />
        <!-- More fields -->
        <button type="submit">Submit</button>
      </form>
    </template>
  </HeadlessForm>
</template>
```

## When to Use Headless Forms

Headless forms are ideal when:

- You need complete control over UI design and behavior
- You're integrating with a custom design system
- You're using UI components from multiple libraries
- You have complex, custom interaction patterns
- You need to implement non-standard form controls

The headless approach gives you the freedom to create exactly the user experience you want while still benefiting from Enforma's form management capabilities.