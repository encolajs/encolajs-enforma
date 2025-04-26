# UI Library Integration

Enforma is designed to be UI-library agnostic, allowing you to integrate with any Vue UI library. This guide explains how to connect Enforma with your preferred UI components.

## Component Mapping Approach

Enforma works with UI libraries through a component mapping system. This allows you to:

1. Map form field types to UI library components
2. Configure default props for those components
3. Handle value binding and events consistently

## Basic Integration

### Manual Component Registration

The simplest approach is to register components in your form configuration:

```vue
<template>
  <Enforma :data="formData" :config="formConfig">
    <!-- Form fields will use mapped components -->
    <EnformaField name="name" label="Name" />
    <EnformaField name="email" label="Email" />
    <EnformaField name="subscription" inputComponent="select" label="Subscription Plan" 
                 :options="subscriptionOptions" />
  </Enforma>
</template>

<script setup>
import { Enforma, EnformaField } from 'encolajs-formkit';
import { MyTextInput, MyEmailInput, MySelect } from 'my-ui-library';

const formConfig = {
  components: {
    // Map field types to components
    text: MyTextInput,
    email: MyEmailInput,
    select: MySelect
  },
  
  // Default props for all components
  componentProps: {
    class: 'form-control',
    
    // Props for specific component types
    select: {
      searchable: true,
      clearable: false
    }
  }
};
</script>
```

### Creating a Custom Preset

For more comprehensive integration, create a preset:

```js
// src/presets/my-ui-preset.js
import {
  MyTextInput,
  MyPasswordInput,
  MyNumberInput,
  MySelect,
  MyCheckbox,
  MyRadio,
  MyTextarea,
  MyDatePicker,
  MyButton
} from 'my-ui-library';

export const myUiPreset = {
  components: {
    // Input types
    text: MyTextInput,
    password: MyPasswordInput,
    number: MyNumberInput,
    select: MySelect,
    checkbox: MyCheckbox,
    radio: MyRadio,
    textarea: MyTextarea,
    date: MyDatePicker,
    
    // Button components
    submitButton: MyButton,
    resetButton: MyButton,
    
    // Repeatable controls
    repeatableAddButton: MyButton,
    repeatableRemoveButton: MyButton,
    repeatableMoveUpButton: MyButton,
    repeatableMoveDownButton: MyButton
  },
  
  // Default props for all components
  componentProps: {
    // Global props
    class: 'form-control',
    
    // Component-specific props
    submitButton: {
      variant: 'primary',
      type: 'submit'
    },
    resetButton: {
      variant: 'secondary',
      type: 'button'
    },
    select: {
      searchable: true,
      clearable: true
    }
  },
  
  // Prop adapters for translating between Enforma and UI library
  propAdapters: {
    // Example: Map options format
    select: {
      options: (options) => options.map(opt => {
        // Convert Enforma option format to UI library format
        if (typeof opt === 'string') {
          return { id: opt, label: opt };
        }
        return { id: opt.value, label: opt.label };
      })
    }
  },
  
  // Event adapters for handling different event names
  eventAdapters: {
    // Example: Map selection events
    select: {
      'update:modelValue': 'selection-change'
    }
  }
};

// Usage in app
import { createEnforma } from 'encolajs-formkit';
import { myUiPreset } from './presets/my-ui-preset';

const formKit = createEnforma({
  preset: myUiPreset
});
```

## UI Library-Specific Considerations

### Event Handling

Different UI libraries emit different events for value changes:

```js
// Event adapter examples
const eventAdapters = {
  // For libraries using v-model:value instead of v-model
  text: {
    'update:modelValue': 'update:value'
  },
  
  // For libraries using custom events
  select: {
    'update:modelValue': 'selection-change'
  }
};
```

### Prop Mapping

Map Enforma props to library-specific props:

```js
// Prop adapter examples
const propAdapters = {
  // Map validation state
  text: {
    error: (error, props) => ({
      invalid: !!error,
      errorMessage: error ? error[0] : null
    })
  },
  
  // Map options format
  select: {
    options: (options) => transformOptionsForLibrary(options)
  }
};
```

