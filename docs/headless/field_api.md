# `<HeadlessField>` API

<TabNav :items="[
{ label: 'Usage', link: '/headless/field' },
{ label: 'API', link: '/headless/field_api' },
]" />

A field component that provides no UI, just the field state and logic.

## Props

| Prop | Type | Required | Description                                                                                                                  |
|------|------|----------|------------------------------------------------------------------------------------------------------------------------------|
| `name` | `String` | No       | Field name/path (required if names not provided)                                                                             |
| `names` | `Object` | No       | Multiple field names mapping (required if name not provided). The object is in the form of `{fieldControllerName: fieldPath}` |
| `validateOn` | `String` | No       | When to validate this field ( `'input' \| 'change' \| 'blur'    \| 'submit'`)                                                |
| `validateOnMount` | `Boolean` | No       | Whether to validate when the componet mounts                                                                                 |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | `fieldCtrl` | The default slot for a single input field. |
| `default` | `{ [key: string]: fieldCtrl }` | The default slot for multiple input fields. |

## Field Controller

The field controller is an object that provides properties and methods for managing the field state and behavior.

### Properties

| Property | Type | Description                                                                                                                                   |
|----------|------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| `id` | `string` | The unique ID of the field.                                                                                                                   |
| `value` | `any` | The current value of the field. It is also included in the `attrs`                                                                            |
| `error` | `string` | The error message if the field is invalid. It is the first error message from the array of error messages                                     |
| `attrs` | `object` | HTML attributes for the field.                                                                                                                |
| `events` | `object` | Event handlers for the field.                                                                                                                 |
| `model` | `{ value: any }` | A reactive object that can be used with v-model for two-way binding. The model property will only trigger validation when the field is dirty. |

> [!WARNING]
> It is recommend to **NOT use** the `model` as you won't be able to control when the field gets validated