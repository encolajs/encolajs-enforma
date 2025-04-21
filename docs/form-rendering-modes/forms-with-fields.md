# Forms with Fields

The field-based approach is the most straightforward way to build forms with Enforma. It allows you to explicitly define each form field in your template, giving you complete control over layout and structure.

## Basic Usage

A simple form using the field-based approach looks like this:

```vue
<template>
  <Enforma :data="formData" :submitHandler="submit">
    <EnformaField name="firstName" label="First Name" />
    <EnformaField name="lastName" label="Last Name" />
    <EnformaField name="email" type="email" label="Email Address" />
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
import { ref } from 'vue';
import { Enforma, EnformaField, EnformaSubmitButton } from 'encolajs-formkit';

const formData = ref({
  firstName: '',
  lastName: '',
  email: ''
});

function submit(data) {
  console.log('Form submitted:', data);
  // Process form data
}
</script>
```

## Field Components

The `EnformaField` component is the building block of field-based forms. It provides:

- Form field state management
- Validation integration
- Error display
- Label handling
- Help text support
- Accessibility features

## Field Types

You can specify different field types using the `type` prop:

```vue
<template>
  <Enforma :data="formData">
    <EnformaField name="name" type="text" label="Name" />
    <EnformaField name="email" type="email" label="Email" />
    <EnformaField name="password" type="password" label="Password" />
    <EnformaField name="bio" type="textarea" label="Biography" />
    <EnformaField name="birthdate" type="date" label="Birth Date" />
    <EnformaField name="subscribe" type="checkbox" label="Subscribe to newsletter" />
    <EnformaField name="gender" type="radio" label="Gender" 
                 :options="['Male', 'Female', 'Non-binary', 'Prefer not to say']" />
    <EnformaField name="country" type="select" label="Country" 
                 :options="countries" />
  </Enforma>
</template>
```

## Field Layout and Styling

The field-based approach gives you complete control over form layout:

```vue
<template>
  <Enforma :data="formData">
    <div class="form-row">
      <EnformaField name="firstName" label="First Name" class="col-6" />
      <EnformaField name="lastName" label="Last Name" class="col-6" />
    </div>
    
    <div class="form-section">
      <h3>Contact Information</h3>
      <EnformaField name="email" type="email" label="Email" />
      <EnformaField name="phone" type="tel" label="Phone" />
    </div>
    
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>
```

## Field Validation

You can add validation rules directly to fields:

```vue
<template>
  <Enforma :data="formData">
    <EnformaField 
      name="username" 
      label="Username" 
      validators="required|min:3|max:20"
    />
    
    <EnformaField 
      name="email" 
      type="email" 
      label="Email" 
      :rules="['required', 'email']"
    />
    
    <EnformaField 
      name="password" 
      type="password" 
      label="Password" 
      :rules="passwordValidators"
    />
  </Enforma>
</template>

<script setup>
const passwordValidators = [
  'required',
  'min:8',
  { 
    name: 'pattern', 
    params: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/],
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  }
];
</script>
```

## When to Use Field-Based Forms

Field-based forms are ideal when:

- You need precise control over form layout
- Your form structure is relatively static
- You prefer working with explicit templates rather than schemas
- You're building forms with complex layouts or custom styling
- Your team is more comfortable with component-based approaches

This approach provides the most flexibility and control, making it a great starting point for most Enforma applications.