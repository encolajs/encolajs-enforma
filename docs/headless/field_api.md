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

| Slot | Props                       | Description             |
|------|-----------------------------|-------------------------|
| `default` | `{ field }` or `{ fields }` | Slot for input field(s) |
