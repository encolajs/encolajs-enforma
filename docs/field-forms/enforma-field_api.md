# `<EnformaField/>` API

<TabNav :items="[
{ label: 'Usage', link: '/field-forms/enforma-field' },
{ label: 'API', link: '/field-forms/enforma-field_api' },
]" />

## Props

| Prop | Type | Description                                                                            |
|------|------|----------------------------------------------------------------------------------------|
| `name` | `String` | The field name (required)                                                              |
| `label` | `String` | Field label                                                                            |
| `inputComponent` | `String\|Object` | Component to use for rendering the input                                               |
| `hideLabel` | `Boolean` | Whether to hide the field label                                                        |
| `showLabelNextToInput` | `Boolean` | Whether to show the label next to the input instead of above it                        |
| `required` | `Boolean\|String` | Whether the field is required                                                          |
| `useModelValue` | `Boolean` | Whether to use update:modelValue event instead of input/change events (default: false) |
| `help` | `String` | Help text to display below the field                                                   |
| `labelProps` | `Object` | Additional props to pass to the label element                                          |
| `errorProps` | `Object` | Additional props to pass to the error message element                                  |
| `helpProps` | `Object` | Additional props to pass to the help text element                                      |
| `props` | `Object` | Additional props to pass to the wrapper element                                        |
| `inputProps` | `Object` | Additional props to pass to the input component                                        |
| `inputEvents` | `Object` | Event handlers for the input component (input, change, blur, focus, update:modelValue) |
| `section` | `String` | Name of the section this field belongs to (used in schema-based forms)                 |
| `position` | `Number` | Position of the field within its section (used in schema-based forms)                  |

<!--@include: ../_partials/use-model-value.md-->

## Slots

The EnformaField doesn't have slots because it is very simple. If you need to customize it for your app and the CSS options are not enough, you can
- extend the library with [your own `<AppField>` component](/extensibility/custom-components.md) or 
- create [your own UI preset](/ui-library-integration/creating-your-own-ui-preset.md) 

## Styling

The component uses the following props from the configuration:

- `pt.wrapper` - The outer wrapper div for the field
- `pt.wrapper__invalid` - Additional props applied to the wrapper when the field is invalid
- `pt.wrapper__required` - Additional props applied to the wrapper when the field is required
- `pt.label` - The label element
- `pt.required` - The required indicator component (see [EnformaRequiredIndicator](/field-forms/enforma-required-indicator_api))
- `pt.input` - The input element
- `pt.error` - The error message element
- `pt.help` - The help text element