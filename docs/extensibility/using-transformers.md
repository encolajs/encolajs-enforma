# Using Transformers

Transformers are powerful functions that allow you to modify form elements at runtime. They follow a pipeline pattern where each transformer function receives an object, modifies it, and returns the modified version. Enforma includes multiple transformer types that target different aspects of your forms.

Enforma supports several types of transformers:

1. **Form Props Transformers** - Modify all form properties (schema, context, config) before rendering
2. **Field Props Transformers** - Modify field properties immediately after field controller initialization
3. **Repeatable Props Transformers** - Modify repeatable field properties 
4. **Repeatable Table Props Transformers** - Modify repeatable table properties
5. **Section Props Transformers** - Modify section properties

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

## Form Props Transformers

Form props transformers modify all form properties (schema, context, and config) in a single pipeline before rendering, allowing you to dynamically adjust the entire form.

```js
// A form props transformer that modifies schema, context, and config
const formPropsTransformer = (props, formController) => {
  // Create a copy to avoid mutating the original
  const result = { ...props };
  const userRole = formController?.context?.userRole || 'user';
  
  // Modify schema based on user role
  if (result.schema && userRole === 'admin') {
    result.schema.adminSettings = {
      type: 'field',
      label: 'Admin Settings',
      component: 'textarea',
    };
  }
  
  // Add date utilities to context
  const now = new Date();
  result.context = {
    ...result.context,
    // Add date values and utilities
    dates: {
      currentDate: now.toISOString().split('T')[0],
      currentYear: now.getFullYear(),
      formatDate: (date) => new Date(date).toLocaleDateString(),
    }
  };
  
  // Modify form configuration for mobile
  const isMobile = window.innerWidth < 768;
  if (result.config && result.config.behavior) {
    result.config.behavior = {
      ...result.config.behavior,
      // On mobile, validate on blur instead of input to improve performance
      validateOn: isMobile ? 'blur' : result.config.behavior.validateOn,
    };
  }
  
  return result;
};
```

### Use Cases for Form Props Transformers
- Adding or removing fields based on permissions
- Converting API-derived schemas to Enforma format
- Adding computed or derived values to context
- Injecting utility functions for expressions
- Enhancing context with user information
- Creating reactive values available to all fields
- Adapting form behavior to different environments
- Changing validation timing based on form complexity
- Adjusting component configurations for different devices
- Implementing A/B testing for form behavior

## Component Props Transformers

All component props transformers follow a similar pattern - they receive the component props and form controller, modify the props, and return the transformed version.

### Field Props Transformers

Field props transformers modify field properties immediately after the field controller is initialized and before additional component-specific props are applied.

```js
// A field props transformer that adds CSS classes based on validation
// and sets custom IDs for the field inputs
const fieldPropsTransformer = (fieldOptions, field, formController) => {
  // Create a copy to avoid mutating the original
  const result = { ...fieldOptions };
  
  // Add custom input props
  result.inputProps = {
    ...result.inputProps,
    // Add custom ID (will be preserved and respected in the component)
    id: `custom-${field.value.name}-${formController.values().formId}`,
    // Add special classes based on validation state
    class: field.value.error 
      ? 'invalid-input' 
      : field.value.isTouched 
        ? 'touched-input' 
        : ''
  };
  
  // Add accessibility attributes to label props
  result.labelProps = {
    ...result.labelProps,
    'aria-required': result.required === true,
  };
  
  return result;
};
```

### Use Cases for Field Props Transformers
- Setting custom IDs for fields that will be respected by the component
- Adding UI framework specific props
- Enhancing accessibility attributes
- Customizing appearance based on field state
- Implementing custom formatting or display logic

### Repeatable Props Transformers

Repeatable props transformers modify repeatable field properties before rendering.

```js
// A repeatable props transformer that customizes the repeatable component
const repeatablePropsTransformer = (repeatableOptions, formController) => {
  // Create a copy to avoid mutating the original
  const result = { ...repeatableOptions };
  
  // Customize based on the field name or other properties
  if (result.name === 'experiences') {
    // Disable sorting for certain fields
    result.allowSort = false;
    
    // Set minimum items based on form state
    result.min = formController.values().requireExperience ? 1 : 0;
    
    // Customize component props
    result.componentProps = {
      ...result.componentProps,
      customClass: 'experience-repeatable'
    };
  }
  
  return result;
};
```

