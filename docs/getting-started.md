# Introduction to EncolaJS Enforma

Enforma is a modern form builder for Vue 3 applications that prioritizes flexibility, performance, and developer experience. It allows you to build everything from simple forms to complex, dynamic forms with validation, nested fields, repeatable sections, and more.

## What is Enforma?

Enforma is a schema-driven form builder for Vue that lets you create powerful forms with minimal code. Whether you prefer to build forms by hand, define them with JSON schemas, or have complete UI freedom with headless components, Enforma has you covered.

```vue
<script setup>
import { ref } from 'vue'

const userData = ref({
  firstName: '',
  lastName: '',
  email: ''
})

const rules = {
  firstName: 'required',
  lastName: 'required',
  email: 'required|email'
}

const handleSubmit = (data) => {
  console.log('Form submitted:', data)
}
</script>

<template>
  <Enforma 
    :data="userData" 
    :rules="rules" 
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
- **Powerful Validation**: Built-in validation with 30+ rules, cross-field validation, and async validation
- **UI Framework Agnostic**: Works seamlessly with Vuetify, PrimeVue, Quasar, or your own components
- **Complex Data Handling**: Support for nested fields, repeatable sections, and complex data structures
- **Developer Experience**: Intuitive API and comprehensive documentation
- **Performance Optimized**: Forms remain responsive even with hundreds of fields

## Key Features

### 🧩 Multiple Form Building Approaches

#### Field-Based Forms

Great for explicit control and static forms.

```vue
<Enforma :data="data" :rules="rules">
  <EnformaField name="firstName" label="First Name" />
  <EnformaField name="lastName" label="Last Name" />
</Enforma>
```

#### Schema-Based Forms

Perfect for dynamic forms or server-driven UIs.

```vue
<Enforma 
  :data="data" 
  :rules="rules" 
  :schema="formSchema" 
/>
```

#### Headless Forms

Complete UI design freedom.

```vue
<HeadlessForm :data="data" :rules="rules">
  <template #default="{ values, errors, touched, validate }">
    <!-- Your custom UI implementation -->
  </template>
</HeadlessForm>
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
- **Validation**: Sophisticated validation system with cross-field validation

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