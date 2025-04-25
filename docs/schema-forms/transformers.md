# Form Props Transformers

When working with schema-based forms, one of the most powerful features is the ability to transform form properties at runtime. Form props transformers allow you to dynamically modify your form's schema, context, and configuration based on form state or other runtime conditions.

## What Are Form Props Transformers?

Form props transformers are functions that:
- Receive the current form props (containing schema, context, and config) and form controller as arguments
- Return a modified version of the form props
- Are applied immediately after the form controller is initialized

```js
// Example form props transformer
const addRequiredFieldsTransformer = (props, formController) => {
  // Create a copy to avoid mutating the original
  const result = { ...props };
  
  // If schema exists, make fields required based on a condition
  if (result.schema && formController?.values().strict) {
    Object.entries(result.schema).forEach(([key, item]) => {
      if (item.type === 'field') {
        result.schema[key] = {
          ...item,
          required: true,
        };
      }
    });
  }
  
  return result;
};
```

## Common Use Cases for Form Props Transformers

- Adding conditional fields based on user selections
- Showing or hiding sections based on user roles
- Modifying field properties based on form data
- Transforming schema structures from external APIs
- Adding utility functions to the form context
- Adjusting form configuration based on environment or user preferences

## Example: Adding a Dynamic Field and Context

Here's an example of a transformer that both adds a shipping address field and enhances the context with utility functions:

```js
const formPropsTransformer = (props, formController) => {
  // Create a copy to avoid mutating the original
  const result = { ...props };
  
  // Modify schema
  if (result.schema && formController?.values().differentShipping) {
    result.schema.shippingAddress = {
      type: 'field',
      label: 'Shipping Address',
      component: 'textarea',
      required: true,
    };
  }
  
  // Enhance context with utilities
  result.context = {
    ...result.context,
    utils: {
      formatAddress: (address) => address.replace(/\n/g, ', '),
      // Add other utility functions
    }
  };
  
  return result;
};
```

## Learn More

For a comprehensive guide to all transformer types, including Field Props Transformers, see the [Using Transformers](/extensibility/using-transformers) guide in the Extensibility section.