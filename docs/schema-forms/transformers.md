# Schema Transformers

When working with schema-based forms, one of the most powerful features is the ability to transform the schema at runtime. Schema transformers allow you to dynamically modify your form structure based on form state, context, or other runtime conditions.

## What Are Schema Transformers?

Schema transformers are functions that:
- Receive the current schema and form controller as arguments
- Return a modified version of the schema
- Are applied before the schema is rendered

```js
// Example schema transformer
const addRequiredFieldsTransformer = (schema, formController) => {
  const result = { ...schema };
  
  // Make all fields required based on a condition
  if (formController?.values().strict) {
    Object.entries(result).forEach(([key, item]) => {
      if (item.type === 'field') {
        result[key] = {
          ...item,
          required: true,
        };
      }
    });
  }
  
  return result;
};
```

## Common Use Cases for Schema Transformers

- Adding conditional fields based on user selections
- Showing or hiding sections based on user roles
- Modifying field properties based on form data
- Transforming schema structures from external APIs

## Example: Adding a Dynamic Field

Here's an example of a transformer that adds a shipping address field when a user selects a different shipping address:

```js
const shippingAddressTransformer = (schema, formController) => {
  const result = { ...schema };
  
  if (formController?.values().differentShipping) {
    result.shippingAddress = {
      type: 'field',
      label: 'Shipping Address',
      component: 'textarea',
      required: true,
    };
  }
  
  return result;
};
```

## Learn More

For a comprehensive guide to all transformer types, including Context Transformers and Form Config Transformers, see the [Using Transformers](/extensibility/using-transformers) guide in the Extensibility section.