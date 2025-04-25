# Schema-based Forms

Schema-based forms in Enforma allow you to define your entire form structure using a JSON schema, enabling dynamic form generation with minimal code. This approach is particularly useful for complex forms, admin interfaces, and applications where form structures need to be defined at runtime.

## Key Benefits

- **Declarative Approach** - Define your entire form using simple JSON
- **Reduced Boilerplate** - Eliminate repetitive component definitions
- **Dynamic Forms** - Generate forms based on user input or API responses
- **Consistent Styling** - Ensure uniform appearance across all form elements
- **Simple Structure Changes** - Modify form layout without changing component code
- **Server-driven UIs** - Forms can be defined on the server and rendered by the client

## Schema Components

Enforma provides specialized components for schema-based form rendering:

- [EnformaSchema](/field-forms/enforma-schema.md) - Renders a complete form based on a JSON schema
- [Enforma with schema prop](/schema-forms/schema-reference.md) - The main form component with schema support

## Schema Features

When using schema-based forms, you have access to several powerful features:

1. **[Schema Reference](/schema-forms/schema-reference.md)** - Full reference for schema structure and options
2. **[Dynamic Props](/schema-forms/dynamic-props.md)** - Use expressions to create reactive field properties
3. **[Transformers](/schema-forms/transformers.md)** - Transform schemas, context, and configuration at runtime
4. **[Mixed Forms](/schema-forms/mixed-forms.md)** - Combine schema-based fields with manual field components

## Getting Started with Schema Forms

To create a schema-based form, you define a schema object that describes all aspects of your form and pass it to the `schema` prop of the `Enforma` component:

```vue
<template>
  <Enforma
    :data="formData"
    :schema="formSchema"
    :submit-handler="handleSubmit"
  />
</template>

<script setup>
import { ref } from 'vue';
import { Enforma } from 'encolajs-enforma';

const formData = ref({
  username: '',
  email: '',
  password: '',
});

const formSchema = {
  username: {
    type: 'field',
    label: 'Username',
    component: 'input',
    required: true,
    inputProps: {
      type: 'text',
    },
  },
  email: {
    type: 'field',
    label: 'Email',
    component: 'input',
    required: true,
    inputProps: {
      type: 'email',
    },
  },
  password: {
    type: 'field',
    label: 'Password',
    component: 'input',
    required: true,
    inputProps: {
      type: 'password',
    },
  },
};

const handleSubmit = async (formData) => {
  console.log('Form submitted:', formData);
};
</script>
```

## Next Steps

Explore these guides to learn more about schema-based forms:

- [Schema Reference](/schema-forms/schema-reference.md) - Learn the schema structure
- [Dynamic Props](/schema-forms/dynamic-props.md) - Create reactive field properties
- [Transformers](/schema-forms/transformers.md) - Transform form elements at runtime
- [Mixed Forms](/schema-forms/mixed-forms.md) - Combine schema and manual components