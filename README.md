# @encolajs/enforma

🚀 A powerful Vue 3 form library that renders dynamic forms from JSON schemas! Build complex forms with ease using headless components, field validation, and UI framework presets.

![CI](https://github.com/encolajs/encolajs-enforma/workflows/CI/badge.svg)
[![npm version](https://badge.fury.io/js/@encolajs%2Fenforma.svg)](https://badge.fury.io/js/@encolajs%2Fenforma)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why Another Form Library?

Building dynamic forms shouldn't be complicated! We built this library to handle real-world form scenarios with Vue 3:

- 🎨 **UI Agnostic**: Use it with your preferred UI library. Comes with ready-to-use presets for PrimeVue, Vuetify, Quasar, Reka UI and Nuxt UI
- ✅ **Multiple Validation Options**: Use Enforma with Zod, Yup, Valibot, @encolajs/validator or you can even bring your own validator
- ✨ **Schema-Driven**: Define forms using JSON schemas, no template code needed
- 🎯 **Type-Safe**: Full TypeScript support with auto-completion
- 🧩 **Headless Components**: Maximum flexibility with unstyled, accessible components
- 🔄 **Reactive Validation**: Built-in integration with @encolajs/validator
- 🌍 **i18n Ready**: Internationalization support out of the box
- 🪶 **Lightweight**: Optimized bundle size with tree-shaking support

## Quick Start

```bash
# Using npm
npm install @encolajs/enforma

# Using yarn
yarn add @encolajs/enforma

# Using pnpm
pnpm add @encolajs/enforma
```

## Simple Example

```vue
<template>
  <Enforma :data="formData" :validator="validator" :submit-handler="handleSubmit">
    <EnformaField name="name" label="Full Name" required />
    <EnformaField name="email" label="Email Address" required />
  </Enforma>
</template>

<script setup>
import { ref } from 'vue'
import { Enforma, EnformaField } from '@encolajs/enforma'
import { createEncolaValidator } from '@encolajs/enforma/validators/encola'

const formData = ref({
  name: '',
  email: '',
})

const validator = createEncolaValidator({
  name: 'required|min_length:2',
  email: 'required|email',
})

const handleSubmit = async (data) => {
  console.log('Form submitted:', data)
  return true
}
</script>
```

`<Enforma>` renders the labels, inputs, error messages and the submit and reset buttons. The validator above uses [@encolajs/validator](https://github.com/encolajs/encolajs-validator) (`npm install @encolajs/validator`); Zod, Yup and Valibot work the same way through `@encolajs/enforma/validators/zod`, `/yup` and `/valibot`.

## Amazing Features

### UI Framework Presets

Skip the styling and use our pre-built components for popular UI frameworks:

```js
// main.js
import { EnformaPlugin } from '@encolajs/enforma'
import usePrimeVuePreset from '@encolajs/enforma/presets/primevue'
// or: useVuetifyPreset from '@encolajs/enforma/presets/vuetify'
// or: useQuasarPreset from '@encolajs/enforma/presets/quasar'
// or: useRekauiPreset from '@encolajs/enforma/presets/rekaui'
// or: useNuxtUIPreset from '@encolajs/enforma/presets/nuxtui'

app.use(EnformaPlugin)
usePrimeVuePreset()
```

### Schema Forms

Describe the whole form as an object, with nested paths, sections and repeatable groups:

```vue
<template>
  <Enforma
    :data="formData"
    :validator="validator"
    :schema="schema"
    :submit-handler="handleSubmit"
  />
</template>

<script setup>
import { ref } from 'vue'
import { Enforma } from '@encolajs/enforma'
import { createEncolaValidator } from '@encolajs/enforma/validators/encola'

const formData = ref({
  name: '',
  address: { city: '' },
  addresses: [],
})

const schema = {
  name: { type: 'field', label: 'Name', required: true },
  'address.city': { type: 'field', label: 'City' },
  addresses_section: {
    type: 'section',
    title: 'Other addresses',
    titleComponent: 'h3',
  },
  addresses: {
    type: 'repeatable',
    section: 'addresses_section',
    subfields: {
      street: { label: 'Street' },
      city: { label: 'City' },
    },
  },
}

const validator = createEncolaValidator({
  name: 'required',
  'addresses.*.street': 'required',
  'addresses.*.city': 'required',
})

const handleSubmit = async (data) => {
  console.log('Form submitted:', data)
  return true
}
</script>
```

### Headless Components

For full control over the markup, `HeadlessForm` and `HeadlessField` give you the form's state and leave the rendering to you:

```vue
<template>
  <HeadlessForm :data="formData" :validator="validator" :submit-handler="handleSubmit">
    <HeadlessField name="email">
      <template #default="{ id, attrs, events, error }">
        <label :for="id">Email</label>
        <input :id="id" v-bind="attrs" v-on="events" />
        <div v-if="error" :id="attrs['aria-errormessage']">{{ error }}</div>
      </template>
    </HeadlessField>

    <button type="submit">Submit</button>
  </HeadlessForm>
</template>
```

The same state is available from the `useForm`, `useField` and `useRepeatable` composables.

## Validation

Enforma supports multiple validation libraries - choose the one that fits your project:

- **@encolajs/validator** - Laravel-style validation rules
- **Zod** - TypeScript-first schema validation
- **Yup** - Object schema validation with conditional logic
- **Valibot** - Lightweight, modular validation
- **No validation** - Use forms without any validation

All validators work seamlessly with `useForm()` and form components like `HeadlessForm`.

For detailed usage, examples, and migration guides, see the [Validation documentation](https://encolajs.com/enforma/core-concepts/validation).

## Documentation

- [Official Documentation](https://encolajs.com/enforma/) - Complete guide and API reference
- [Examples](https://encolajs.com/enforma/examples/) - Real-world examples and demos

### Docs for AI Coding Agents

The Enforma docs are available to coding agents (Claude Code, Cursor, Copilot, etc.) through [Context7](https://context7.com/encolajs/encolajs-enforma). With the [Context7 MCP server](https://github.com/upstash/context7) installed, add `use context7` to your prompt, or reference the library directly:

```text
Build a schema form with a repeatable list of addresses. use library /encolajs/encolajs-enforma for API and docs
```

Enforma also ships an [agent skill](./skills/enforma/SKILL.md) covering setup, the form modes, validation and the common gotchas. Your agent loads it on its own when it works on your forms. Install it with [`npx skills`](https://github.com/vercel-labs/skills):

```bash
npx skills add encolajs/encolajs-enforma
```

## Contributing

We'd love your help improving @encolajs/enforma! Check out our [Contributing Guide](./CONTRIBUTING.md) to get started.

Found a bug? [Open an issue](https://github.com/encolajs/encolajs-enforma/issues/new)

Have a great idea? [Suggest a feature](https://github.com/encolajs/encolajs-enforma/issues/new)

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

Built with ❤️ by the EncolaJS team