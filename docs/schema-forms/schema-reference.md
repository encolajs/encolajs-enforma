# Schema

This page provides a comprehensive reference for all schema types used in EnformaJS.

## Basic Schema Example

```js
const schema = {
  // FIELDS
  name: {
    type: 'field',
    label: 'Name',
    // ... more details go here
    section: 'personal_info'
  },
  email: {
    type: 'field',
    label: 'Email',
    // ... more details go here
    section: 'personal_info'
  },
  friends: {
    type: 'repeatable_table',
    subfields: {
      // details
    }
  },
  personal_info: {
    type: 'section',
    title: 'Personal details'
  }
}
```

## Common Schema Properties

All schema types share these base properties:

| Property | Type | Required | Description                                                                                                                     |
|----------|------|----------|---------------------------------------------------------------------------------------------------------------------------------|
| `type` | string | Yes | Type of schema: 'field', 'section', 'repeatable', or 'repeatable-table'.                                                        |
| `component` | string | No | The component used for rendering this part of the form. If not provided, the components provided via configuration will be used |
| `section` | string | No | The section this schema belongs to. Left out, null or empty, it sits at the root of the form, with the other root fields and sections |
| `position` | number | No | Position for rendering in the form/parent section. Fields and sub-sections are ordered together, see [Section Schema](#section-schema) |
| `if` | string | No | Conditional expression to determine if this part of the should be shown                                                         |
| `span` | number or object | No | How many of its section's `columns` it takes (`2`), or how many per breakpoint (`{ lg: 2 }`). Data only: the kit's components lay it out |

> [!IMPORTANT] 
> Use the `component` for customizing the rendering of the form. For example if you have a special repeatable table make your own component like `<OrderItemsTable/>`. See more on [Integrating Custom Components](/extensibility/custom-components.md) 

## Field Schema

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `label` | string | No | Label text for the field |
| `hideLabel` | boolean | No | Should hide the label from the field |
| `showLabelNextToInput` | boolean | No | For checkbox-like inputs |
| `help` | string | No | Help text to display alongside the field |
| `required` | boolean \| string | No | Whether the field is required (UI purposes only) |
| `useModelValue` | boolean | No | Whether to use update:modelValue event instead of input/change events (default: false) |
| `props` | object | No | Props to apply to the entire field component (wrapper) |
| `labelProps` | object | No | Props to apply to the label component |
| `inputProps` | object | No | Props to apply to the input component |
| `helpProps` | object | No | Props to apply to the help text component |
| `errorProps` | object | No | Props to apply to the error message component |
| `inputComponent` | string \| component | No | Component to use for this field |
| `rules` | string | No | Validation rules for this field in string format (e.g., "required\|email\|min_length:6") |
| `messages` | object | No | Custom validation messages for this field (e.g., `{ required: "Email is required", email: "Invalid email format" }`) |

<!--@include: ../_partials/use-model-value.md-->

## Repeatable Schema

| Property | Type | Required | Description                                                                                        |
|----------|------|----------|----------------------------------------------------------------------------------------------------|
| `subfields` | object | Yes | The definition of fields within each repeatable item |
| `min` | number | No | The minimum number of items allowed                                                                |
| `max` | number | No | The maximum number of items allowed                                                                |
| `props` | object | No | Props to apply to the repeatable container                                                         |
| `defaultValue` | any | No | Default value when adding a new item in the array                                                  |
| `allowAdd` | boolean | No | Whether to show the add button (defaults to true)                                             |
| `allowRemove` | boolean | No | Whether to show the remove button (defaults to true)                                       |
| `allowSort` | boolean | No | Whether to show the move up/down buttons (defaults to true)                                  |
| `validateOnAdd` | boolean | No | Whether to validate the field when a new item is added (defaults to true)                |
| `validateOnRemove` | boolean | No | Whether to validate the field when an item is removed (defaults to true)              |

## Repeatable Table Schema

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `subfields` | object | Yes | The definition of fields within each repeatable item |
| `min` | number | No | The minimum number of items allowed |
| `max` | number | No | The maximum number of items allowed |
| `props` | object | No | Props to apply to the repeatable container |
| `defaultValue` | any | No | Default value when adding a new item in the array |
| `allowAdd` | boolean | No | Whether to show the add button (defaults to true) |
| `allowRemove` | boolean | No | Whether to show the remove button (defaults to true) |
| `allowSort` | boolean | No | Whether to show the move up/down buttons (defaults to true) |
| `validateOnAdd` | boolean | No | Whether to validate the field when a new item is added (defaults to true) |
| `validateOnRemove` | boolean | No | Whether to validate the field when an item is removed (defaults to false) |

## Section Schema

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `title` | string | No | Title of the section. A section that only groups fields (tabs, a field group) needs none |
| `titleComponent` | string | No | Tag/component used for title |
| `titleProps` | object | No | Props to be passed to the title |
| `description` | string | No | A line under the title, saying what the section is for |
| `descriptionComponent` | string | No | Tag/component used for the description (`p` by default) |
| `descriptionProps` | object | No | Props to be passed to the description |
| `component` | string or component | No | The component drawing the section, see [Section components](#section-components) |
| `props` | object | No | Props for the section's component, spread over those it gets from the schema (a card's `variant`). `EnformaSection` puts them on its element (`{ class: 'grid' }`) |
| `columns` | number or object | No | How many columns the section's items take (`2`), or how many per breakpoint (`{ md: 2, lg: 3 }`). Data only, with its items' `span`: the kit's section component lays them out |

Sections can contain both fields and sections.

By default, the fields of a section are rendered before its sub-sections. To render a sub-section above some fields, give a `position` to the sub-section and to the fields:

- a sub-section is rendered above the fields with a higher `position`
- on equal positions the field is rendered first
- fields without a `position` are rendered after the fields that have one

To freely alternate fields and sub-sections, give a `position` to all of them:

```js
const schema = {
  name: { type: 'field', label: 'Name', position: 1 },
  address: { type: 'section', title: 'Address', position: 2 },
  city: { type: 'field', label: 'City', section: 'address' },
  notes: { type: 'field', label: 'Notes', position: 3 },
}
```

The form's root is a section too. A field or a section whose `section` is left out, `null` or empty sits at the root, and the root's fields and sections follow the same order: `name`, then the `address` section, then `notes` above.

### Section components

Every section is drawn with the form's section component (`components.section` in the config, `EnformaSection` by default). A section can name another one with `component`, so a form mixes sections drawn as cards, as tabs or as plain groups:

```js
const schema = {
  shipping: { type: 'section', title: 'Shipping', component: 'card' },
  billing: { type: 'section', title: 'Billing' },
}

// The form's config
const config = { components: { card: CardSection } }
```

A section's component gets the same props at the root of the form as inside another section.

A name is looked up in the form's config first (`components.card`), then among the components registered in the Vue app (`app.component('CardSection', …)`, named `'card-section'` or `'CardSection'`). `component` may also be the component itself. When nothing has the name, Enforma warns once and draws the section with the section component. The section's component gets the section's schema as props, but `component`.

## Validation Rules in Schema

As an alternative to providing validation rules through the `rules` prop, Enforma allows you to embed validation rules directly within your schema definition. This approach keeps validation logic close to field definitions and simplifies form configuration.

>[!WARNING]
> The `rules` and `messages` attributes work only when using Encola Validator.
> If you are using Zod, Yup or Valibot you have to pass the validator object to the form that you have to construct separately.
> You might want to create your own `createXYZValidatorFromSchema()` function if the form schema is passed from the server as a JSON

### Defining Rules in Schema

Each field in your schema can include a `rules` property with validation rules in string format:

```js
const schema = {
  email: {
    type: 'field',
    label: 'Email Address',
    rules: 'required|email',
  },
  password: {
    type: 'field',
    label: 'Password',
    rules: 'required|min_length:8|password',
  },
  age: {
    type: 'field',
    label: 'Age',
    rules: 'required|integer|gte:18|lte:120',
  }
}

// No need to define rules separately
const formProps = {
  data: {
    email: '',
    password: '',
    age: null
  },
  schema,
  // rules prop is not needed when using schema-based validation
  customMessages: {
    'age.gte': 'Must be at least 18 years old'
  }
}
```

### Rules in Repeatable Fields

For repeatable and repeatable-table fields, validation rules can be added to the subfield definitions:

```js
const schema = {
  experiences: {
    type: 'repeatable',
    subfields: {
      title: {
        type: 'field',
        label: 'Job Title',
        rules: 'required|min_length:3'
      },
      years: {
        type: 'field',
        label: 'Years of Experience',
        rules: 'required|numeric|gte:0'
      }
    }
  },
  skills: {
    type: 'repeatable_table',
    subfields: {
      name: {
        type: 'field',
        label: 'Skill',
        rules: 'required'
      },
      level: {
        type: 'field',
        label: 'Proficiency Level',
        rules: 'required|in_list:beginner,intermediate,advanced,expert'
      }
    }
  }
}
```

### Caveats

> [!WARNING] Multi-input fields require special attention
> Fields will multiple inputs require defining special validation rules. <br>
> In the [schema form example](/examples/schema-only.md) we have only the field `salary` for inputs `salary.min` and `salary.max`. <br>
> The example shows the rules are specified for the individual components. If you were to try to use the `rules` attribute of the schema you would need to create a custom validation rule, probably something like `rules: "required|numeric_rage"`

## Custom Messages in Schema

In addition to validation rules, you can define custom error messages directly in your schema. This keeps error messages close to field definitions and makes forms more maintainable.

### Defining Messages in Field Schema

Each field can include a `messages` object that maps rule names to custom error messages:

```js
const schema = {
  email: {
    type: 'field',
    label: 'Email',
    rules: 'required|email',
    messages: {
      required: 'Email address is required',
      email: 'Please enter a valid email format'
    }
  },
  age: {
    type: 'field',
    label: 'Age',
    rules: 'required|integer|gte:18',
    messages: {
      required: 'Age is required',
      integer: 'Age must be a whole number',
      gte: 'You must be at least 18 years old'
    }
  }
}
```

### Messages in Repeatable Fields

For repeatable and repeatable-table fields, messages can be defined in the subfield definitions:

```js
const schema = {
  languages: {
    type: 'repeatable',
    subfields: {
      name: {
        type: 'field',
        label: 'Language',
        rules: 'required',
        messages: {
          required: 'Language name is required'
        }
      },
      proficiency: {
        type: 'field',
        label: 'Level',
        rules: 'required|in_list:beginner,intermediate,advanced',
        messages: {
          required: 'Please select a proficiency level',
          in_list: 'Invalid proficiency level'
        }
      }
    }
  }
}
```
 