### Use Cases for Repeatable Props Transformers
- Dynamically controlling add/remove/sort capabilities
- Setting minimum or maximum items based on form state
- Customizing appearance and behavior of repeatable fields
- Adding custom buttons or actions to repeatable components

### Repeatable Table Props Transformers

Repeatable table props transformers modify repeatable table properties, extending the repeatable props transformers.

```js
// A repeatable table props transformer that customizes table display
const repeatableTablePropsTransformer = (tableOptions, formController) => {
  // Create a copy to avoid mutating the original
  const result = { ...tableOptions };
  
  // Modify cell props based on content
  if (result.name === 'budgetItems') {
    // Add special handling for the budget table
    result.subfields = {
      ...result.subfields,
      amount: {
        ...result.subfields.amount,
        inputProps: {
          ...result.subfields.amount.inputProps,
          class: 'currency-input',
          format: 'currency'
        }
      }
    };
  }
  
  return result;
};
```

### Use Cases for Repeatable Table Props Transformers
- Customizing table layout and styling
- Adding special cell formatting based on content type
- Creating responsive tables for different screen sizes
- Implementing column-specific behaviors

### Section Props Transformers

Section props transformers modify section properties before rendering.

```js
// A section props transformer that adds toggle functionality
const sectionPropsTransformer = (sectionOptions, formController) => {
  // Create a copy to avoid mutating the original
  const result = { ...sectionOptions };
  
  // Add collapsible behavior to sections
  result.titleProps = {
    ...result.titleProps,
    class: 'collapsible-section-title',
    onClick: 'toggleSection',
    'aria-expanded': 'true',
    'aria-controls': `section-${result.name}-content`
  };
  
  // Make certain sections collapsed by default based on form state
  if (formController.values().sectionPreferences?.[result.name] === 'collapsed') {
    result.collapsed = true;
  }
  
  return result;
};
```

### Use Cases for Section Props Transformers
- Creating collapsible/expandable sections
- Implementing section visibility logic based on user roles
- Customizing section styling based on content
- Adding accessibility features to sections
- Implementing conditional section rendering

## Registering Transformers

Transformers are registered in the Enforma configuration:

```js
import { createEnforma } from 'encolajs-enforma';

const app = createApp(App);

// Create Enforma instance with transformers
const enforma = createEnforma({
  transformers: {
    form_props: [userRolePropsTransformer, responsivePropsTransformer],
    field_props: [validationClassTransformer, ui5Transformer],
    repeatable_props: [repeatablePropsTransformer],
    repeatable_table_props: [responsiveTableTransformer],
    section_props: [conditionalSectionsTransformer],
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
    form_props: [dynamicFormPropsTransformer],
    repeatable_props: [dynamicRepeatableTransformer],
    section_props: [accordionSectionTransformer],
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

### Comprehensive Form Props Transformer

This example combines user role-based fields, form validation mode, and utility functions in a single transformer:

```js
const comprehensivePropsTransformer = (props, formController) => {
  const result = { ...props };
  const userRole = formController?.context?.userRole || 'user';
  
  // 1. Modify schema based on user role
  if (result.schema) {
    const roleFieldMap = {
      admin: ['adminSettings', 'userManagement', 'systemConfig'],
      manager: ['teamSettings', 'reportAccess'],
      user: []
    };
    
    // Add fields based on user role
    (roleFieldMap[userRole] || []).forEach(fieldKey => {
      if (!result.schema[fieldKey] && fieldDefinitions[fieldKey]) {
        result.schema[fieldKey] = fieldDefinitions[fieldKey];
      }
    });
  }
  
  // 2. Modify form config based on complexity
  if (result.config) {
    // Count the number of fields in the form
    const fieldCount = Object.keys(formController?.values() || {}).length;
    
    if (!result.config.behavior) {
      result.config.behavior = {};
    }
    
    // For complex forms with many fields, validate on submit to improve performance
    result.config.behavior.validateOn = fieldCount > 10 ? 'submit' : 'blur';
  }
  
  // 3. Add utility functions to context
  result.context = {
    ...result.context,
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
  
  return result;
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