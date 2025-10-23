# Introduction to EncolaJS Enforma

Enforma is a modern form builder for Vue 3 applications that prioritizes flexibility, performance, and developer experience. It allows you to build everything from simple forms to complex, dynamic forms with validation, nested fields, repeatable sections, and more.

## What is Enforma?

Enforma is a schema-driven form builder for Vue that lets you create powerful forms with minimal code. Whether you prefer to build forms by hand, define them with JSON schemas, or have complete UI freedom with headless components, Enforma has you covered.

```vue
<script setup>
import { ref } from 'vue'
import { createEncolaValidator } from '@encolajs/enforma/validators/encola'

const userData = ref({
  firstName: '',
  lastName: '',
  email: ''
})

const validator = createEncolaValidator({
  firstName: 'required',
  lastName: 'required',
  email: 'required|email'
})

const handleSubmit = (data) => {
  console.log('Form submitted:', data)
}
</script>

<template>
  <Enforma
    :data="userData"
    :validator="validator"
    :submitHandler="handleSubmit"
  >
    <EnformaField name="firstName" label="First Name" />
    <EnformaField name="lastName" label="Last Name" />
    <EnformaField name="email" label="Email" />

    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>
```

## Why Enforma?

- **Multiple Rendering Approaches**: Use field-based, schema-based, headless, or mixed approaches
- **Flexible Validation**: Choose from multiple validators (Zod, Yup, Valibot, @encolajs/validator) with tree-shakable imports for optimal bundle size
- **UI Framework Agnostic**: Works seamlessly with Vuetify, PrimeVue, Quasar, or your own components
- **Complex Data Handling**: Support for nested fields, repeatable sections, and complex data structures
- **Developer Experience**: Intuitive API and comprehensive documentation
- **Performance Optimized**: Forms remain responsive even with hundreds of fields

## Key Features

### 🧩 Multiple Form Building Approaches

#### Field-Based Forms

Great for explicit control and static forms.

```vue
<script setup>
import { createEncolaValidator } from '@encolajs/enforma/validators/encola'

const validator = createEncolaValidator({
  firstName: 'required',
  lastName: 'required'
})
</script>

<template>
  <Enforma :data="data" :validator="validator">
    <EnformaField name="firstName" label="First Name" />
    <EnformaField name="lastName" label="Last Name" />
  </Enforma>
</template>
```

#### Schema-Based Forms

Perfect for dynamic forms or server-driven UIs.

```vue
<script setup>
import { createEncolaValidator } from '@encolajs/enforma/validators/encola'

const validator = createEncolaValidator(rules)
</script>

<template>
  <Enforma
    :data="data"
    :validator="validator"
    :schema="formSchema"
  />
</template>
```

#### Headless Forms

Complete UI design freedom.

```vue
<script setup>
import { createZodValidator } from '@encolajs/enforma/validators/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

const validator = createZodValidator(schema)
</script>

<template>
  <HeadlessForm :data="data" :validator="validator">
    <template #default="{ values, errors, touched, validate }">
      <!-- Your custom UI implementation -->
    </template>
  </HeadlessForm>
</template>
```

### 🛠️ Rich Component Ecosystem

- **EnformaField**: Core field component with support for various input types
- **EnformaSection**: Group fields with conditional rendering
- **EnformaRepeatable**: Create repeatable field groups for complex data
- **EnformaRepeatableTable**: Table-based repeatable fields

### 🎨 UI Library Integration

Enforma integrates with popular UI libraries:

```js
// For Vuetify
import { useVuetifyPreset } from '@encolajs/enforma/presets/vuetify'
useVuetifyPreset()

// For PrimeVue
import { usePrimeVuePreset } from '@encolajs/enforma/presets/primevue'
usePrimeVuePreset()

// For Quasar
import { useQuasarPreset } from '@encolajs/enforma/presets/quasar'
useQuasarPreset()
```

### 🔄 Advanced Features

- **Dynamic Properties**: Reactive props based on form values
- **Transformation System**: Transform props at the form, field, and section levels
- **Custom Components**: Easily integrate your own components
- **Multiple Validators**: Use Zod, Yup, Valibot, or @encolajs/validator with tree-shakable imports
- **Cross-field Validation**: Validate fields in relation to one another
- **Async Validation**: Support for server-side validation

## Getting Started

### Installation

```bash
npm install @encolajs/enforma
```

### Basic Setup

```js
import { createApp } from 'vue'
import App from './App.vue'
import { EnformaPlugin } from '@encolajs/enforma'

const app = createApp(App)
app.use(EnformaPlugin)
app.mount('#app')
```

## Next Steps

Ready to dive deeper? Check out these resources:

- [Quick Start Guide](/quick-start.html)
- [Core Concepts](/core-concepts/architecture-overview.html)
- [Field-based Forms](/field-forms/index.html)
- [Schema-based Forms](/schema-forms/index.html)
- [Examples](/examples/index.html)