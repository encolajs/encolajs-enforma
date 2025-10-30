# Reka UI Preset

Enforma includes a built-in preset for [Reka UI](https://reka-ui.com/), making it easy to create forms using Reka UI's unstyled, accessible primitives. This integration provides a seamless experience that leverages Reka UI's headless component library while maintaining Enforma's powerful form management capabilities.

## What is Reka UI?

Reka UI is an open-source library of unstyled, accessible Vue components (similar to Radix UI for React). It provides primitive components that you can style however you want, making it perfect for creating custom-designed forms.

## Installation

To use the Reka UI preset, you need to have Reka UI installed in your project:

```bash
npm install reka-ui
```

Follow the [Reka UI setup instructions](https://reka-ui.com/docs/overview/getting-started) to get started.

## Basic Usage

Because Reka UI provides **unstyled primitives**, you need to create wrapper components that compose Reka UI primitives with your desired styling. Here's how to set it up:

### Step 1: Create Wrapper Components

Create styled wrapper components for the form inputs you need. Here's an example for a text input:

```vue
<!-- components/MyInput.vue -->
<template>
  <input
    v-bind="$attrs"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    class="my-input"
  />
</template>

<script setup>
defineProps({
  modelValue: String,
  id: String,
  placeholder: String,
  disabled: Boolean
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.my-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
}
.my-input:focus {
  border-color: #4f46e5;
  outline: none;
}
</style>
```

For components like Select and Switch, you'll compose Reka UI primitives:

```vue
<!-- components/MySelect.vue -->
<template>
  <SelectRoot v-model="localValue" v-bind="$attrs">
    <SelectTrigger class="my-select-trigger">
      <SelectValue :placeholder="placeholder" />
      <SelectIcon>▼</SelectIcon>
    </SelectTrigger>
    <SelectPortal>
      <SelectContent class="my-select-content" position="popper">
        <SelectViewport>
          <SelectItem
            v-for="item in items"
            :key="item.value"
            :value="item.value"
            class="my-select-item"
          >
            <SelectItemText>{{ item.label }}</SelectItemText>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>

<script setup>
import { computed } from 'vue'
import {
  SelectRoot, SelectTrigger, SelectValue, SelectIcon,
  SelectPortal, SelectContent, SelectViewport,
  SelectItem, SelectItemText
} from 'reka-ui'

const props = defineProps({
  modelValue: String,
  items: Array,
  placeholder: String
})

const emit = defineEmits(['update:modelValue'])

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<style scoped>
/* Add your styles here */
</style>
```

### Step 2: Configure the Preset

```js
// main.js
import { createApp } from 'vue'
import { EnformaPlugin } from '@encolajs/enforma'
import { useRekauiPreset } from '@encolajs/enforma/presets/rekaui'
import App from './App.vue'

// Import your wrapper components
import MyInput from './components/MyInput.vue'
import MySelect from './components/MySelect.vue'
import MySwitch from './components/MySwitch.vue'
import MyButton from './components/MyButton.vue'

const app = createApp(App)

// Configure Enforma
app.use(EnformaPlugin)

// Apply Reka UI preset with your components
useRekauiPreset({
  input: MyInput,
  text: MyInput,
  select: MySelect,
  switch: MySwitch,
  toggle: MySwitch,
  button: MyButton,
})

app.mount('#app')
```

### Step 3: Use in Your Forms

```vue
<template>
  <Enforma :data="formData" :validator="validator" :submit-handler="submit">
    <RekauiField name="name" label="Full Name" />
    <RekauiField name="email" label="Email Address" />
    <RekauiField
      name="role"
      label="Role"
      input-component="select"
      :input-props="{ items: roles }"
    />
    <RekauiField name="active" label="Active" input-component="switch" />
  </Enforma>
</template>

<script setup>
import { ref } from 'vue'
import { Enforma } from '@encolajs/enforma'
import { createEncolaValidator } from '@encolajs/enforma/validators/encola'
import RekauiField from '@encolajs/enforma/presets/rekaui/Field'

const formData = ref({
  name: '',
  email: '',
  role: '',
  active: false
})

const validator = createEncolaValidator({
  name: 'required',
  email: 'required|email',
  role: 'required'
})

const roles = [
  { value: 'admin', label: 'Administrator' },
  { value: 'user', label: 'Regular User' },
  { value: 'guest', label: 'Guest' }
]

function submit(data) {
  console.log('Form submitted:', data)
}
</script>
```

## Component Mapping

The preset supports the following component types that you can provide:

| Field Type | Purpose |
|------------|---------|
| `input`    | Text input field |
| `select`   | Dropdown selection |
| `switch`   | Boolean toggle |
| `toggle`   | Alias for switch |
| `button`   | Action buttons |

The preset also configures button components for form actions:

| Button | Usage |
|--------|-------|
| EnformaSubmitButton | Submit form button |
| EnformaResetButton | Reset form button |
| EnformaRepeatableAddButton | Add repeatable item |
| EnformaRepeatableRemoveButton | Remove repeatable item |
| EnformaRepeatableMoveUpButton | Move item up |
| EnformaRepeatableMoveDownButton | Move item down |

## Tree-Shaking

Because you only import the Reka UI primitives you actually use in your wrapper components, this preset is extremely tree-shakable. You only bundle what you need!

## Benefits

✅ **Full Control**: Style components exactly how you want
✅ **Accessible**: Built on Reka UI's accessible primitives
✅ **Lightweight**: Only bundle what you use
✅ **Flexible**: Easy to customize for your design system

> [!NOTE]
> Since Reka UI is a headless library, you have complete control over the styling and behavior of your form components. The examples above are just starting points - customize them to match your design system!
