# Validation Customization

Enforma provides a flexible validation system that can be customized to fit your specific requirements. This guide explores how to extend and customize validation behavior.

## Custom Validators

### Creating a Custom Validator

Custom validators are functions that evaluate a field value and return a boolean or a Promise:

```js
// Simple synchronous validator
const isEven = {
  name: 'even',
  validate: (value) => Number(value) % 2 === 0,
  message: 'Value must be an even number'
};

// Async validator with API check
const isUniqueUsername = {
  name: 'uniqueUsername',
  validate: async (value, { api }) => {
    if (!value) return true; // Skip validation if empty
    
    try {
      const response = await api.checkUsernameAvailability(value);
      return response.isAvailable;
    } catch (error) {
      console.error('Username validation error:', error);
      return false;
    }
  },
  message: 'This username is already taken'
};
```

### Using Custom Validators

Add custom validators to individual fields:

```vue
<template>
  <Enforma :data="formData">
    <EnformaField 
      name="value" 
      type="number" 
      label="Even Number" 
      :rules="[isEven]" 
    />
    
    <EnformaField 
      name="username" 
      label="Username" 
      :rules="['required', isUniqueUsername]" 
    />
  </Enforma>
</template>

<script setup>
import { isEven, isUniqueUsername } from './validators';
</script>
```

### Registering Global Validators

Register custom validators globally for use throughout your application:

```js
import { createEnforma } from 'encolajs-formkit';

const formKit = createEnforma({
  validators: {
    even: {
      validate: (value) => Number(value) % 2 === 0,
      message: 'Value must be an even number'
    },
    uniqueUsername: {
      validate: async (value) => {
        // Implementation
        return isAvailable;
      },
      message: 'This username is already taken'
    }
  }
});
```

Then use by name:

```vue
<EnformaField 
  name="value" 
  type="number" 
  validators="required|even" 
/>
```

## Dynamic Validation Messages

### Context-Aware Messages

Create messages that incorporate field values:

```js
const passwordMatchValidator = {
  name: 'passwordMatch',
  validate: (value, { form }) => value === form.password,
  message: 'Passwords do not match'
};

// With dynamic message function
const minLengthValidator = {
  name: 'minLength',
  validate: (value, { params }) => value.length >= params[0],
  message: (value, { params }) => 
    `Must be at least ${params[0]} characters (currently ${value.length})`
};
```

### Internationalized Messages

Integrate with i18n systems:

```js
import { useI18n } from 'vue-i18n';

// In your setup function
const { t } = useI18n();

const validators = {
  required: {
    validate: (value) => !!value && value.trim() !== '',
    message: () => t('validation.required')
  },
  email: {
    validate: (value) => /\S+@\S+\.\S+/.test(value),
    message: () => t('validation.email')
  }
};
```

## Validation Triggers

### Customizing When Validation Runs

Control when validation occurs:

```vue
<template>
  <!-- Form-level validation triggers -->
  <Enforma 
    :data="formData" 
    :validateOn="['blur', 'submit']"
  >
    <!-- Field-level override -->
    <EnformaField 
      name="creditCard" 
      label="Credit Card" 
      :validateOn="['blur']" 
    />
    
    <!-- Immediate validation -->
    <EnformaField 
      name="email" 
      label="Email" 
      :validateOn="['input']" 
    />
  </Enforma>
</template>
```

### Manual Validation

Trigger validation programmatically:

```vue
<template>
  <Enforma ref="form" :data="formData">
    <!-- Fields -->
  </Enforma>
  
  <button @click="validateForm">Validate</button>
</template>

<script setup>
import { ref } from 'vue';

const form = ref(null);

async function validateForm() {
  const isValid = await form.value.validate();
  if (isValid) {
    // Proceed with submission
  }
}
</script>
```

## Cross-Field Validation

### Dependent Validation

Validate fields based on other field values:

```js
const validators = {
  endDate: [
    'required',
    'date',
    {
      name: 'afterDate',
      validate: (value, { form }) => {
        if (!value || !form.startDate) return true;
        return new Date(value) > new Date(form.startDate);
      },
      message: 'End date must be after start date'
    }
  ]
};
```

### Form-Level Validation

Validate the entire form:

```js
const formValidators = {
  // Regular field validators
  name: ['required'],
  email: ['required', 'email'],
  
  // Form-level validator
  $form: [
    {
      name: 'validTotal',
      validate: (form) => {
        const total = form.items.reduce((sum, item) => sum + item.amount, 0);
        return total === form.expectedTotal;
      },
      message: 'Item amounts do not match the expected total'
    }
  ]
};
```

## Integration with Validation Libraries

### Using External Validators

Integrate with popular validation libraries:

```js
// With Yup
import * as yup from 'yup';

const schema = yup.object({
  name: yup.string().required(),
  email: yup.string().email().required(),
  age: yup.number().min(18).required()
});

const yupValidator = {
  name: 'yup',
  validate: async (value, { field, form }) => {
    try {
      await schema.validateAt(field, form);
      return true;
    } catch (error) {
      return false;
    }
  },
  message: (value, { field, error }) => error?.message || 'Invalid value'
};
```

### Creating Adapter Validators

Build adapters for different validation systems:

```js
// Adapter for EncolaJS Validator
import { validate } from '@encolajs/validator';

function createEncolaValidator(rules) {
  return {
    name: 'encolaValidator',
    validate: async (value, { field, form }) => {
      const fieldRules = rules[field];
      if (!fieldRules) return true;
      
      const result = await validate(value, fieldRules);
      return result.valid;
    },
    message: (value, { field, error }) => error?.message || 'Validation failed'
  };
}
```

## Best Practices

- Create reusable validators for common patterns
- Keep validation logic separate from component code
- Use appropriate validation triggers for each field type
- Provide clear, actionable error messages
- Test validators with edge cases and invalid inputs
- Consider accessibility in validation feedback
- Balance client and server validation for sensitive data