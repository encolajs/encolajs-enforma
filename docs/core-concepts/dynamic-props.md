# Dynamic Props

Enforma provides a powerful dynamic props system that allows form components defined in a schema to adapt their behavior and appearance based on form state, context, and configuration.

> [!IMPORTANT] 
> Dynamic props using expressions are **only available in schema-based forms**. When directly using components like EnformaField, EnformaSection, etc., you must provide plain values (not expressions) for all props.

Dynamic props enable your schema-defined form components to:
- Adapt behavior based on form state
- Conditionally render components using the special `if` prop

Dynamic props are evaluated at runtime when components are defined in a schema:

## Evaluation Environment

Dynamic props are evaluated in an environment that provides access to:

- `form` - is the **FormController** and gives you access to the entire form state
- `context` - is a **Context Object** passed to the form as the `context` prop. It can contain data an functions
- `config` - is the **Form Configuration**

## Using Dynamic Props

Dynamic props are particularly useful when defining form schemas:

```js
const formSchema = {
  fields: [
    {
      name: 'country',
      component: 'select',
      label: 'Country',
      inputProps: {
        options: ['US', 'Canada', 'UK', 'Other']
      }
    },
    {
      name: 'state',
      component: 'select',
      label: 'State/Province',
      inputProps: {
        options: '${context.getStatesByCountry(form.country)}'
      }
    }
  ]
};
```

## The special `if` Prop

The `if` prop is a special dynamic prop that is evaluated and used as a `v-if` directive:

```js
const formSchema = {
  fields: [
    {
      name: 'employmentType',
      component: 'select',
      label: 'Employment Type',
      inputProps: {
        options: ['Full-time', 'Part-time', 'Contract', 'Not employed']
      }
    },
    {
      name: 'company',
      component: 'text',
      label: 'Company',
      if: '${form.employmentType !== "Not employed"}'
    }
  ]
};
```

## Expression Syntax

In order for a prop's value to be considered as "dynamic" it has to have the following form:

```js
'${form.age > 18 && context.require_age_verification === true}'
```

This behaviour can be changed by using the [`expressions` config option](/core-concepts/configuration.md)

## Common Use Cases

Dynamic props are particularly useful for:

1. **Conditional Rendering** - Show/hide components based on form state
2. **Adaptive UI** - Change component appearance based on validation state
3. **Context-Aware Forms** - Adapt form behavior based on application context
4. **Dynamic Options** - Populate select options based on other selections