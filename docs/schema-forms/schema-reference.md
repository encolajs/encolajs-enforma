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
| `section` | string | No | The section this schema belongs to                                                                                              |
| `position` | number | No | Position for rendering in the form/parent section                                                                               |
| `if` | string | No | Conditional expression to determine if this part of the should be shown                                                         |

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
| `props` | object | No | Props to apply to the entire field component (wrapper) |
| `labelProps` | object | No | Props to apply to the label component |
| `inputProps` | object | No | Props to apply to the input component |
| `helpProps` | object | No | Props to apply to the help text component |
| `errorProps` | object | No | Props to apply to the error message component |
| `inputComponent` | string \| component | No | Component to use for this field |

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
| `title` | string | Yes | Title of the section |
| `titleComponent` | string | No | Tag/component used for title |
| `titleProps` | object | No | Props to be passed to the title |

Sections can contain both fields and sections.

> [!WARNING]
> The fields are rendered before the sub-sections. 
> If you want to render fields last, you must assign them to a sub-section in the last position. 
> If you want to alternate fields with sub-sections you have to use only sub-sections