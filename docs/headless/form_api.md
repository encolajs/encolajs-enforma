# `<HeadlessForm />` API

<TabNav :items="[
{ label: 'Usage', link: '/headless/form' },
{ label: 'API', link: '/headless/form_api' },
]" />


A form component that provides no UI, just the form state and logic.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `Object` | Yes | The form data object |
| `rules` | `Object` | No | Validation rules object |
| `customMessages` | `Object` | No | Custom validation messages |
| `submitHandler` | `Function` | No | Form submission handler |
| `validateOn` | `String` | No | When to validate fields |

## Events

| Event | Parameters | Description |
|-------|------------|-------------|
| `submit_success` | `(data, formController)` | Emitted when form submits successfully |
| `submit_error` | `(error, formController)` | Emitted when submission fails |
| `validation_error` | `(formController)` | Emitted when validation fails |
| `reset` | `(formController)` | Emitted when form is reset |
| `field_changed` | `(path, value, fieldController, formController)` | Emitted when any field value changes |
| `field_focused` | `(path, fieldController, formController)` | Emitted when a field receives focus |
| `field_blurred` | `(path, fieldController, formController)` | Emitted when a field loses focus |
| `form-initialized` | `(formController)` | Emitted when form is initialized |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | Form state object | Slot for form content and fields |
