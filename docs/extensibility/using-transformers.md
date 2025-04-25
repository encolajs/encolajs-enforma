# Using Transformers

Transformers are powerful functions that allow you to modify form elements at runtime. They follow a pipeline pattern where each transformer function receives an object, modifies it, and returns the modified version. Enforma includes multiple transformer types that target different aspects of your forms.

Enforma supports four types of transformers:

1. **Schema Transformers** - Modify the form schema before rendering
2. **Context Transformers** - Adjust the form context values and functions
3. **Form Config Transformers** - Customize form configuration at runtime
4. **Field Props Transformers** - Modify field properties during rendering

## Transformer Function Pattern

All transformers follow a similar pattern:

```js
// Basic transformer pattern
const myTransformer = (inputObject, formController) => {
  // Create a copy to avoid mutating the original
  const result = { ...inputObject };
  
  // Apply your transformations
  // ...
  
  // Return the modified object
  return result;
};
```

Each transformer:
- Receives at least one argument (the object to transform)
- Usually receives the form controller as the second argument
- Returns a modified version of the object
- Should not mutate the original object

## Schema Transformers

Schema transformers modify your form schema before rendering, allowing you to dynamically adjust the form structure.

```js
// A schema transformer that adds fields based on user role
const userRoleSchemaTransformer = (schema, formController) => {
  const result = { ...schema };
  const userRole = formController?.context?.userRole || 'user';
  
  if (userRole === 'admin') {
    // Add admin-only fields
    result.adminSettings = {
      type: 'field',
      label: 'Admin Settings',
      component: 'textarea',
    };
  }
  
  return result;
};
```

### Use Cases for Schema Transformers
- Adding or removing fields based on permissions
- Converting API-derived schemas to Enforma format
- Adjusting field structure based on form state
- Implementing complex conditional logic

## Context Transformers

Context transformers modify the form context object, which is available to all form components through injection.

```js
// A context transformer that adds date utilities
const dateContextTransformer = (context) => {
  const now = new Date();
  
  return {
    ...context,
    // Add date values and utilities
    dates: {
      currentDate: now.toISOString().split('T')[0],
      currentYear: now.getFullYear(),
      formatDate: (date) => new Date(date).toLocaleDateString(),
    }
  };
};
```

### Use Cases for Context Transformers
- Adding computed or derived values to context
- Injecting utility functions for expressions
- Enhancing context with user information
- Creating reactive values available to all fields

## Form Config Transformers

Form config transformers allow you to modify the form configuration at runtime.

```js
// A form config transformer that changes validation behavior
const mobileValidationTransformer = (config, formController) => {
  const isMobile = window.innerWidth < 768;
  
  return {
    ...config,
    behavior: {
      ...config.behavior,
      // On mobile, validate on blur instead of input to improve performance
      validateOn: isMobile ? 'blur' : config.behavior.validateOn,
    }
  };
};
```

### Use Cases for Form Config Transformers
- Adapting form behavior to different environments
- Changing validation timing based on form complexity
- Adjusting component configurations for different devices
- Implementing A/B testing for form behavior

## Field Props Transformers

Field props transformers modify field properties during rendering.

```js
// A field props transformer that adds CSS classes based on validation
const validationClassTransformer = (props, field) => {
  // Add special classes based on validation state
  if (field.error) {
    props.input.class = `${props.input.class || ''} invalid-input`;
  } else if (field.isTouched) {
    props.input.class = `${props.input.class || ''} touched-input`;
  }
  
  return props;
};
```

### Use Cases for Field Props Transformers
- Adding UI framework specific props
- Enhancing accessibility attributes
- Customizing appearance based on field state
- Implementing custom formatting or display logic

## Registering Transformers

Transformers are registered in the Enforma configuration:

```js
import { createEnforma } from 'encolajs-enforma';

const app = createApp(App);

// Create Enforma instance with transformers
const enforma = createEnforma({
  transformers: {
    schema: [userRoleSchemaTransformer, apiSchemaTransformer],
    context: [dateContextTransformer, userInfoTransformer],
    form_config: [mobileValidationTransformer],
    field_props: [validationClassTransformer, ui5Transformer],
  }
});

app.use(enforma);
```

Or locally at the form level:

```vue
<template>
  <Enforma 
    :data="formData" 
    :schema="schema"
    :config="formConfig"
    :submit-handler="handleSubmit"
  />
</template>

<script setup>
import { ref } from 'vue';

const formConfig = {
  transformers: {
    schema: [addDynamicFieldsTransformer],
    context: [addHelperFunctionsTransformer],
  }
};
</script>
```

