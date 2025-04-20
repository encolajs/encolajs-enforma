# EnformaSchema

`EnformaSchema` renders form elements from a JSON schema definition. This component is powerful for dynamically generated forms, admin interfaces, or any scenario where form structure is defined in data rather than templates.

## Basic Usage

```vue
<template>
  <Enforma v-model="formData" @submit="onSubmit">
    <EnformaSchema :schema="formSchema" />
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
import { ref } from 'vue';
import { Enforma, EnformaSchema, EnformaSubmitButton } from 'encolajs-formkit';

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  age: null,
  subscribe: false
});

const formSchema = {
  fields: [
    { name: 'firstName', label: 'First Name', component: 'text' },
    { name: 'lastName', label: 'Last Name', component: 'text' },
    { name: 'email', label: 'Email Address', component: 'email' },
    { name: 'age', label: 'Age', component: 'number', props: { min: 18 } },
    { name: 'subscribe', label: 'Subscribe to newsletter', component: 'checkbox' }
  ]
};

function onSubmit(data) {
  console.log('Form submitted:', data);
}
</script>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `schema` | `Object` | The form schema definition (required) |
| `baseFieldPath` | `String` | Base path for all fields in this schema (for nested data) |
| `rootSchema` | `Boolean` | Whether this is the root schema of the form |

## Schema Structure

A schema can contain the following top-level elements:

### Fields

Basic form fields:

```js
{
  fields: [
    { 
      name: 'username',              // Field name (required)
      label: 'Username',             // Field label
      component: 'text',             // Component type
      validators: ['required', 'min:3'], // Validation rules
      helpText: 'Choose a unique username', // Help text
      placeholder: 'Enter username', // Placeholder text
      if: true,                      // Conditional display
      disabled: false,               // Whether field is disabled
      props: {                       // Additional props for the component
        autocomplete: 'username'
      }
    },
    // More fields...
  ]
}
```

### Sections

Group fields into sections:

```js
{
  sections: [
    {
      title: 'Personal Information',    // Section title
      subtitle: 'Your basic details',   // Optional subtitle
      collapsible: true,                // Whether section can be collapsed
      collapsed: false,                 // Initial collapsed state
      if: true,                         // Conditional display
      fields: [                         // Fields in this section
        { name: 'firstName', label: 'First Name', component: 'text' },
        { name: 'lastName', label: 'Last Name', component: 'text' }
      ]
    },
    // More sections...
  ]
}
```

### Repeatables

Arrays of objects:

```js
{
  repeatables: [
    {
      name: 'contacts',              // Array name
      label: 'Contacts',             // Label for the repeatable group
      min: 1,                        // Minimum number of items
      max: 5,                        // Maximum number of items
      addLabel: 'Add Contact',       // Text for add button
      if: true,                      // Conditional display
      fields: [                      // Fields in each item
        { name: 'name', label: 'Name', component: 'text' },
        { name: 'email', label: 'Email', component: 'email' }
      ]
    },
    // More repeatables...
  ]
}
```

### RepeatableTables

Tabular arrays of objects:

```js
{
  repeatableTables: [
    {
      name: 'products',              // Array name
      addLabel: 'Add Product',       // Text for add button
      columns: [                     // Column definitions
        {
          header: 'Product Name',    // Column header
          field: 'name',             // Field within each item
          component: 'text',         // Component for editing
          validators: ['required']   // Validation rules
        },
        {
          header: 'Quantity',
          field: 'quantity',
          component: 'number',
          validators: ['required', 'min:1'],
          props: { min: 1 }
        },
        {
          header: 'Price',
          field: 'price',
          component: 'number',
          props: { step: 0.01 }
        }
      ]
    }
  ]
}
```

### Buttons

Form action buttons:

```js
{
  buttons: [
    {
      label: 'Submit',               // Button text
      type: 'submit',                // Button type (submit, reset)
      variant: 'primary',            // Visual style
      props: {                       // Additional props
        class: 'mt-4'
      }
    },
    {
      label: 'Cancel',
      type: 'button',
      handler: () => router.back(),  // Click handler
      variant: 'secondary'
    }
  ]
}
```

## Dynamic Schema Values

Schema values can be dynamic using expressions or functions:

```js
const formSchema = {
  fields: [
    {
      name: 'country',
      label: 'Country',
      component: 'select',
      options: ['US', 'Canada', 'UK', 'Other']
    },
    {
      name: 'state',
      label: 'State/Province',
      component: 'select',
      
      // Expression-based conditional
      if: '$form.country === "US" || $form.country === "Canada"',
      
      // Function-based options
      options: ($form) => {
        if ($form.country === 'US') {
          return ['California', 'Texas', 'New York', /* ... */];
        } else if ($form.country === 'Canada') {
          return ['Ontario', 'Quebec', 'British Columbia', /* ... */];
        }
        return [];
      }
    }
  ]
};
```

## Using Inside Field-Based Forms

You can use `EnformaSchema` inside field-based forms to mix approaches:

```vue
<template>
  <Enforma v-model="formData" @submit="onSubmit">
    <!-- Direct field declarations -->
    <h2>Personal Information</h2>
    <EnformaField name="firstName" label="First Name" />
    <EnformaField name="lastName" label="Last Name" />
    
    <!-- Schema-based section -->
    <h2>Contact Information</h2>
    <EnformaSchema :schema="contactSchema" />
    
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
const contactSchema = {
  fields: [
    { name: 'email', label: 'Email', component: 'email' },
    { name: 'phone', label: 'Phone', component: 'tel' },
    { 
      name: 'preferredContact', 
      label: 'Preferred Contact Method', 
      component: 'radio',
      options: ['Email', 'Phone']
    }
  ]
};
</script>
```

## Nested Data with baseFieldPath

Use `baseFieldPath` for nested data structures:

```vue
<template>
  <Enforma v-model="formData" @submit="onSubmit">
    <h2>Billing Address</h2>
    <EnformaSchema :schema="addressSchema" baseFieldPath="billing" />
    
    <h2>Shipping Address</h2>
    <EnformaField 
      name="sameAsBilling" 
      type="checkbox" 
      label="Same as billing address" 
    />
    
    <div v-if="!formData.sameAsBilling">
      <EnformaSchema :schema="addressSchema" baseFieldPath="shipping" />
    </div>
    
    <EnformaSubmitButton>Continue</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
