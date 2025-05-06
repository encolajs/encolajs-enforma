# Using Custom Components

Enforma's component architecture is designed to be highly customizable, allowing you to replace and extend its core components to meet your specific requirements. This guide explains how to create and use custom components to tailor Enforma's behavior and appearance to your needs.

## Understanding Enforma's Component System

Enforma uses a component-based architecture where each form element is represented by a specific Vue component:

- **EnformaField**: Renders form fields with labels, inputs, and validation messages
- **EnformaSection**: Groups fields together
- **EnformaRepeatable**: Creates repeatable field groups
- **EnformaRepeatableTable**: Displays repeatable fields in a table format
- **EnformaSchema**: Renders forms based on JSON schema configurations
- **Button components**: Submit, reset, and various repeatable control buttons

These components are registered globally in Enforma's configuration system, making it easy to replace them with your own implementations.

## When to Create Custom Components

Consider creating custom components when you need to:

1. **Implement specialized form elements** that aren't covered by existing components
2. **Modify the default rendering** of form elements to match your design system
3. **Add additional functionality** to existing form elements
4. **Change the behavior** of how form elements interact with each other

## Registering Custom Components

### Global Registration

To register your custom components globally, use the `EnformaPlugin` configuration:

```js
import { EnformaPlugin } from '@encolajs/enforma'
import MyCustomField from './components/MyCustomField.vue'
import MyCustomRepeatable from './components/MyCustomRepeatable.vue'

app.use(EnformaPlugin, {
  components: {
    field: MyCustomField,
    repeatable: MyCustomRepeatable,
    // Other component overrides...
  }
})
```

### Form-Specific Registration

For form-specific customization, provide components via the form's `config` prop:

```vue
<template>
  <Enforma 
    :data="formData" 
    :rules="validationRules"
    :config="formConfig"
  />
</template>

<script setup>
import { ref } from 'vue'
import MyCustomField from './components/MyCustomField.vue'

const formData = ref({})
const formConfig = {
  components: {
    field: MyCustomField,
    // Other component overrides...
  }
}
</script>
```

### Using Presets

For more comprehensive customization, you can create a preset that bundles multiple custom components and configuration options:

```js
// src/presets/my-custom-preset.js
import MyCustomField from './components/MyCustomField.vue'
import MyCustomRepeatable from './components/MyCustomRepeatable.vue'
import MySubmitButton from './components/MySubmitButton.vue'
import { setGlobalConfig, getGlobalConfig } from '@encolajs/enforma'

export default function useMyCustomPreset() {
  const currentConfig = getGlobalConfig()
  
  const customPreset = {
    components: {
      field: MyCustomField,
      repeatable: MyCustomRepeatable,
      submitButton: MySubmitButton,
      // Other component overrides...
    },
    // Additional configuration...
  }
  
  // Merge with current config
  const mergedConfig = {
    ...currentConfig,
    components: {
      ...currentConfig.components,
      ...customPreset.components,
    },
    // Merge other configuration sections as needed
  }
  
  setGlobalConfig(mergedConfig)
}
```

Then use your preset in your main.js file:

```js
import { createApp } from 'vue'
import { EnformaPlugin } from '@encolajs/enforma'
import useMyCustomPreset from './presets/my-custom-preset'
import App from './App.vue'

const app = createApp(App)
app.use(EnformaPlugin)
useMyCustomPreset()
app.mount('#app')
```

## Creating Custom Components

### Custom Field Component

A custom field component replaces the default `EnformaField` component, giving you complete control over how form fields are rendered. Here's how to create one:

```vue
<!-- MyCustomField.vue -->
<template>
  <div v-bind="props.wrapperProps" class="my-custom-field">
    <!-- Custom label implementation -->
    <label 
      v-if="!props.hideLabel && props.label" 
      v-bind="props.labelProps"
      class="my-custom-label"
    >
      {{ t(props.label) }}
      <span v-if="props.required" v-bind="props.requiredProps">
        {{ requiredIndicator }}
      </span>
    </label>
    
    <!-- Input component using v-model binding -->
    <div class="my-custom-input-wrapper">
      <component
        :is="props.inputComponent"
        v-model="fieldController.value"
        v-bind="props.inputProps"
        v-on="props.inputEvents || {}"
      />
    </div>
    
    <!-- Custom error message implementation -->
    <div 
      v-if="fieldController.error" 
      class="my-custom-error"
      v-bind="props.errorProps"
    >
      {{ fieldController.error }}
    </div>
  </div>
</template>

<script setup>
import { useEnformaField } from '@encolajs/enforma/core/useEnformaField'
import { useTranslation } from '@encolajs/enforma/utils/useTranslation'
import { useFormConfig } from '@encolajs/enforma/utils/useFormConfig'

// Define the same props as EnformaField to maintain compatibility
const originalProps = defineProps({
  name: { type: String, required: true },
  label: { type: String, default: null },
  inputComponent: { 
    type: [String, Object],
    default: null 
  },
  hideLabel: { type: Boolean, default: false },
  showLabelNextToInput: { type: Boolean, default: false },
  required: { type: [Boolean, String], default: undefined },
  help: { type: String, default: null },
  useModelValue: { type: Boolean, default: false },
  // Props passed to inner elements
  labelProps: { type: Object, default: () => ({}) },
  errorProps: { type: Object, default: () => ({}) },
  helpProps: { type: Object, default: () => ({}) },
  props: { type: Object, default: () => ({}) },
  inputProps: { type: Object, default: () => ({}) },
  // These are here only because they might be passed from the schema
  section: { type: String, default: null },
  position: { type: Number, default: null },
})

// Use the Enforma field composable to access field controller
const { fieldController, props } = useEnformaField(originalProps)

// Get translation function
const { t } = useTranslation()

// Get configuration
const { getConfig } = useFormConfig()
const requiredIndicator = getConfig('pt.required.text', '*')
</script>

<style scoped>
.my-custom-field {
  margin-bottom: 1rem;
}
.my-custom-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}
.my-custom-error {
  margin-top: 0.25rem;
  color: #dc2626;
  font-size: 0.875rem;
}
</style>
```

