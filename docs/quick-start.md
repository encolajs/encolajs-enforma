# Quick Start

EncolaJS Enforma is a Vue 3 form library that combines flexibility and simplicity, allowing you to create powerful forms with minimal code. This guide will help you build your first form and understand the different rendering approaches available.

## Your First Form

Let's start with a simple form that collects a user's name and email address:

```vue
<template>
  <Enforma :data="formData" :rules="validationRules" :submit-handler="handleSubmit">
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
    
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
import { ref } from 'vue'
import { Enforma, EnformaField, EnformaSubmitButton } from '@encolajs/enforma'

// Form data with initial values
const formData = ref({
  name: '',
  email: '',
})

// Validation rules
const validationRules = {
  name: 'required',
  email: 'required|email',
}

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

1. **Field-based Rendering**: As shown in the example above, you explicitly declare each field component, giving you precise control over layout and field placement.

2. **Schema-based Rendering**: Define your form structure as a JavaScript object, which is great for dynamic forms or when you want to separate form structure from presentation.

3. **Headless Mode**: For complete UI control, use the headless components that provide behavior without enforcing any specific design.

4. **Mixed Mode**: Combine different approaches as needed, such as using schema-defined fields alongside explicit field components.

## Live Demo Examples

To see these different rendering modes in action, check out our examples:

- [Field-based Form Example](/examples/fields.md) - Forms built with explicit field components
- [Schema-based Form Example](/examples/schema-only.md) - Forms defined entirely by a schema object
- [Headless Components Example](/examples/headless-components.md) - Forms with complete UI freedom
- [Mixed Form Example](/examples/mixed-form.md) - Combining different rendering approaches

Each example includes source code, explanations, and a live demo to help you understand how to implement these patterns in your own applications.

### Next Steps

Now that you've created your first form, explore these resources to deepen your understanding:

- [Form Validation](/core-concepts/validation.md) - Learn about validation rules and custom validations
- [Configuration Options](/core-concepts/configuration.md) - Customize Enforma to suit your needs
- [Rendering Modes](/core-concepts/rendering-modes.md) - Dive deeper into the different ways to build forms