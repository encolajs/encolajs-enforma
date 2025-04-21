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

Enforma is built for Vue 3 and requires Vue 3.2 or later. It leverages Vue's Composition API and the latest reactivity system for optimal performance.

## Getting Started

### How do I install Enforma?

Install Enforma via npm or yarn:

```bash
npm install encolajs-formkit
# or
yarn add encolajs-formkit
```

Then import and use it in your Vue application:

```js
import { createApp } from 'vue';
import { createEnforma } from 'encolajs-formkit';
import App from './App.vue';

const app = createApp(App);
const formkit = createEnforma();

app.use(formkit);
app.mount('#app');
```

### Do I need to use a specific UI library with Enforma?

No, Enforma is UI-library agnostic. You can use it with:

- Built-in presets for PrimeVue and Vuetify
- Any other UI library by creating a custom preset
- Your own custom components
- Headless mode for complete UI freedom

### How do I create a basic form?

Here's a simple example:

```vue
<template>
  <Enforma v-model="formData" @submit="onSubmit">
    <EnformaField name="name" label="Name" />
    <EnformaField name="email" type="email" label="Email" />
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
import { ref } from 'vue';
import { Enforma, EnformaField, EnformaSubmitButton } from 'encolajs-formkit';

const formData = ref({
  name: '',
  email: ''
});

function onSubmit(data) {
  console.log('Form submitted:', data);
}
</script>
```

## Form Configuration

### How do I add validation to my forms?

You can add validation at the form level:

```vue
<template>
  <Enforma v-model="formData" :validators="validators" @submit="onSubmit">
    <EnformaField name="username" label="Username" />
    <EnformaField name="email" type="email" label="Email" />
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
const validators = {
  username: ['required', 'min:3'],
  email: ['required', 'email']
};
</script>
```

Or at the field level:

```vue
<EnformaField 
  name="username" 
  label="Username" 
  validators="required|min:3" 
/>
```

### How do I create conditional fields?

Use the `if` prop with an expression:

```vue
<template>
  <Enforma v-model="formData">
    <EnformaField 
      name="hasShipping" 
      type="checkbox" 
      label="This order requires shipping" 
    />
    
    <EnformaField 
      name="shippingAddress" 
      label="Shipping Address" 
      :if="$form.hasShipping" 
    />
  </Enforma>
</template>
```

### How do I handle form submission?

Use the `@submit` event:

```vue
<template>
  <Enforma v-model="formData" @submit="onSubmit">
    <!-- Form fields -->
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
async function onSubmit(data) {
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

Check these common issues:

1. Ensure validators are correctly defined
2. Verify validation triggers (default is `['input', 'blur', 'submit']`)
3. Check for typos in field names
4. Ensure your validators are registered correctly

### My dynamic field conditions aren't working

Common solutions:

1. Make sure you're using the correct syntax: `$form.fieldName` or `$form['fieldName']`
2. For nested properties, use optional chaining: `$form.address?.city`
3. For array items, ensure correct notation: `$form.items[0].name`
4. Check reactivity - make sure form data changes are tracked properly

### How do I debug form state?

Use the `useForm` composable to access form state:

```vue
<template>
  <Enforma v-model="formData" id="myForm">
    <!-- Form fields -->
  </Enforma>
  
  <pre>{{ formState }}</pre>
</template>

<script setup>
import { useForm } from 'encolajs-formkit';

const { formState } = useForm('myForm');
</script>
```

### Form values aren't updating correctly

Check these issues:

1. Ensure proper two-way binding with `v-model`
2. Verify your component preset correctly maps events
3. For custom components, make sure they emit the correct events
4. Check for value transformation issues with complex data types

## Advanced Usage

### How do I handle file uploads?

Use the file field type:

```vue
<template>
  <Enforma v-model="formData" @submit="onSubmit">
    <EnformaField 
      name="profileImage" 
      type="file" 
      label="Profile Image" 
      accept="image/*" 
    />
    <EnformaSubmitButton>Upload</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
async function onSubmit(data) {
  const formData = new FormData();
  formData.append('file', data.profileImage);
  
  await api.uploadFile(formData);
}
</script>
```

### How do I create custom field components?

Create a component that follows Enforma's component contract:

```vue
<!-- MyCustomField.vue -->
<template>
  <div class="custom-field">
    <label v-if="label">{{ label }}</label>
    <div class="field-input">
      <!-- Your custom input implementation -->
      <input 
        :value="modelValue" 
        @input="$emit('update:modelValue', $event.target.value)" 
      />
    </div>
    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: [String, Number, Boolean, Object, Array],
  label: String,
  error: String
});

defineEmits(['update:modelValue']);
</script>
```

Then register it:

```js
const formConfig = {
  components: {
    custom: MyCustomField
  }
};
```

### How do I handle async validation?

Create an async validator:

```js
const asyncValidators = {
  username: [
    'required',
    {
      name: 'unique',
      validate: async (value) => {
        if (!value) return true;
        
        const response = await fetch(`/api/check-username?username=${value}`);
        const data = await response.json();
        return data.isAvailable;
      },
      message: 'This username is already taken'
    }
  ]
};
```

## Performance

### My form is slow with many fields. How can I optimize it?

Try these optimizations:

1. Use `v-if` instead of `:if` for static conditional rendering
2. For repeatable sections with many items, use a virtualized list
3. Delay validation for fields that trigger expensive validation
4. Memoize computed values and event handlers
5. Use the `shallowRef` for large form data objects

### How can I improve validation performance?

1. Use the `validateOn` prop to control when validation occurs
2. For expensive validators, use debounced validation
3. Consider validating only on blur for fields with many keystroke changes
4. For large forms, validate sections individually rather than the whole form

## Integration

### How do I use Enforma with Pinia or Vuex?

Connect your store with two-way binding:

```vue
<template>
  <Enforma 
    v-model="userData" 
    @submit="updateUser"
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

### Can I use Enforma with SSR?

Yes, Enforma works with SSR frameworks like Nuxt. Import components as needed and ensure your UI library is also SSR-compatible.