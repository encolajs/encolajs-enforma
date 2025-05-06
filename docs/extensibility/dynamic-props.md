# Using Dynamic Props

Dynamic props are one of Enforma's most powerful features, allowing form components to adapt and respond to the current state of the form. They enable you to create highly interactive and context-aware forms without writing complex custom components.

### What Are Dynamic Props?

Dynamic props are schema field properties whose values are determined at runtime based on:

1. **Current form values**: Adapt components based on user inputs 
2. **Context objects**: Use application data to influence field behavior
3. **Form configuration**: Respond to form-level settings

## How Dynamic Props Work

Dynamic props use a special string syntax that evaluates JavaScript expressions within schema fields:

```js
// Basic syntax using default delimiters
'${expression}'

// Example: A label that changes based on a form value
label: '${form.getFieldValue("accountType") === "business" ? "Company Name" : "Full Name"}'
```

When Enforma encounters a string with the expression delimiters (`${` and `}` by default), it evaluates the content between them in a context that provides access to the form state, application context, and configuration.

### Key Benefits

- **Conditional rendering**: Show/hide fields based on form state
- **Adaptive UI**: Change component appearance dynamically
- **Dynamic validation**: Adjust validation rules based on context
- **Reduced boilerplate**: Accomplish reactive behavior without custom components

## The Expression Environment

Dynamic expressions are evaluated with access to:

| Object | Description | Common Methods |
|--------|-------------|----------------|
| `form` | The form controller instance | `form.values()`, `form.getFieldValue(name)`, `form.errors()`, `form.getField(name)` |
| `context` | Custom data/functions provided via `:context` prop | Any properties or methods you provide |
| `config` | Form configuration | Access to all configuration settings |

## Common Use Cases

### 1. Conditional Field Visibility

Show or hide fields based on the values of other fields using the special `if` prop:

```js
// Show company field only when account type is "business"
companyName: {
  type: 'field',
  label: 'Company Name',
  if: '${form.getFieldValue("accountType") === "business"}'
}
```

### 2. Dynamic Field Properties

Adapt field properties based on form state or context:

```js
// Change label based on selected country
state: {
  type: 'field',
  label: '${form.getFieldValue("country") === "US" ? "State" : "Province"}',
  inputComponent: 'select',
  inputProps: {
    options: '${context.getStateOptions(form.getFieldValue("country"))}'
  }
}
```

### 3. Dynamic Component Selection

Change the input component type based on form values:

```js
// Change input component type based on field value
experience: {
  type: 'field',
  label: 'Experience Details',
  inputComponent: '${form.getFieldValue("position") === "Developer" ? "textarea" : "input"}',
  inputProps: {
    rows: '${form.getFieldValue("position") === "Developer" ? 5 : 3}'
  }
}
```

### 4. Dynamic Required Status

Make fields conditionally required:

```js
// Only require address when "shipping" is selected
shippingAddress: {
  type: 'field',
  label: 'Shipping Address',
  required: '${form.getFieldValue("needsShipping") === true}'
}
```

## Using Context For Complex Logic

When expressions get complex, move logic to the `context` object:

```vue
<template>
  <Enforma
    :schema="schema"
    :context="context"
    :data="formData"
  />
</template>

<script setup>
const context = {
  // Helper function for determining field properties
  getExperienceProps(position) {
    if (!position) return { class: 'w-full' }
    
    const baseProps = { class: 'w-full' }
    
    if (position === 'Developer') {
      return {
        ...baseProps,
        rows: 5,
        placeholder: 'Describe your technical experience, languages, frameworks...'
      }
    } else if (position === 'Manager') {
      return {
        ...baseProps,
        rows: 4,
        placeholder: 'Describe your management experience and leadership style'
      }
    } else {
      return baseProps
    }
  }
}

const schema = {
  // ...other fields
  experienceDetails: {
    type: 'field',
    label: 'Experience Details',
    inputComponent: 'textarea',
    inputProps: '${context.getExperienceProps(form.getFieldValue("position"))}'
  }
}
</script>
```

## Customizing Expression Syntax

You can customize the delimiters used for dynamic expressions by configuring the `expressions` option:

```vue
<template>
  <Enforma
    :schema="schema"
    :config="config"
  />
</template>

<script setup>
const config = {
  expressions: {
    delimiters: {
      start: '[[',
      end: ']]'
    }
  }
}

const schema = {
  // Using custom delimiters
  email: {
    type: 'field',
    label: '[[form.getFieldValue("contactType") === "business" ? "Business Email" : "Personal Email"]]',
    required: true
  }
}
</script>
```

## Performance Considerations

Dynamic props are powerful but come with performance implications:

- **Memoization**: Enforma internally memoizes expressions to improve performance
- **Complexity**: Very complex expressions can impact form rendering performance
- **Context Size**: Large context objects can slow down evaluation

For optimal performance:
- Keep expressions simple and focused
- Use context functions for complex logic
- Avoid unnecessary re-evaluations

## Troubleshooting

If your dynamic props aren't working as expected:

1. **Verify syntax**: Ensure your expression uses the correct delimiters
2. **Check scope**: Make sure your expression only uses variables available in the evaluation context
3. **Browser console**: Check for expression evaluation errors in the developer console
4. **Test expressions**: Try simplifying expressions to isolate problems

## Complete Example

There's a complete example showcasing various dynamic props features in the ["Examples" section](/examples/dynamic-props.md)


## Related Resources

- [Schema Reference](/schema-forms/schema-reference.md)
- [Configuration Options](/core-concepts/configuration.md)
- [Form Controller API](/field-forms/enforma-form-controller_api.md)
