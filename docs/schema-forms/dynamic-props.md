# Dynamic Props

Enforma provides a powerful dynamic props system that allows form components defined in a schema to adapt their behavior and appearance based on form state, context, and configuration.

> [!IMPORTANT] 
> Dynamic props using expressions are **only available in schema-based forms**. When directly using components like EnformaField, EnformaSection, etc., you must provide props as you normally do in a VueJS app.

Dynamic props enable your schema-defined form components to:
- Adapt behavior based on form state
- Conditionally render components using the special `if` prop

Dynamic props are evaluated at runtime when components are defined in a schema:

## Evaluation Environment

Dynamic props are evaluated in an environment that provides access to:

- `form` - The **FormController** instance that gives you access to the form's methods and state
  - `form.values()` - Get all form values
  - `form.errors()` - Get all validation errors
  - `form.getField(name)` - Get a specific field controller
  - and [more...](/field-forms/enforma-form-controller_api.md)
- `context` - The **Context Object** passed to the form via the `context` prop. Can contain custom data and functions
- `config` - The **Form Configuration** used to configure the form's behavior

## Using Dynamic Props

Dynamic props are particularly useful when defining form schemas:

```vue

<template>
  <Enforma
    :schema="schema"
    :context="context"
    :rules="rules"
    :messages="messages"
  />
</template>

<script setup>
  const schema = {
    country: {
      type: 'field',
      name: 'country',
      label: 'Country',
      inputComponent: 'select',
      inputProps: {
        options: ['US', 'Canada', 'UK', 'Other']
      }
    },
    state: {
      name: 'state',
      label: 'State/Province',
      inputComponent: '${context.getStateInput(form.getFieldValue("country"))}',
      inputProps: {
        options: '${context.getStatesByCountry(form.getFieldValue("country"))}'
      }
    }
  }
  const context = {
    getStatesByCountry(country) {
      if (country === 'US') {
        return [...US states]
      }
      return null
    },
    getStateInput(country) {
      return country === 'US' ? 'select' : 'input'
    },
  }
</script>
```

## The special `if` Prop

The `if` prop is a special dynamic prop that is evaluated and used as a `v-if` directive:

```js
const schema = {
  employmentType: {
    type: 'field',
    label: 'Employment Type',
    inputComponent: 'select',
    inputProps: {
      options: ['Full-time', 'Part-time', 'Contract', 'Not employed']
    }
  },
  company: {
    type: 'field',
    name: 'company',
    label: 'Company',
    if: '${form.values().employmentType !== "Not employed"}'
  }
}
```

## Expression Syntax

In order for a prop's value to be considered as "dynamic" it has to have the following form:

```js
'${form.values().age > 18 && context.require_age_verification === true}'
```

This behaviour can be changed by using the [`expressions` config option](/core-concepts/configuration.md)

## Common Use Cases

Dynamic props are particularly useful for:

1. **Conditional Rendering** - Show/hide components based on form state
2. **Adaptive UI** - Change component appearance based on validation state
3. **Context-Aware Forms** - Adapt form behavior based on application context
4. **Dynamic Options** - Populate select options based on other selections