## Transformer Order and Composition

Multiple transformers of the same type are applied in sequence, with each transformer receiving the output of the previous one:

```
input → transformer1 → transformer2 → transformer3 → output
```

This allows you to:
- Compose complex transformations from simple ones
- Create reusable transformer functions for common patterns
- Apply transformers conditionally for different scenarios

## Best Practices

1. **Keep transformers pure and focused**: Each transformer should do one thing well.

2. **Create copies, don't mutate**: Always create a copy of the input object before modifying it.

3. **Handle errors gracefully**: Use try/catch blocks to prevent transformer errors from breaking your form.

4. **Add comments and meaningful names**: Transformers can become complex, so document their purpose.

5. **Consider performance**: Transformers run during the render cycle, so keep them efficient.

## Advanced Patterns

### Conditional Transformers

Create transformers that only apply changes under certain conditions:

```js
const conditionalTransformer = (schema, formController) => {
  // Only transform if a condition is met
  if (!formController || !formController.getFieldValue('enableFeature')) {
    return schema; // Return unchanged
  }
  
  // Apply transformations...
  return modifiedSchema;
};
```

### Creating Transformer Factories

Create functions that generate transformers with custom configurations:

```js
// Factory function that creates a transformer
const createFieldAdderTransformer = (fieldKey, fieldConfig) => {
  // Return a transformer function
  return (schema, formController) => {
    return {
      ...schema,
      [fieldKey]: fieldConfig,
    };
  };
};

// Usage
const addEmailField = createFieldAdderTransformer('email', {
  type: 'field',
  label: 'Email',
  component: 'input',
  inputProps: { type: 'email' },
});
```

### Chaining Transformers Programmatically

Create a utility function to chain transformers:

```js
const chainTransformers = (...transformers) => {
  return (input, ...args) => {
    return transformers.reduce((result, transformer) => {
      return transformer(result, ...args);
    }, input);
  };
};

// Usage
const combinedTransformer = chainTransformers(
  addRequiredTransformer,
  addValidationTransformer,
  translateLabelsTransformer
);
```

## Examples

### User Role-Based Fields

```js
const roleBasedFieldsTransformer = (schema, formController) => {
  const result = { ...schema };
  const userRole = formController?.context?.userRole || 'user';
  
  const roleFieldMap = {
    admin: ['adminSettings', 'userManagement', 'systemConfig'],
    manager: ['teamSettings', 'reportAccess'],
    user: []
  };
  
  // Add fields based on user role
  (roleFieldMap[userRole] || []).forEach(fieldKey => {
    if (!result[fieldKey] && fieldDefinitions[fieldKey]) {
      result[fieldKey] = fieldDefinitions[fieldKey];
    }
  });
  
  return result;
};
```

### Form Validation Mode Based on Complexity

```js
const formComplexityTransformer = (config, formController) => {
  // Count the number of fields in the form
  const fieldCount = Object.keys(formController?.values() || {}).length;
  
  return {
    ...config,
    behavior: {
      ...config.behavior,
      // For complex forms with many fields, validate on submit to improve performance
      validateOn: fieldCount > 10 ? 'submit' : 'blur',
    }
  };
};
```

### Adding Context-Based Utility Functions

```js
const utilityFunctionsTransformer = (context) => {
  return {
    ...context,
    utils: {
      formatCurrency: (value) => `$${parseFloat(value).toFixed(2)}`,
      formatPhone: (phone) => {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6,10)}`;
      },
      calculateAge: (birthdate) => {
        const birth = new Date(birthdate);
        const now = new Date();
        let age = now.getFullYear() - birth.getFullYear();
        if (now.getMonth() < birth.getMonth() || 
            (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) {
          age--;
        }
        return age;
      }
    }
  };
};
```

## Performance Considerations

Transformers are applied efficiently using Vue's reactivity system:

1. **Computed Transformations**: Transformers are applied inside computed properties, so they only re-execute when their dependencies change.

2. **Copy-on-Write**: Transformers create copies of the objects they modify rather than mutating the originals.

3. **Sequential Execution**: Multiple transformers are applied in sequence, allowing for optimizations in how they compose.

To ensure good performance:
- Keep transformer functions simple and focused
- Avoid expensive operations like deep cloning large objects
- Consider memoizing transformers that perform complex calculations
- Use conditional logic to skip unnecessary transformations