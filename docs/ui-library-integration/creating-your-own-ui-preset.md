# Creating Your Own UI Preset

While Enforma includes built-in presets for popular UI libraries like PrimeVue and Vuetify, you might want to create your own preset for a different UI library or a custom component set. This guide walks through the process of building a custom UI preset for Enforma.

## Understanding Presets

An Enforma preset is an object that maps form field types to UI components and defines how they should behave. It includes:

1. **Component mappings**: Which component to use for each field type
2. **Default props**: Standard properties for each component
3. **Prop adapters**: Functions that transform Enforma props to component-specific props
4. **Event adapters**: Mappings between Enforma events and component events

## Basic Preset Structure

Here's the basic structure of an Enforma preset:

```js
const myPreset = {
  // Component mappings
  components: {
    text: MyTextInput,
    email: MyEmailInput,
    password: MyPasswordInput,
    // ...other component mappings
  },
  
  // Default props for components
  componentProps: {
    text: {
      class: 'form-input',
      // ...other default props
    },
    // ...props for other components
  },
  
  // Prop adapters to transform Enforma props to component props
  propAdapters: {
    text: {
      error: (errors) => ({ hasError: !!errors, errorMessage: errors?.[0] || '' }),
      // ...other prop adapters
    },
    // ...adapters for other components
  },
  
  // Event adapters to map Enforma events to component events
  eventAdapters: {
    text: {
      'update:modelValue': 'change',
      // ...other event mappings
    },
    // ...adapters for other components
  },
  
  // Optional value transformers
  valueTransformers: {
    date: {
      input: (value) => value ? new Date(value) : null,
      output: (value) => value instanceof Date ? value.toISOString().split('T')[0] : value
    },
    // ...transformers for other components
  }
};
```

## Step-by-Step Guide

### 1. Set Up Your Project Structure

Create a dedicated file for your preset:

```
src/
  presets/
    my-ui-preset.js
    components/
      MyFormButton.vue
      MyCustomField.vue
```

### 2. Map Components

First, map each field type to the appropriate component:

```js
// src/presets/my-ui-preset.js
import {
  MyTextInput,
  MyPasswordInput,
  MySelect,
  MyCheckbox,
  MyRadioGroup,
  MyTextarea,
  MyDatePicker,
  MyButton
} from 'my-ui-library';

// Import any custom wrapper components
import MyFormButton from './components/MyFormButton.vue';
import MyCustomField from './components/MyCustomField.vue';

export const myUiPreset = {
  components: {
    // Input components
    text: MyTextInput,
    password: MyPasswordInput,
    email: MyTextInput,  // Reuse with type="email"
    number: MyTextInput, // Reuse with type="number"
    select: MySelect,
    checkbox: MyCheckbox,
    radio: MyRadioGroup,
    textarea: MyTextarea,
    date: MyDatePicker,
    custom: MyCustomField,
    
    // Button components
    submitButton: MyFormButton,
    resetButton: MyFormButton,
    repeatableAddButton: MyFormButton,
    repeatableRemoveButton: MyFormButton,
    repeatableMoveUpButton: MyFormButton,
    repeatableMoveDownButton: MyFormButton
  },
  
  // Rest of the preset...
};
```

### 3. Configure Default Props

Add default props for each component type:

```js
export const myUiPreset = {
  components: {
    // Component mappings...
  },
  
  componentProps: {
    // Input components
    text: {
      class: 'form-control',
      variant: 'outlined'
    },
    password: {
      class: 'form-control',
      variant: 'outlined',
      type: 'password',
      autocomplete: 'current-password'
    },
    email: {
      class: 'form-control',
      variant: 'outlined',
      type: 'email',
      autocomplete: 'email'
    },
    select: {
      class: 'form-select',
      clearable: true
    },
    
    // Button components
    submitButton: {
      type: 'submit',
      variant: 'primary',
      class: 'submit-button'
    },
    resetButton: {
      type: 'button',
      variant: 'secondary',
      class: 'reset-button'
    },
    repeatableAddButton: {
      type: 'button',
      icon: 'plus',
      variant: 'outline',
      size: 'sm'
    }
    // ...other component props
  },
  
  // Rest of the preset...
};
```

### 4. Create Prop Adapters

Add adapters to transform Enforma props to your component props:

```js
export const myUiPreset = {
  components: {
    // Component mappings...
  },
  
  componentProps: {
    // Default props...
  },
  
  propAdapters: {
    // Transform validation errors
    text: {
      error: (errors) => ({
        invalid: !!errors,
        errorText: errors ? errors[0] : ''
      }),
      label: (label) => ({
        floatingLabel: label
      })
    },
    
    // Transform select options
    select: {
      options: (options) => {
        // Convert Enforma options to component format
        if (!options) return [];
        
        return options.map(opt => {
          if (typeof opt === 'string') {
            return { id: opt, text: opt };
          }
          return { id: opt.value, text: opt.label };
        });
      }
    },
    
    // Transform button props
    submitButton: {
      label: (label) => ({
        text: label
      })
    }
    
    // ...other adapters
  },
  
  // Rest of the preset...
};
```

