# @encolajs/enforma

🚀 A powerful Vue 3 form library that renders dynamic forms from JSON schemas! Build complex forms with ease using headless components, field validation, and UI framework presets.

![CI](https://github.com/encolajs/encolajs-enforma/workflows/CI/badge.svg)
[![npm version](https://badge.fury.io/js/@encolajs%2Fenforma.svg)](https://badge.fury.io/js/@encolajs%2Fenforma)
[![License: MIT](https://img.shields.io/badge/License-DUAL-red.svg)](https://github.com/encolajs/encolajs-enforma/blob/master/LICENSE-COMMERCIAL.md)

## Why Another Form Library?

Building dynamic forms shouldn't be complicated! We built this library to handle real-world form scenarios with Vue 3:

- 🎨 **UI Agnostic**: Use it with your preferred UI library. Comes with ready-to-use presets for PrimeVue, Vuetify, and Quasar
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
  <HeadlessForm :schema="schema" v-model="formData">
    <HeadlessField name="email" #default="{ field, error }">
      <input v-bind="field" placeholder="Email" />
      <span v-if="error">{{ error }}</span>
    </HeadlessField>
    
    <HeadlessField name="name" #default="{ field, error }">
      <input v-bind="field" placeholder="Full Name" />
      <span v-if="error">{{ error }}</span>
    </HeadlessField>
    
    <button @click="submit">Submit</button>
  </HeadlessForm>
</template>

<script setup>
import { ref } from 'vue'
import { HeadlessForm, HeadlessField } from '@encolajs/enforma'

const formData = ref({})

const schema = {
  fields: {
    email: {
      type: 'email',
      validation: 'required|email',
      label: 'Email Address'
    },
    name: {
      type: 'text',
      validation: 'required|min_length:2',
      label: 'Full Name'
    }
  }
}

const submit = () => {
  console.log('Form data:', formData.value)
}
</script>
```

## Amazing Features

### UI Framework Presets

Skip the styling and use our pre-built components for popular UI frameworks:

```vue
<!-- PrimeVue Preset -->
<script setup>
import { EnformaPlugin } from '@encolajs/enforma'
import { primevuePreset } from '@encolajs/enforma/presets/primevue'

app.use(EnformaPlugin, { 
  preset: primevuePreset 
})
</script>

<!-- Vuetify Preset -->
<script setup>
import { vuetifyPreset } from '@encolajs/enforma/presets/vuetify'

app.use(EnformaPlugin, { 
  preset: vuetifyPreset 
})
</script>
```

### Dynamic Schema Building

Create complex forms with nested objects and arrays:

```typescript
const schema = {
  fields: {
    user: {
      type: 'object',
      fields: {
        name: { type: 'text', validation: 'required' },
        email: { type: 'email', validation: 'required|email' }
      }
    },
    hobbies: {
      type: 'repeatable',
      itemSchema: {
        type: 'text',
        validation: 'required'
      }
    }
  }
}
```

### Composable Architecture

Use our composables for maximum flexibility:

```typescript
import { useEnformaField, useEnformaSchema } from '@encolajs/enforma'

const { field, error, validate } = useEnformaField('email', {
  validation: 'required|email'
})

const { schema, formData, isValid } = useEnformaSchema(mySchema)
```

## Documentation

- [Official Documentation](https://encolajs.com/enforma/) - Complete guide and API reference
- [Examples](https://encolajs.com/enforma/examples/) - Real-world examples and demos

## Contributing

We'd love your help improving @encolajs/enforma! Check out our [Contributing Guide](./CONTRIBUTING.md) to get started.

Found a bug? [Open an issue](https://github.com/encolajs/encolajs-enforma/issues/new)

Have a great idea? [Suggest a feature](https://github.com/encolajs/encolajs-enforma/issues/new)

## License

This project is licensed under a dual license model:

- ✅ Free for personal and development use (non-commercial)
- 💼 Requires a commercial license for production/commercial use [Learn more →](https://encolajs.com/)

See [LICENSE](./LICENSE) and [LICENSE-COMMERCIAL.md](./LICENSE-COMMERCIAL.md) for details.

---

Built with ❤️ by the EncolaJS team