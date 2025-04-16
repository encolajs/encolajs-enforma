# Headless API

<!-- 
This page should provide:
1. Comprehensive API reference for all headless components
2. Parameters, return values, and methods for each composable
3. TypeScript interfaces and types
4. Component relationships and hierarchy
5. Usage patterns and examples
-->

## HeadlessForm

A form component that provides no UI, just the form state and logic.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `Object` | Yes | The form data object |
| `rules` | `Object` | No | Validation rules object |
| `customMessages` | `Object` | No | Custom validation messages |
| `submitHandler` | `Function` | No | Form submission handler |
| `validateOn` | `String` | No | When to validate fields |

### Events

| Event | Parameters | Description |
|-------|------------|-------------|
| `submit-success` | `(data, formController)` | Emitted when form submits successfully |
| `submit-error` | `(error, formController)` | Emitted when submission fails |
| `validation-error` | `(formController)` | Emitted when validation fails |
| `reset` | `(formController)` | Emitted when form is reset |
| `field-changed` | `(path, value, fieldState, formController)` | Emitted when any field value changes |
| `field-focused` | `(path, fieldState, formController)` | Emitted when a field receives focus |
| `field-blurred` | `(path, fieldState, formController)` | Emitted when a field loses focus |
| `form-initialized` | `(formController)` | Emitted when form is initialized |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | Form state object | Slot for form content and fields |

### Exposed Methods

All form controller methods are exposed directly.

## HeadlessField

Headless component for form fields with no UI.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `name` | `String` | No | Field name/path (required if names not provided) |
| `names` | `Object` | No | Multiple field names mapping (required if name not provided) |
| `validateOnMount` | `Boolean` | No | Whether to validate on mount |
| `validateOn` | `String` | No | When to validate this field |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ field }` or multiple fields | Slot for field content |