### Custom Button Components

You can also create custom button components for form actions:

```vue
<!-- MySubmitButton.vue -->
<template>
  <button 
    type="submit"
    :disabled="loading"
    class="my-submit-button"
    @click="handleClick"
  >
    <span v-if="loading" class="loading-indicator">
      <span class="spinner"></span>
    </span>
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  label: { type: String, default: 'Submit' },
})

const emit = defineEmits(['click'])

function handleClick(event) {
  emit('click', event)
}
</script>

<style scoped>
.my-submit-button {
  padding: 0.5rem 1rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-weight: 500;
  cursor: pointer;
}
.my-submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.loading-indicator {
  margin-right: 0.5rem;
}
.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
```

## Accessing Form Configuration in Custom Components

When creating custom components, you'll often need to access the form configuration. Use the `useFormConfig` composable to get configuration values:

```vue
<template>
  <div class="my-custom-component" :class="customClass">
    <!-- Component content -->
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFormConfig } from '@encolajs/enforma/utils/useFormConfig'

const { getConfig } = useFormConfig()

// Get a specific configuration value with a fallback
const customClass = computed(() => 
  getConfig('myCustom.className', 'default-class')
)
</script>
```

## Creating Transformers for Custom Components

Transformers allow you to modify component props before they're passed to the component. This is particularly useful when adapting to specific UI libraries:

```js
// myCustomTransformer.js
export function myCustomFieldTransformer(fieldProps, field, formController, config) {
  // Add your custom logic to transform props
  
  // For example, adjust class names
  fieldProps.wrapperProps = fieldProps.wrapperProps || {}
  fieldProps.wrapperProps.class = `${fieldProps.wrapperProps.class || ''} my-custom-field-class`
  
  // Or modify how input components are mapped
  if (fieldProps.inputComponent === 'date') {
    fieldProps.inputComponent = 'MyCustomDatePicker'
    fieldProps.inputProps = {
      ...fieldProps.inputProps,
      format: 'yyyy-MM-dd'
    }
  }
  
  return fieldProps
}
```

Register your transformer in your configuration:

```js
app.use(EnformaPlugin, {
  transformers: {
    field_props: [myCustomFieldTransformer]
  }
})
```

## Integration with UI Libraries

While presets handle UI library integration, you can create custom components that work with specific UI libraries:

```vue
<!-- TailwindField.vue -->
<template>
  <div class="mb-4">
    <label 
      v-if="props.label" 
      :for="fieldId"
      class="block text-sm font-medium text-gray-700 mb-1"
    >
      {{ props.label }}
      <span v-if="props.required" class="text-red-500">*</span>
    </label>
    
    <component
      :is="props.inputComponent"
      :id="fieldId"
      v-model="fieldController.value"
      v-bind="props.inputProps"
      class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      :class="{ 'border-red-500': fieldController.error }"
    />
    
    <p 
      v-if="fieldController.error"
      class="mt-1 text-sm text-red-600"
    >
      {{ fieldController.error }}
    </p>
  </div>
</template>

<script setup>
import { useEnformaField } from '@encolajs/enforma/core/useEnformaField'
import { computed } from 'vue'

const originalProps = defineProps({
  name: { type: String, required: true },
  // ... other props
})

const { fieldController, props } = useEnformaField(originalProps)
const fieldId = computed(() => `field-${props.name}`)
</script>
```

## Complete Configuration Reference

Here's a complete reference for all components that can be customized in Enforma:

| Component Key | Default Component | Description |
|---------------|-------------------|-------------|
| `field` | `EnformaField` | Renders form fields with labels and validation |
| `section` | `EnformaSection` | Groups related fields together |
| `repeatable` | `EnformaRepeatable` | Creates repeatable field groups |
| `repeatableTable` | `EnformaRepeatableTable` | Displays repeatable fields in a table format |
| `repeatableAddButton` | `EnformaRepeatableAddButton` | Button to add new repeatable items |
| `repeatableRemoveButton` | `EnformaRepeatableRemoveButton` | Button to remove repeatable items |
| `repeatableMoveUpButton` | `EnformaRepeatableMoveUpButton` | Button to move repeatable items up |
| `repeatableMoveDownButton` | `EnformaRepeatableMoveDownButton` | Button to move repeatable items down |
| `submitButton` | `EnformaSubmitButton` | Form submission button |
| `resetButton` | `EnformaResetButton` | Form reset button |
| `schema` | `EnformaSchema` | Renders forms from JSON schema |

## Best Practices

1. **Maintain API Compatibility**: Ensure your custom components accept the same props as the components they're replacing.
2. **Use Composables**: Leverage Enforma's composables like `useEnformaField` to maintain core functionality.
3. **Incremental Customization**: Start with small customizations before replacing entire components.
4. **Test Thoroughly**: Verify your custom components work with all form features including validation, dynamic behavior, and schema generation.
5. **Separate Concerns**: Create separate components for UI presentation and form logic.

## Related Resources

- [Configuration Reference](/core-concepts/configuration.md)
- [Creating Your Own UI Preset](/ui-library-integration/creating-your-own-ui-preset.md)
- [Using Transformers](/extensibility/using-transformers.md)