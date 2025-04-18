# Build Your Own Wrapper Components

EncolaJS provides a powerful way to create custom wrapper components that leverage the headless field functionality while giving you complete control over the UI and behavior. This guide will walk you through creating your own wrapper components.

## Overview

Wrapper components are Vue components that wrap the headless field components (`HeadlessField`, `HeadlessRepeatable`, etc.) to provide a consistent UI and behavior across your application. They help reduce boilerplate code and ensure consistency in your form implementation.

## Basic Wrapper Component Example

Here's a basic example of a wrapper component that wraps `HeadlessField`:

```vue
<template>
  <div v-bind="$attrs">
    <HeadlessField :name="name">
      <template #default="{ value, attrs, error, events, id }">
        <label v-if="label" class="block" :for="id">{{ label }}</label>
        <slot
          :value="value"
          :attrs="attrs"
          :error="error"
          :events="events"
          :id="id"
        />
        <div v-if="error"
             :id="attrs['aria-errormessage']"
             class="text-red-500">
          {{ error }}
        </div>
      </template>
    </HeadlessField>
  </div>
</template>

<script setup>
import { HeadlessField } from '@encolajs/enforma'

defineProps({
  name: {
    type: String,
    required: true
  },
  label: {
    type: String,
    default: null
  }
})
</script>
```

## Implementing Base Components

When implementing base components, consider these key aspects:

1. **Field State Management**: The headless components provide field state including:
   - `value`: The current field value
   - `error`: Any validation errors
   - `isDirty`: Whether the field has been modified
   - `isTouched`: Whether the field has been focused
   - `isValidating`: Whether validation is in progress
   - `isFocused`: Whether the field is currently focused

2. **Event Handling**: The headless components provide event handlers:
   - `input`: For immediate value changes
   - `change`: For committed value changes
   - `blur`: When the field loses focus
   - `focus`: When the field gains focus

3. **Accessibility**: The headless components provide accessibility attributes:
   - `aria-invalid`: For error state
   - `aria-errormessage`: For error message association
   - `id`: For label association

## Managing State and Validation

The headless components handle state management and validation automatically:

```vue
<template>
  <HeadlessField :name="name" :validate-on="validateOn">
    <template #default="{ value, validate, error }">
      <input
        :value="value"
        @blur="validate"
      />
      <div v-if="error">{{ error }}</div>
    </template>
  </HeadlessField>
</template>

<script setup>
import { HeadlessField } from '@encolajs/enforma'

defineProps({
  name: String,
  validateOn: {
    type: String,
    default: 'blur',
    validator: (value) => ['input', 'change', 'blur', 'submit'].includes(value)
  }
})
</script>
```

## Implementing Custom Behavior

You can extend the base functionality with custom behavior:

```vue
<template>
  <HeadlessField :name="name">
    <template #default="{ value, attrs, events }">
      <div class="custom-field">
        <input
          v-bind="attrs"
          v-on="events"
          :value="value"
          @input="handleCustomInput"
        />
        <div class="custom-indicator" v-if="showIndicator">
          Custom indicator
        </div>
      </div>
    </template>
  </HeadlessField>
</template>

<script setup>
import { ref } from 'vue'
import { HeadlessField } from '@encolajs/enforma'

const props = defineProps({
  name: String
})

const showIndicator = ref(false)

function handleCustomInput(event) {
  // Custom input handling
  showIndicator.value = event.target.value.length > 0
}
</script>
```

## Best Practices for Component Design

1. **Composition**: Use slots to allow customization of the field content while maintaining consistent structure.

2. **Props Design**: 
   - Keep required props minimal
   - Provide sensible defaults
   - Use TypeScript for better type safety

3. **Accessibility**:
   - Always bind the provided accessibility attributes
   - Maintain proper label associations
   - Handle error states appropriately

4. **Styling**:
   - Use CSS classes for styling
   - Allow style customization through props
   - Support theme customization

5. **Error Handling**:
   - Display validation errors clearly
   - Provide clear error messages
   - Handle edge cases gracefully

## Advanced Usage Examples

### Custom Repeatable Field Wrapper

```vue
<template>
  <HeadlessRepeatable
    :name="name"
    :min="min"
    :max="max"
    :validate-on-add="validateOnAdd"
    :validate-on-remove="validateOnRemove"
  >
    <template #default="{ value, add, remove, canAdd, moveUp, moveDown, count }">
      <div class="repeatable-field">
        <div v-for="(item, index) in value" :key="index" class="repeatable-item">
          <slot :item="item" :index="index" />
          <div class="item-actions">
            <button @click="moveUp(index)" :disabled="index === 0">↑</button>
            <button @click="moveDown(index)" :disabled="index === count - 1">↓</button>
            <button @click="remove(index)">Remove</button>
          </div>
        </div>
        <button v-if="canAdd" @click="add">Add Item</button>
      </div>
    </template>
  </HeadlessRepeatable>
</template>

<script setup>
import { HeadlessRepeatable } from '@encolajs/enforma'

defineProps({
  name: String,
  min: {
    type: Number,
    default: 0
  },
  max: Number,
  validateOnAdd: {
    type: Boolean,
    default: true
  },
  validateOnRemove: {
    type: Boolean,
    default: true
  }
})
</script>
```

### Custom Table Field Wrapper

```vue
<template>
  <HeadlessRepeatable :name="name">
    <template #default="{ value, add, remove, canAdd }">
      <table class="custom-table">
        <thead>
          <tr>
            <th v-for="header in headers" :key="header">{{ header }}</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in value" :key="index">
            <td v-for="header in headers" :key="header">
              <slot :name="header" :value="row[header]" :row="row" :index="index" />
            </td>
            <td>
              <button @click="remove(index)">Remove</button>
            </td>
          </tr>
        </tbody>
      </table>
      <button v-if="canAdd" @click="add">Add Row</button>
    </template>
  </HeadlessRepeatable>
</template>

<script setup>
import { HeadlessRepeatable } from '@encolajs/enforma'

defineProps({
  name: String,
  headers: {
    type: Array,
    required: true
  }
})
</script>
```

## Integration with Form Configuration

Wrapper components can integrate with the form's configuration system:

```vue
<template>
  <HeadlessField :name="name">
    <template #default="{ value, attrs, error }">
      <div v-bind="getConfig('pt.wrapper')">
        <label v-bind="getConfig('pt.label')">{{ label }}</label>
        <input
          v-bind="attrs"
          v-bind="getConfig('pt.input')"
          :class="{ 'is-invalid': error }"
        />
        <div v-if="error" v-bind="getConfig('pt.error')">
          {{ error }}
        </div>
      </div>
    </template>
  </HeadlessField>
</template>

<script setup>
import { HeadlessField } from '@encolajs/enforma'
import { useFormConfig } from '@encolajs/enforma'

const { getConfig } = useFormConfig()

defineProps({
  name: String,
  label: String
})
</script>
```

This documentation provides a comprehensive guide to creating wrapper components that leverage EncolaJS's headless components while giving you complete control over the UI and behavior. Remember to follow the best practices and consider accessibility, state management, and error handling in your implementations.