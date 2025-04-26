# `<EnformaField/>` API

<TabNav :items="[
{ label: 'Usage', link: '/field-forms/enforma-field' },
{ label: 'API', link: '/field-forms/enforma-field_api' },
]" />

## Props

| Prop | Type | Description |
|------|------|-------------|
| `name` | `String` | The field name (required) |
| `label` | `String` | Field label |
| `inputComponent` | `String\|Object` | Component to use for rendering the input |
| `hideLabel` | `Boolean` | Whether to hide the field label |
| `showLabelNextToInput` | `Boolean` | Whether to show the label next to the input instead of above it |
| `required` | `Boolean\|String` | Whether the field is required |
| `help` | `String` | Help text to display below the field |
| `labelProps` | `Object` | Additional props to pass to the label element |
| `errorProps` | `Object` | Additional props to pass to the error message element |
| `helpProps` | `Object` | Additional props to pass to the help text element |
| `props` | `Object` | Additional props to pass to the wrapper element |
| `inputProps` | `Object` | Additional props to pass to the input component |
| `section` | `String` | Name of the section this field belongs to (used in schema-based forms) |
| `position` | `Number` | Position of the field within its section (used in schema-based forms) |

## Slots

The EnformaField doesn't have slots because it is very simple. If you need to customize it for your app and the CSS options are not enough, you can
- extend the library with [your own `<AppField>` component](/extensibility/custom-components.md) or 
- create [your own UI preset](/ui-library-integration/creating-your-own-ui-preset.md) 

