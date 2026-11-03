# Nuxt UI Preset

Enforma includes a built-in preset for [Nuxt UI](https://ui.nuxt.com/), making it easy to create forms using Nuxt UI's beautiful, fully-styled components. This integration provides a seamless experience that leverages Nuxt UI's Tailwind CSS-based component library while maintaining Enforma's powerful form management capabilities.

## What is Nuxt UI?

Nuxt UI is a collection of fully-styled, accessible Vue components built on [Reka UI](https://reka-ui.com/) and Tailwind CSS v4. Despite its name, it is not limited to Nuxt: it officially supports both Nuxt and plain Vue applications built with Vite (including Inertia setups such as Laravel or AdonisJS).

## Installation

Install Nuxt UI and Tailwind CSS:

```bash
npm install @nuxt/ui tailwindcss
```

Create a CSS file that imports Tailwind CSS and Nuxt UI:

```css
/* assets/css/main.css */
@import "tailwindcss";
@import "@nuxt/ui";
```

The rest of the setup depends on whether you use Nuxt or a standard Vue application. See the official [Nuxt](https://ui.nuxt.com/docs/getting-started/installation/nuxt) and [Vue](https://ui.nuxt.com/docs/getting-started/installation/vue) installation guides for all the options.

## Basic Usage

### For Nuxt Applications

Register the Nuxt UI module and your CSS file:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css']
})
```

Wrap your app with the `UApp` component (required for toasts, tooltips and programmatic overlays):

```vue
<!-- app.vue -->
<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
```

Then configure Enforma with the Nuxt UI preset in a plugin. Nuxt UI components are exposed through the `#components` virtual module:

```ts
// plugins/enforma.ts
import { EnformaPlugin } from '@encolajs/enforma'
import useNuxtUIPreset from '@encolajs/enforma/presets/nuxtui'
import { UInput, USelect, USwitch, UButton } from '#components'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(EnformaPlugin)

  useNuxtUIPreset({
    input: UInput,
    text: UInput,
    select: USelect,
    switch: USwitch,
    toggle: USwitch,
    button: UButton,
  })
})
```

### For Standard Vue Applications

Nuxt UI works in any Vue application built with Vite. Add the Nuxt UI Vite plugin, which also sets up Tailwind CSS:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'

export default defineConfig({
  plugins: [
    vue(),
    ui()
    // If your app doesn't use vue-router (Nuxt UI 4.3+):
    // ui({ router: false })
  ]
})
```

Install the Nuxt UI Vue plugin, then configure Enforma with the preset. Outside of templates, import the components you want to use directly from `@nuxt/ui/components`:

```ts
// main.ts
import './assets/css/main.css'

import { createApp } from 'vue'
import ui from '@nuxt/ui/vue-plugin'
import { EnformaPlugin } from '@encolajs/enforma'
import useNuxtUIPreset from '@encolajs/enforma/presets/nuxtui'
import UInput from '@nuxt/ui/components/Input.vue'
import USelect from '@nuxt/ui/components/Select.vue'
import USwitch from '@nuxt/ui/components/Switch.vue'
import UButton from '@nuxt/ui/components/Button.vue'
import App from './App.vue'

const app = createApp(App)

app.use(ui)
app.use(EnformaPlugin)

useNuxtUIPreset({
  input: UInput,
  text: UInput,
  select: USelect,
  switch: USwitch,
  toggle: USwitch,
  button: UButton,
})

app.mount('#app')
```

As with Nuxt, wrap your root component with `UApp`, and add the `isolate` class to your root element so overlays stack correctly:

```vue
<!-- App.vue -->
<template>
  <UApp>
    <RouterView />
  </UApp>
</template>
```

```html
<!-- index.html -->
<div id="app" class="isolate"></div>
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
| `input`    | UInput    |
| `select`   | USelect   |
| `switch`   | USwitch   |
| `toggle`   | USwitch   |
| `button`   | UButton   |

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

Nuxt UI uses Tailwind CSS v4, which is configured in CSS rather than in a `tailwind.config.js` file. The `@import "tailwindcss"` and `@import "@nuxt/ui"` statements from the installation step are all you need: the Nuxt module or the Vite plugin wires Tailwind CSS into your build.

Nuxt UI form controls are inline by default. To make them fill the width of the field, add a `w-full` class or set it globally through the `ui` option of the Nuxt module or Vite plugin:

```ts
ui({
  ui: {
    input: { slots: { root: 'w-full' } },
    select: { slots: { base: 'w-full' } }
  }
})
```

## Error Handling

When a field has validation errors, the preset sets the `highlight` prop and `color: 'error'` on the input, so Nuxt UI renders it in its error state.

## Benefits

✅ **Beautiful Design**: Pre-styled with Tailwind CSS
✅ **Accessible**: Built on Reka UI primitives
✅ **Consistent**: Follows Nuxt UI design system
✅ **Flexible**: Works with Nuxt and plain Vue + Vite apps