import { ref } from 'vue';

const formData = ref({
  sameAsBilling: false,
  billing: {
    street: '',
    city: '',
    zipCode: '',
    country: ''
  },
  shipping: {
    street: '',
    city: '',
    zipCode: '',
    country: ''
  }
});

const addressSchema = {
  fields: [
    { name: 'street', label: 'Street Address', component: 'text' },
    { name: 'city', label: 'City', component: 'text' },
    { name: 'zipCode', label: 'ZIP Code', component: 'text' },
    { name: 'country', label: 'Country', component: 'select',
      options: ['United States', 'Canada', 'United Kingdom', 'Australia'] }
  ]
};
</script>
```

## Custom Field Rendering

Override the rendering of specific fields using slots:

```vue
<template>
  <Enforma v-model="formData">
    <EnformaSchema :schema="formSchema">
      <!-- Custom rendering for the "avatar" field -->
      <template #field:avatar="{ fieldProps }">
        <div class="avatar-field">
          <label>{{ fieldProps.label }}</label>
          <AvatarUploader 
            :value="formData.avatar"
            @update:value="val => formData.avatar = val"
          />
        </div>
      </template>
    </EnformaSchema>
  </Enforma>
</template>

<script setup>
import AvatarUploader from '@/components/AvatarUploader.vue';

const formSchema = {
  fields: [
    { name: 'username', label: 'Username', component: 'text' },
    { name: 'avatar', label: 'Profile Picture', component: 'custom' }
  ]
};
</script>
```

## Loading Schema from an API

You can fetch schema definitions from an API:

```vue
<template>
  <div>
    <div v-if="loading">Loading form...</div>
    <Enforma v-else v-model="formData" @submit="onSubmit">
      <EnformaSchema :schema="formSchema" />
      <EnformaSubmitButton>Submit</EnformaSubmitButton>
    </Enforma>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Enforma, EnformaSchema, EnformaSubmitButton } from 'encolajs-formkit';

const formData = ref({});
const formSchema = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    // Fetch the form schema from an API
    const response = await fetch('/api/forms/customer-profile');
    formSchema.value = await response.json();
    
    // Initialize form data with default values
    formData.value = buildInitialData(formSchema.value);
    
    loading.value = false;
  } catch (error) {
    console.error('Failed to load form schema:', error);
  }
});

function buildInitialData(schema) {
  // Helper to build initial data structure from schema
  const data = {};
  
  // Process fields
  if (schema.fields) {
    schema.fields.forEach(field => {
      data[field.name] = field.defaultValue !== undefined ? field.defaultValue : '';
    });
  }
  
  // Process sections
  if (schema.sections) {
    schema.sections.forEach(section => {
      if (section.fields) {
        section.fields.forEach(field => {
          data[field.name] = field.defaultValue !== undefined ? field.defaultValue : '';
        });
      }
    });
  }
  
  // Process repeatables
  if (schema.repeatables) {
    schema.repeatables.forEach(repeatable => {
      data[repeatable.name] = repeatable.defaultValue || [];
    });
  }
  
  return data;
}

function onSubmit(data) {
  console.log('Form submitted:', data);
}
</script>
```

## Best Practices

- Keep schema definitions clean and focused
- Use proper component types for each field
- Leverage dynamic expressions for conditional logic
- Group related fields into sections
- Provide sensible defaults and validation rules
- Use descriptive labels and help text
- Consider schema reusability and composition
- For complex customizations, use field slots