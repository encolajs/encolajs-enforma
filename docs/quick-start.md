# Quick Start

EncolaJS Enforma is a Vue 3 form library that combines flexibility and simplicity, allowing you to create powerful forms with minimal code. This guide will help you build your first form and understand the different rendering approaches available.

## Your First Form

Once you finish the [installation](installation.md) you can start with a simple form that collects a user's name and email address:

```vue
<template>
  <Enforma :data="formData" :validator="validator" :submit-handler="handleSubmit">
    <EnformaField
      name="name"
      label="Full Name"
      inputComponent="text"
      required
    />

    <EnformaField
      name="email"
      label="Email Address"
      inputComponent="email"
      required
    />
  </Enforma>
</template>

<script setup>
import { ref } from 'vue'
import { Enforma, EnformaField } from '@encolajs/enforma'
import { createEncolaValidator } from '@encolajs/enforma/validators/encola'

// Form data with initial values
const formData = ref({
  name: '',
  email: '',
})

// Create validator with validation rules
const validator = createEncolaValidator({
  name: 'required',
  email: 'required|email',
})

// Submit handler
const handleSubmit = async (data) => {
  console.log('Form submitted:', data)
  // Process your form data here (e.g., API submission)
  return true // Return true for successful submission
}
</script>
```

That's it! With just a few lines of code, you have a complete form with:
- Form state management
- Input components
- Labels
- Required field indicators
- Client-side validation
- Error messages
- A submit button

## Rendering Modes

EncolaJS Enforma offers multiple ways to build your forms, allowing you to choose the approach that best fits your needs:

1. **[Field-based Rendering](/examples/fields.md)**: As shown in the example above, you explicitly declare each field component, giving you precise control over layout and field placement.
2. **[Schema-based Rendering](/examples/schema-only.md)**: Define your form structure as a JavaScript object, which is great for dynamic forms or when you want to separate form structure from presentation.
3. **[Mixed Mode](examples/mixed-form.md)**: Combine different approaches as needed, such as using schema-defined fields alongside explicit field components.
4. **[Headless Mode](/examples/headless-components.md)**: For complete UI control, use the headless components that provide behavior without enforcing any specific design.

Each example includes source code with explanations, and a live demo.

### Next Steps

Now that you've created your first form, explore these resources to deepen your understanding:

- [Form Validation](/core-concepts/validation.md) - Learn about validation rules and custom validations
- [Configuration Options](/core-concepts/configuration.md) - Customize Enforma to suit your needs
- [Rendering Modes](/core-concepts/rendering-modes.md) - Dive deeper into the different ways to build forms