### 5. Map Events

Configure event mappings between Enforma and your components:

```js
export const myUiPreset = {
  components: {
    // Component mappings...
  },
  
  componentProps: {
    // Default props...
  },
  
  propAdapters: {
    // Prop adapters...
  },
  
  eventAdapters: {
    // Map v-model events
    text: {
      'update:modelValue': 'input'  // When component emits 'input', Enforma will receive 'update:modelValue'
    },
    select: {
      'update:modelValue': 'selection-change'
    },
    checkbox: {
      'update:modelValue': 'change'
    },
    
    // ...other event mappings
  },
  
  // Rest of the preset...
};
```

### 6. Add Value Transformers (if needed)

For components that expect different value formats:

```js
export const myUiPreset = {
  components: {
    // Component mappings...
  },
  
  componentProps: {
    // Default props...
  },
  
  propAdapters: {
    // Prop adapters...
  },
  
  eventAdapters: {
    // Event adapters...
  },
  
  valueTransformers: {
    // Date transformers
    date: {
      // Transform string date to Date object for the component
      input: (value) => value ? new Date(value) : null,
      
      // Transform Date object back to string for form state
      output: (value) => value instanceof Date 
        ? value.toISOString().split('T')[0] 
        : value
    },
    
    // Multi-select transformers
    multiselect: {
      input: (value) => Array.isArray(value) ? value : (value ? value.split(',') : []),
      output: (value) => Array.isArray(value) ? value.join(',') : value
    }
    
    // ...other transformers
  }
};
```

### 7. Create Wrapper Components (if needed)

For components that need special handling, create wrapper components:

```vue
<!-- src/presets/components/MyFormButton.vue -->
<template>
  <MyButton 
    :type="type" 
    :variant="variant" 
    :disabled="disabled"
    :class="buttonClass"
  >
    <span v-if="icon" class="button-icon" :class="iconClass"></span>
    <slot>{{ label }}</slot>
  </MyButton>
</template>

<script setup>
import { MyButton } from 'my-ui-library';

defineProps({
  label: String,
  type: {
    type: String,
    default: 'button'
  },
  variant: {
    type: String,
    default: 'primary'
  },
  icon: String,
  disabled: Boolean,
  buttonClass: String,
  iconClass: String
});
</script>
```

### 8. Register Your Preset

Use your preset when creating the FormKit instance:

```js
// main.js
import { createApp } from 'vue';
import { createEnforma } from 'encolajs-formkit';
import { myUiPreset } from './presets/my-ui-preset';
import App from './App.vue';

const app = createApp(App);

// Configure FormKit with your preset
const formkit = createEnforma({
  preset: myUiPreset
});

app.use(formkit);
app.mount('#app');
```

## Extending Existing Presets

You can also extend an existing preset:

```js
import { primevuePreset } from 'encolajs-formkit/presets/primevue';
import MyCustomComponent from './components/MyCustomComponent.vue';

export const extendedPrimeVuePreset = {
  ...primevuePreset,
  components: {
    ...primevuePreset.components,
    custom: MyCustomComponent,
    // Override existing components
    text: MyCustomTextInput
  },
  componentProps: {
    ...primevuePreset.componentProps,
    text: {
      ...primevuePreset.componentProps.text,
      class: 'custom-text-input'
    }
  }
};
```

## Testing Your Preset

Create a simple form to test your preset:

```vue
<template>
  <Enforma :data="formData" :submitHandler="submit">
    <EnformaField name="name" label="Name" />
    <EnformaField name="email" type="email" label="Email" />
    <EnformaField 
      name="option" 
      type="select" 
      label="Select Option" 
      :options="['Option 1', 'Option 2', 'Option 3']" 
    />
    <EnformaField name="agree" type="checkbox" label="I agree to terms" />
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
import { ref } from 'vue';
import { Enforma, EnformaField, EnformaSubmitButton } from 'encolajs-formkit';

const formData = ref({
  name: '',
  email: '',
  option: '',
  agree: false
});

function submit(data) {
  console.log('Form submitted:', data);
}
</script>
```

## Best Practices

1. **Maintain component APIs**: Ensure your components follow the same API patterns as Enforma expects
2. **Document your preset**: Include comments and documentation for custom behavior
3. **Test with validation**: Verify that error states are correctly displayed
4. **Handle accessibility**: Ensure your components maintain proper accessibility features
5. **Start simple**: Begin with the most common field types and expand
6. **Provide sensible defaults**: Configure reasonable default props
7. **Create specialized wrapper components**: For complex UI components, create dedicated wrappers
8. **Consider both desktop and mobile**: Test your preset on different devices

By following this guide, you can create a custom UI preset that integrates any UI library or custom component set with Enforma, providing a consistent and powerful form building experience.