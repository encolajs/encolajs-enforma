# Nuxt UI Preset

Enforma includes a built-in preset for [Nuxt UI](https://ui.nuxt.com/), making it easy to create forms using Nuxt UI's beautiful, fully-styled components. This integration provides a seamless experience that leverages Nuxt UI's Tailwind CSS-based component library while maintaining Enforma's powerful form management capabilities.

## What is Nuxt UI?

Nuxt UI is a collection of fully-styled, accessible Vue components built with Tailwind CSS. While designed primarily for Nuxt applications, the components can also be used in standard Vue applications with some configuration.

## Installation

To use the Nuxt UI preset, you need to have Nuxt UI installed in your project:

```bash
npm install @nuxt/ui
```

> [!NOTE]
> Nuxt UI is optimized for Nuxt applications. For standalone Vue apps, you may need to create wrapper components as shown below.

## Basic Usage

### For Nuxt Applications

If you're using Nuxt, follow the [Nuxt UI setup instructions](https://ui.nuxt.com/getting-started/installation):

```js
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui']
})
```

Then configure Enforma with the Nuxt UI preset:

```js
// plugins/enforma.js
import { EnformaPlugin } from '@encolajs/enforma'
import { useNuxtUIPreset } from '@encolajs/enforma/presets/nuxtui'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(EnformaPlugin)

  // Apply Nuxt UI preset with auto-imported components
  useNuxtUIPreset({
    input: resolveComponent('UInput'),
    select: resolveComponent('USelect'),
    switch: resolveComponent('USwitch'),
    button: resolveComponent('UButton'),
  })
})
```

### For Standard Vue Applications

For non-Nuxt Vue apps, you'll need to create wrapper components since Nuxt UI components are designed for the Nuxt ecosystem:

```vue
<!-- components/NuxtUIInput.vue -->
<template>
  <input
    v-bind="$attrs"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    class="nuxtui-input"
  />
</template>

<script setup>
defineProps({
  modelValue: String,
  id: String,
  placeholder: String,
  disabled: Boolean,
  highlight: Boolean
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.nuxtui-input {
  display: block;
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  color: #374151;
  background-color: #fff;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}
.nuxtui-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.nuxtui-input[highlight="true"] {
  border-color: #ef4444;
}
</style>
```

Then configure the preset:

```js
// main.js
import { createApp } from 'vue'
import { EnformaPlugin } from '@encolajs/enforma'
import { useNuxtUIPreset } from '@encolajs/enforma/presets/nuxtui'
import App from './App.vue'

// Import your wrapper components
import NuxtUIInput from './components/NuxtUIInput.vue'
import NuxtUISelect from './components/NuxtUISelect.vue'
import NuxtUISwitch from './components/NuxtUISwitch.vue'
import NuxtUIButton from './components/NuxtUIButton.vue'

const app = createApp(App)

app.use(EnformaPlugin)

// Apply Nuxt UI preset
useNuxtUIPreset({
  input: NuxtUIInput,
  text: NuxtUIInput,
  select: NuxtUISelect,
  switch: NuxtUISwitch,
  toggle: NuxtUISwitch,
  button: NuxtUIButton,
})

app.mount('#app')
```

## Using in Forms

```vue
<template>
  <Enforma :data="formData" :validator="validator" :submit-handler="submit">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <NuxtUIField name="name" label="Full Name" />
      <NuxtUIField name="email" label="Email Address" help="We'll never share your email" />
      <NuxtUIField
        name="role"
        label="Role"
        input-component="select"
        :input-props="{ items: roles }"
      />
      <NuxtUIField name="active" label="Active" input-component="switch" />
    </div>
  </Enforma>
</template>

<script setup>
import { ref } from 'vue'
import { Enforma } from '@encolajs/enforma'
import { createEncolaValidator } from '@encolajs/enforma/validators/encola'
import NuxtUIField from '@encolajs/enforma/presets/nuxtui/Field'

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

The preset supports the following component types:

| Field Type | Component |
|------------|-----------|
| `input`    | UInput / Custom input |
| `select`   | USelect / Custom select |
| `switch`   | USwitch / Custom switch |
| `toggle`   | USwitch / Custom switch |
| `button`   | UButton / Custom button |

The preset also configures styled button components:

| Button | Styling |
|--------|---------|
| EnformaSubmitButton | Primary solid button |
| EnformaResetButton | Neutral outline button |
| EnformaRepeatableAddButton | Primary soft button with plus icon |
| EnformaRepeatableRemoveButton | Error ghost button with trash icon |
| EnformaRepeatableMoveUpButton | Neutral ghost button with up arrow |
| EnformaRepeatableMoveDownButton | Neutral ghost button with down arrow |

## Styling with Tailwind

The preset is designed to work seamlessly with Tailwind CSS. Make sure you have Tailwind CSS configured in your project:

```js
// tailwind.config.js
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## Error Handling

The preset automatically applies the `highlight` prop to inputs when validation errors occur, giving them an error state styling with a red border.

## Benefits

✅ **Beautiful Design**: Pre-styled with Tailwind CSS
✅ **Accessible**: Built with accessibility in mind
✅ **Consistent**: Follows Nuxt UI design system
✅ **Flexible**: Easy to customize with Tailwind utilities

> [!WARNING]
> Nuxt UI is primarily designed for Nuxt applications. While it can be adapted for standard Vue apps with wrapper components, you may encounter integration challenges. Consider using the components as inspiration for creating your own Tailwind-based components.

> [!NOTE]
> The wrapper components approach shown above mimics Nuxt UI's design system using Tailwind CSS classes, providing a similar look and feel in non-Nuxt applications.
