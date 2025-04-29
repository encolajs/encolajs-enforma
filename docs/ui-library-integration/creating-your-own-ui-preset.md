# Creating Your Own UI Preset

While Enforma includes built-in presets for popular UI libraries like PrimeVue and Vuetify, you might want to create your own preset for a different UI library or a custom component set. This guide walks through the process of building a custom UI preset for Enforma.

An Enforma preset gives you control over:

1. **Input mappings**: Which component to use for each type of input
2. **Configuration options**: How forms are rendered and how they behave

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

### 2. Create an Input Map

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

const myUiInputs = {
    // Input components
    text: MyTextInput,
    password: MyPasswordInput,
    email: MyTextInput,  // Reuse with
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
}

function setInputComponentOnFields(
  fieldProps: any
) {
  if (fieldProps.inputComponent && 'object' !== typeof fieldProps.inputComponent) {
    // if the component is not already a Vue component
    fieldProps.inputComponent = inputComponents[fieldProps.inputComponent] || InputText
  } else if (!fieldProps.inputComponent) {
    // default to InputText
    fieldProps.inputComponent = InputText
  }
  return fieldProps
}
```

### 3. Set Configuration Options

Add custom configuration options:

```js
const myUiPresetConfig = {
  pt: {
    // Input components
    wrapper: {
      class: 'form-control',
    },
    label: {
      class: 'form-label',
    },
  },
  
  // Rest of the config...
}
```

### 4. Add Transformers

For components that expect different value formats:

```js
const myUiPresetConfig = {
  pt: {
    // Default props...
  },
    
  transformers: {
    field_props: [setInputComponentOnFields]
  }
};
```

### 5. Implement Function to Change Global Options

```js
import {getGlobalConfig, setGlobalConfig } from '@encolajs/enforma'

export default function useMyUiPreset() {
  const currentConfig = getGlobalConfig()
  
  const mergedConfig = {
    // implement here how your config options are merged
    // with the currently existing global options
    
    // if you want you can ignore the current global config
  }
  
  setGlobalConfig(mergedConfig)
}

```


### 6. Register Your Preset

Use your preset when creating the Enforma instance:

```js
// main.js
import { createApp } from 'vue'
import { createEnforma } from '@encolajs/enforma'
import { useMyUiPreset } from './presets/my-ui-preset'
import App from './App.vue'

const app = createApp(App);

// Configure Enforma with your preset
const enforma = createEnforma()
app.use(Enforma)

// Use the preset
useMyUiPreset()

app.mount('#app')
```

## PrimeVue Preset Source Code

The best way to learn how to write a preset is to look at one of the presents inside the library. Below is the exact code from the PrimeVue preset with comments to guide you in making your own presets

<<< ../../src/presets/primevue.ts