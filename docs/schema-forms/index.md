# Schema-based Forms

Schema-based forms in Enforma allow you to define your entire form structure using a JSON schema, enabling dynamic form generation with minimal code. This approach is particularly useful for complex forms, admin interfaces, and applications where form structures need to be defined at runtime.

> :notebook_with_decorative_cover: For a complete working example check out the [schema form example](/examples/schema-only.md)

### Key Benefits

- **Declarative Approach** - Define your entire form using simple JSON
- **Reduced Boilerplate** - Eliminate repetitive component definitions
- **Server-driven UIs** - Forms can be defined on the server and rendered by the client
- **Embedded Validation** - Define validation rules directly in the schema alongside field definitions

## The Schema Component

Enforma provides a simple [EnformaSchema](/field-forms/enforma-schema.md) component for rendering schema-based forms. You don't really need to concern with it because it is automatically used if a form receives a `schema` prop. 

This is how you render a schema-based form

```vue
<template>
  <Enforma
    :data="formData"
    :rules="formRules"
    :schema="formSchema"
    :submit-handler="handleSubmit"
  />
</template>
```

> [!INFO] This component can be customized via the configuration

## Schema Features

To take advantage of the schema-based forms, you have to learn these concepts:

1. **[Schema Reference](/schema-forms/schema-reference.md)** - Full reference for schema structure and options
2. **[Dynamic Props](/schema-forms/dynamic-props.md)** - Use expressions to create reactive field properties
3. **[Field Slots](field-slots.md)** - Customize individual fields using slots
4. **[Transformers](/schema-forms/transformers.md)** - Transform schemas, context, and configuration at runtime
5. **[Schema-Based Validation](/core-concepts/validation#schema-based-validation)** - Define validation rules directly in the schema
