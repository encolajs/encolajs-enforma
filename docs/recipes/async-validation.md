# Async Validation

Asynchronous validation is essential for validating data against external sources like databases or APIs. Enforma provides robust support for async validation, allowing you to create seamless user experiences even when validation requires server interaction.

## Basic Async Validators

### Creating an Async Validator

Async validators are defined as functions that return a Promise:

```js
const isUsernameAvailable = {
  name: 'usernameAvailable',
  validate: async (value) => {
    if (!value) return true; // Skip validation if empty
    
    try {
      const response = await fetch(`/api/check-username?username=${value}`);
      const data = await response.json();
      return data.isAvailable;
    } catch (error) {
      console.error('Username validation error:', error);
      return false;
    }
  },
  message: 'This username is already taken'
};
```

### Using Async Validators

Use async validators like regular validators:

```vue
<template>
  <Enforma :data="formData" :submitHandler="submit">
    <EnformaField 
      name="username" 
      label="Username" 
      :rules="['required', isUsernameAvailable]" 
    />
    <EnformaField 
      name="email" 
      type="email" 
      label="Email" 
      :rules="['required', 'email', isEmailAvailable]" 
    />
    <EnformaSubmitButton>Register</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
import { ref } from 'vue';
import { Enforma, EnformaField, EnformaSubmitButton } from 'encolajs-formkit';
import { isUsernameAvailable, isEmailAvailable } from './validators';

const formData = ref({
  username: '',
  email: ''
});

function submit(data) {
  console.log('Form submitted:', data);
}
</script>
```

## Handling Loading States

### Loading Indicators

Show loading state during async validation:

```vue
<template>
  <Enforma :data="formData">
    <HeadlessField name="username">
      <template #default="{ value, errors, updateValue, validating }">
        <div class="field-container">
          <label>Username</label>
          <div class="input-wrapper">
            <input 
              :value="value" 
              @input="e => updateValue(e.target.value)" 
            />
            <span v-if="validating" class="loading-spinner"></span>
          </div>
          <div v-if="errors.length" class="error-message">
            {{ errors[0] }}
          </div>
        </div>
      </template>
    </HeadlessField>
  </Enforma>
</template>
```

With EnformaField, you can use slots:

```vue
<template>
  <Enforma :data="formData">
    <EnformaField 
      name="username" 
      label="Username" 
      :rules="['required', isUsernameAvailable]"
    >
      <template #suffix="{ validating }">
        <span v-if="validating" class="spinner"></span>
      </template>
    </EnformaField>
  </Enforma>
</template>
```

## Debounced Validation

### Adding Debounce

To prevent excessive API calls during typing:

```js
// In your form configuration
const formConfig = {
  validation: {
    debounce: 500 // 500ms debounce for all validations
  }
};
```

Or for specific fields:

```vue
<template>
  <Enforma :data="formData">
    <EnformaField 
      name="username" 
      label="Username" 
      :rules="['required', isUsernameAvailable]" 
      :validationDebounce="500" 
    />
  </Enforma>
</template>
```

## Advanced Async Validation

### Cross-Field Async Validation

Validate fields in relation to each other:

```js
const isPasswordConfirmed = {
  name: 'passwordConfirmed',
  validate: async (value, { form }) => {
    // Simulate server verification (could be a real API call)
    await new Promise(resolve => setTimeout(resolve, 300));
    return value === form.password;
  },
  message: 'Passwords do not match'
};
```

### Form-Level Async Validation

Validate the entire form asynchronously:

```js
const formValidators = {
  // Regular field validators
  username: ['required', isUsernameAvailable],
  email: ['required', 'email', isEmailAvailable],
  
  // Form-level validator
  $form: [
    {
      name: 'noConflictingAccounts',
      validate: async (form) => {
        if (!form.username || !form.email) return true;
        
        const response = await fetch('/api/check-account-conflicts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: form.username,
            email: form.email
          })
        });
        
        const data = await response.json();
        return !data.hasConflicts;
      },
      message: 'This username and email combination cannot be used together'
    }
  ]
};
```

## Error Handling

### Handling API Errors

Gracefully handle network issues:

```js
const isUsernameAvailable = {
  name: 'usernameAvailable',
  validate: async (value) => {
    if (!value) return true;
    
    try {
      const response = await fetch(`/api/check-username?username=${value}`);
      
      if (!response.ok) {
        // Log error but don't fail validation if server errors
        console.error('Server error during validation:', response.status);
        return true; // Skip validation rather than fail
      }
      
      const data = await response.json();
      return data.isAvailable;
    } catch (error) {
      console.error('Validation request failed:', error);
      return true; // Skip validation on network errors
    }
  },
  message: 'This username is already taken'
};
```

### Custom Error Messages

Provide dynamic error messages:

```js
const isUsernameAvailable = {
  name: 'usernameAvailable',
  validate: async (value) => {
    if (!value) return true;
    
    try {
      const response = await fetch(`/api/check-username?username=${value}`);
      const data = await response.json();
      
      // Store additional error details for the message function
      if (!data.isAvailable) {
        isUsernameAvailable.additionalInfo = data.reason;
      }
      
      return data.isAvailable;
    } catch (error) {
      return false;
    }
  },
  message: (value) => {
    // Use the stored additional info
    const reason = isUsernameAvailable.additionalInfo || 'it is already taken';
    return `Username "${value}" is not available: ${reason}`;
  },
  additionalInfo: null // Will store server response data
};
```

## Caching Validation Results

### Implementing a Validation Cache

For expensive validations, add caching:

```js
// Simple in-memory cache
const validationCache = new Map();

const isUsernameAvailable = {
  name: 'usernameAvailable',
  validate: async (value) => {
    if (!value) return true;
    
    // Check cache first
    if (validationCache.has(value)) {
      return validationCache.get(value);
    }
    
    try {
      const response = await fetch(`/api/check-username?username=${value}`);
      const data = await response.json();
      const result = data.isAvailable;
      
      // Cache the result
      validationCache.set(value, result);
      
      return result;
    } catch (error) {
      return false;
    }
  },
  message: 'This username is already taken'
};
```

## Best Practices

1. **Add Debouncing**: Prevent excessive API calls during typing
2. **Show Loading State**: Indicate validation is in progress
3. **Handle Errors Gracefully**: Network failures shouldn't necessarily fail validation
4. **Cache Results**: When appropriate, cache validation results
5. **Provide Helpful Messages**: Give clear feedback about validation issues
6. **Consider UX**: Balance immediate feedback with network efficiency
7. **Validate on Server Too**: Never trust client-side validation alone

By implementing these patterns, you can create forms with robust async validation that provide excellent user feedback while respecting server resources.