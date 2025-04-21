# Form Component

<!-- 
This page should provide:
1. Overview of Form component purpose and functionality
2. Props, events, and slots reference
3. Basic usage examples
4. Form state management
5. Form submission handling
6. Integration with validation
7. Common patterns and best practices
8. Advanced usage examples
-->

The Form component (`Enforma`) is the main container for your forms. It manages form state, validation, submission, and provides a context for all child components.

## Basic Usage

```vue
<template>
  <Enforma 
    :data="formData" 
    :rules="validationRules" 
    :submit-handler="handleSubmit"
  >
    <!-- Form fields here -->
    <EnformaField name="name" label="Name" />
    <EnformaField name="email" label="Email" type="email" />
    
    <!-- Buttons are automatically added by default -->
  </Enforma>
</template>

<script setup>
import { reactive } from 'vue';
import { Enforma, EnformaField } from '@encolajs/enforma';

const formData = reactive({
  name: '',
  email: ''
});

const validationRules = {
  name: 'required',
  email: 'required|email'
};

async function handleSubmit(data, formController) {
  try {
    // Submit to your API
    await api.submitForm(data);
    
    // Success! You can access the form controller here
    console.log('Form submitted with values:', data);
  } catch (error) {
    // Handle errors, including setting server validation errors
    if (error.response?.status === 422) {
      formController.setErrors(error.response.data.errors);
    }
    throw error; // Re-throw to trigger form error handling
  }
}
</script>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `Object` | Yes | The form data object |
| `rules` | `Object` | No | Validation rules object |
| `messages` | `Object` | No | Custom validation messages |
| `schema` | `Object` | No | Form schema for schema-driven forms |
| `submitHandler` | `Function` | Yes | Function to handle form submission |
| `context` | `Object` | No | Context data provided to all fields |
| `config` | `Object` | No | Form configuration object |
| `showResetButton` | `Boolean` | No | Whether to show the reset button (default: `true`) |

### Config Options

| Option | Type | Description |
|--------|------|-------------|
| `validateOn` | `string` | When to validate: 'input', 'change', 'blur', or 'submit' |
| `useGlobalEvents` | `boolean` | Whether to use global event emitter (default: `false`) |
| `components` | `Object` | Custom component overrides |
| `transformers` | `Object` | Custom transformers for various form elements |

## Events

The Form component emits the following events:

| Event | Parameters | Description |
|-------|------------|-------------|
| `submit_success` | `(data, formController)` | Emitted when form submits successfully |
| `submit_error` | `(error, formController)` | Emitted when submission fails |
| `validation_error` | `(formController)` | Emitted when validation fails |
| `reset` | `(formController)` | Emitted when form is reset |
| `field_changed` | `(path, value, fieldController, formController)` | Emitted when any field value changes |
| `field_focused` | `(path, fieldController, formController)` | Emitted when a field receives focus |
| `field_blurred` | `(path, fieldController, formController)` | Emitted when a field loses focus |
| `form-initialized` | `(formController)` | Emitted when form is initialized |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | Form state object | Main content area for form fields |
| `actions` | `{ formCtrl, formConfig }` | Button area, contains submit and reset buttons |

## Form Controller Reference

The form controller is exposed through the component ref and provides these methods:

### State Management
- `values()`: Get current form values
- `errors()`: Get all form errors
- `reset()`: Reset form to initial state
- `validate()`: Validate all fields
- `validateField(path)`: Validate a specific field

### Event Handling
- `on(event, handler)`: Subscribe to an event
- `off(event, handler)`: Unsubscribe from an event
- `emit(event, data)`: Emit a custom event

### Field Management
- `setFieldValue(path, value, validate, stateChanges)`: Set a field value
- `setFieldErrors(path, errors)`: Set errors for a field
- `setErrors(errors)`: Set errors for multiple fields
- `setFieldFocused(path)`: Mark a field as focused
- `setFieldBlurred(path)`: Mark a field as blurred
- `getField(path)`: Get a field's state
- `removeField(path)`: Remove a field

### Array Operations
- `add(arrayPath, index, item)`: Add an item to an array
- `remove(arrayPath, index)`: Remove an item from an array
- `move(arrayPath, fromIndex, toIndex)`: Move an item
- `sort(arrayPath, compareFunction)`: Sort array items

## Server-Side Validation

One of the most powerful features is the ability to handle server-side validation:

```javascript
async function handleSubmit(data, formController) {
  try {
    await api.submitForm(data);
  } catch (error) {
    if (error.response?.status === 422) {
      // Set server validation errors
      formController.setErrors({
        'email': ['This email is already taken'],
        'username': ['This username is already taken'],
        'profile.bio': ['Bio is too long']
      });
    }
    throw error;
  }
}
```

## Programmatic Event Handling

You can subscribe to form events programmatically using the form controller:

```vue
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const formRef = ref(null);
const subscriptions = [];

onMounted(() => {
  // Subscribe to events
  subscriptions.push(
    formRef.value.on('submit_success', ({ formController }) => {
      console.log('Form submitted with values:', formController.values());
    })
  );
  
  subscriptions.push(
    formRef.value.on('field_changed', ({ path, value }) => {
      if (path === 'email') {
        // Do something when email changes
        checkEmailAvailability(value);
      }
    })
  );
});

onBeforeUnmount(() => {
  // Clean up subscriptions
  subscriptions.forEach(sub => sub.off());
});
</script>

<template>
  <Enforma ref="formRef" :data="formData" :submit-handler="handleSubmit">
    <!-- Form fields -->
  </Enforma>
</template>
```

## Best Practices

1. **Use reactive data objects**: Pass a reactive object to the `data` prop to maintain reactivity.

2. **Handle submission errors**: Always handle errors in your submit handler and use `formController.setErrors()` for server validation.

3. **Clean up event subscriptions**: Unsubscribe from events when components are unmounted.

4. **Access form state through slots**: Use the default slot to access the current form state.

5. **Use events for cross-component communication**: Events allow communication between distant components.