### Value Transformations

Handle value format differences:

```js
// Value transformers
const valueTransformers = {
  // Date picker might need date object instead of string
  date: {
    input: (value) => value ? new Date(value) : null,
    output: (value) => value ? value.toISOString().split('T')[0] : null
  },
  
  // Multi-select might use arrays instead of comma-separated strings
  multiselect: {
    input: (value) => value ? value.split(',') : [],
    output: (value) => Array.isArray(value) ? value.join(',') : value
  }
};
```

## Examples with Popular UI Libraries

### Vuetify Example

```js
import {
  VTextField,
  VSelect,
  VCheckbox,
  VRadio,
  VTextarea,
  VDatePicker,
  VBtn
} from 'vuetify/components';

export const vuetifyPreset = {
  components: {
    text: VTextField,
    password: VTextField,
    email: VTextField,
    number: VTextField,
    select: VSelect,
    checkbox: VCheckbox,
    radio: VRadio,
    textarea: VTextarea,
    date: VDatePicker,
    
    submitButton: VBtn,
    resetButton: VBtn
  },
  
  componentProps: {
    text: {
      variant: 'outlined',
      density: 'comfortable'
    },
    password: {
      type: 'password',
      variant: 'outlined'
    },
    email: {
      type: 'email',
      variant: 'outlined'
    },
    submitButton: {
      color: 'primary',
      type: 'submit'
    }
  },
  
  propAdapters: {
    text: {
      error: (errors) => ({
        error: !!errors,
        errorMessages: errors || []
      })
    }
  }
};
```

### Element Plus Example

```js
import {
  ElInput,
  ElSelect,
  ElCheckbox,
  ElRadio,
  ElDatePicker,
  ElButton
} from 'element-plus';

export const elementPlusPreset = {
  components: {
    text: ElInput,
    password: ElInput,
    email: ElInput,
    select: ElSelect,
    checkbox: ElCheckbox,
    radio: ElRadio,
    date: ElDatePicker,
    
    submitButton: ElButton,
    resetButton: ElButton
  },
  
  componentProps: {
    password: {
      showPassword: true,
      type: 'password'
    },
    submitButton: {
      type: 'primary'
    }
  },
  
  propAdapters: {
    text: {
      error: (errors) => ({
        error: !!errors,
        validateMessage: errors ? errors[0] : ''
      })
    }
  }
};
```

## Advanced Integration

### Custom Field Components

For complex components, create wrapper components:

```vue
<!-- MyCustomDateRange.vue -->
<template>
  <div class="date-range-field">
    <label v-if="label">{{ label }}</label>
    <div class="date-inputs">
      <DatePicker 
        v-model="startDate" 
        placeholder="Start Date" 
        :disabled="disabled"
      />
      <span>to</span>
      <DatePicker 
        v-model="endDate" 
        placeholder="End Date" 
        :disabled="disabled"
      />
    </div>
    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { DatePicker } from 'my-ui-library';

const props = defineProps({
  modelValue: Object,
  label: String,
  disabled: Boolean,
  error: String
});

const emit = defineEmits(['update:modelValue']);

const startDate = computed({
  get: () => props.modelValue?.start || null,
  set: (value) => {
    emit('update:modelValue', {
      ...props.modelValue,
      start: value
    });
  }
});

const endDate = computed({
  get: () => props.modelValue?.end || null,
  set: (value) => {
    emit('update:modelValue', {
      ...props.modelValue,
      end: value
    });
  }
});
</script>
```

Then register it:

```js
import MyCustomDateRange from './components/MyCustomDateRange.vue';

const formConfig = {
  components: {
    dateRange: MyCustomDateRange
  }
};
```

## Best Practices

- Create a central preset file for each UI library
- Handle value transformations consistently
- Test integration with validation states
- Map error display appropriately
- Consider accessibility in your component mappings
- Maintain consistent styling across components
- Document any special considerations for each UI library integration