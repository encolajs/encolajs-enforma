# Form Events

<!-- 
This page should provide:
1. Comprehensive guide to the form event system
2. Available events and their usage
3. Event propagation and handling
4. Custom event implementation
5. Integration with Vue events
6. Advanced event patterns
7. Best practices and common patterns
-->

EncolaJS Enforma provides a comprehensive event system built on the `mitt` event emitter, allowing you to respond to form actions and state changes. This system is designed to be reactive, flexible, and easy to integrate with Vue's native event handling.

## Event Types

### Form Lifecycle Events

| Event Name | Description | Parameters |
|------------|-------------|------------|
| `form_initialized` | Emitted when form is first initialized | `{ formController }` |
| `submit_success` | Emitted when form submission succeeds | `{ formController }` |
| `submit_error` | Emitted when form submission fails | `{ error, formController }` |
| `validation_error` | Emitted when form validation fails | `{ formController }` |
| `form_reset` | Emitted when form is reset | `{ formController }` |

### Field Events

| Event Name | Description | Parameters |
|------------|-------------|------------|
| `field_changed` | Emitted when field value changes | `{ path, value, fieldController, formController }` |
| `field_focused` | Emitted when field receives focus | `{ path, fieldController, formController }` |
| `field_blurred` | Emitted when field loses focus | `{ path, fieldController, formController }` |

## Subscribing to Events

### Via Form Controller

You can subscribe to events programmatically using the form controller:

```vue
<script setup>
import { ref, onMounted } from 'vue';

const formRef = ref(null);

onMounted(() => {
  // Subscribe to form submit success
  formRef.value.on('submit_success', ({ formController }) => {
    console.log('Form submitted successfully:', formController.values());
  });
  
  // Subscribe to field changes
  formRef.value.on('field_changed', ({ path, value }) => {
    console.log(`Field ${path} changed to:`, value);
  });
});
</script>

<template>
  <Enforma ref="formRef" :data="formData" :submit-handler="submitData">
    <!-- Form content -->
  </Enforma>
</template>
```

### Via Vue Component Events

Enforma also exposes events using Vue's standard event system:

```vue
<template>
  <Enforma 
    :data="formData" 
    :submit-handler="submitData"
    @submit-success="handleSuccess"
    @submit-error="handleError"
    @field-changed="handleFieldChange"
    @field-focused="handleFieldFocus"
    @field-blurred="handleFieldBlur"
    @validation-error="handleValidationError"
    @form-initialized="handleInitialized"
    @reset="handleReset"
  >
    <!-- Form content -->
  </Enforma>
</template>
```

Note that Vue component events use kebab-case naming (e.g., `field-changed`), while direct event subscriptions use snake_case (e.g., `field_changed`).

## Unsubscribing from Events

### Using the subscription object

```javascript
// The on() method returns a subscription object with an off() method
const subscription = form.on('field_changed', handler);

// Later, when you want to unsubscribe
subscription.off();
```

### Using the off method directly

```javascript
// Subscribe with a named handler
const handler = ({ path, value }) => {
  console.log(`Field ${path} changed to:`, value);
};

form.on('field_changed', handler);

// Later, unsubscribe the same handler
form.off('field_changed', handler);
```

## Creating Custom Events

You can also emit custom events using the form controller:

```javascript
// Emit a custom event
form.emit('custom_event', { 
  message: 'This is a custom event',
  data: { /* any data */ }
});

// Listen for the custom event
form.on('custom_event', (eventData) => {
  console.log(eventData.message);
});
```

## Using Global Events

By default, each form uses its own event emitter. However, you can enable global events to share event handlers across multiple forms:

```vue
<template>
  <Enforma :data="formData" :submit-handler="submitData" :config="{ useGlobalEvents: true }">
    <!-- Form content -->
  </Enforma>
</template>
```

To access the global emitter directly:

```javascript
import { globalFormEmitter } from '@encolajs/enforma';

// Listen for events from any form
globalFormEmitter.on('submit_success', ({ formController }) => {
  console.log('A form was submitted successfully');
});
```

## Server-Side Validation with Events

Events are particularly useful when handling server-side validation:

```javascript
async function submitHandler(data, formController) {
  try {
    const response = await api.submitForm(data);
    return response;
  } catch (error) {
    if (error.response?.status === 422) {
      // Handle validation errors from server
      formController.setErrors(error.response.data.errors);
      
      // The form will automatically emit a submit_error event
      // with the error and form controller
    }
    throw error;
  }
}
```

## Best Practices

1. **Use appropriate scope**: Use component events for simple cases and programmatic events for complex scenarios.

2. **Clean up event listeners**: Always unsubscribe from events when components are unmounted to prevent memory leaks.

3. **Consider event naming**: Use consistent naming conventions and avoid naming conflicts with built-in events.

4. **Minimize event handlers**: Don't overuse events, especially for things that could be handled by computed properties or watchers.

5. **Use events for cross-component communication**: Events are excellent for communicating between distant components, especially when props and direct communication aren't feasible.