# Dynamic Props

Enforma provides a powerful dynamic props system that allows form components to adapt their behavior and appearance based on form state, context, and configuration. 

Dynamic props enable your form components to:
- Adapt behavior based on form state
- Conditionally render components using the special `if` prop

> [!WARNING] This feature should be used only when working with schema-based forms.
> In all other rendering modes you are in control on what is being shown or not

Dynamic props are available for all Enforma components:

- `EnformaField`
- `EnformaSection`
- `EnformaRepeatable`
- `EnformaRepeatableTable`

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