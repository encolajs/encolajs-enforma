# Frequently Asked Questions

This page addresses common questions and issues that may arise when working with Enforma.

## General Questions

### What is Enforma?

Enforma is a flexible form building library for Vue.js that allows you to create complex forms using different rendering approaches: field-based, schema-based, headless, or a mix of these styles. It provides powerful validation, state management, and UI integration capabilities.

### How is Enforma different from other form libraries?

Enforma focuses on flexibility in rendering approaches while maintaining a consistent state management system. Key differentiators include:

- Multiple rendering modes in a single library
- First-class support for UI library integration
- Advanced schema capabilities with dynamic expressions
- Optimized performance even for complex forms
- Comprehensive validation system

### What Vue versions does Enforma support?

Enforma is built for Vue 3. It leverages Vue's Composition API and the latest reactivity system for optimal performance.

## Getting Started

### Do I need to use a specific UI library with Enforma?

No, Enforma is UI-library agnostic. You can use it with:

- Built-in presets for PrimeVue and Vuetify
- Any other UI library by creating a custom preset
- Your own custom components
- Headless mode for complete UI freedom

However the library comes with 2 presets: PrimeVue and Vuetify

### How do I create a basic form?

Here's a simple example:

```vue
<template>
  <Enforma :data="formData" :submitHandler="submit">
    <EnformaField name="name" label="Name" />
    <EnformaField name="email" label="Email" />
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
import { ref } from 'vue';
import { Enforma, EnformaField, EnformaSubmitButton } from '@encolajs/enforma';

const formData = ref({
  name: '',
  email: ''
});

function submit(data) {
  console.log('Form submitted:', data);
}
</script>
```

## Form Configuration

### How do I add validation to my forms?

You can add validation at the form level:

```vue
<template>
  <Enforma :data="formData" :rules="validators" :submitHandler="submit">
    <EnformaField name="username" label="Username" />
    <EnformaField name="email" label="Email" />
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
const validators = {
  username: 'required|min:3',
  email: 'required|email'
};
</script>
```

### How do I create conditional fields?

Use the `#default` template to access the formController and use `v-if` :

```vue
<template>
  <Enforma :data="formData">
    <template #default="formController">
        <EnformaField 
          name="has_shipping" 
          type="checkbox" 
          label="This order requires shipping" 
        />
        
        <EnformaField 
          name="shipping_address" 
          label="Shipping Address" 
          v-if="formController.getFieldValue('has_shipping')" 
        />
    </template>
  </Enforma>
</template>
```

For [schema forms](/schema-forms/) you should use the `if` attribute

### How do I handle form submission?

Use the `@submit` event:

```vue
<template>
  <Enforma :data="formData" :submitHandler="submit">
    <!-- Form fields -->
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
async function submit(data) {
  try {
    // Submit to your API
    const response = await api.submitForm(data);
    // Handle success
  } catch (error) {
    // Handle error
  }
}
</script>
```

## Common Issues

### Why isn't my form validating?

1. Ensure validators are correctly defined
2. Check for typos in field names
4. Ensure your validators are registered correctly

### Form is not resetting to the initial values

Most likely it's because [the default function that creates a clone of the values](/core-concepts/configuration.md#behavior-configuration-behavior) is not powerful enough for your use-case

### My dynamic field conditions aren't working

1. Make sure you're using the correct syntax: `$form.fieldName` or `$form['fieldName']`
2. For nested properties, use optional chaining: `$form.address?.city`
3. For array items, ensure correct notation: `$form.items[0].name`
4. Check reactivity - make sure form data changes are tracked properly

### How do I debug form state?

In the Vue Dev Tools, locate the form component (`Enforma` or `HeadlessForm`) and see the exposed props and methods.

### Form values aren't updating correctly

1. Verify your component preset correctly maps events
2. For custom components, make sure they emit the correct events
3. Check for value transformation issues with complex data types

## Advanced Usage

### How do I handle file uploads?

Use the file field type:

```vue
<template>
  <Enforma :data="formData" :submitHandler="submit">
    <EnformaField 
      name="profileImage" 
      type="file" 
      label="Profile Image" 
      accept="image/*" 
    />
  </Enforma>
</template>

<script setup>
async function submit(data) {
  const formData = new FormData();
  formData.append('file', data.profileImage);
  
  await api.uploadFile(formData);
}
</script>
```

### How do I create custom field components?

Check out the guide on how to [create your own UI preset](/ui-library-integration/creating-your-own-ui-preset.md) and the source code of the Vuetify preset which does exactly that

### How do I handle async validation?

Check out the [async validation recipe](/recipes/async-validation.md)

## Integration

### How do I use Enforma with Pinia or Vuex?

Connect your store with two-way binding:

```vue
<template>
  <Enforma 
    :data="userData" 
    :submitHandler="updateUser"
  >
    <!-- Form fields -->
  </Enforma>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const { userData } = storeToRefs(userStore);

function updateUser(data) {
  userStore.updateUser(data);
}
</script>
```