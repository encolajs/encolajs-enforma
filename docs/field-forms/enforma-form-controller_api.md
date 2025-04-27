# `FormController` API

<TabNav :items="[
{ label: 'Usage', link: '/field-forms/enforma-form' },
{ label: 'API', link: '/field-forms/enforma-form_api' },
{ label: 'FormController API', link: '/field-forms/enforma-form-controller_api' },
]" />

The FormController is the object returned by the `useForm` composable, which is used by the [HeadlessForm component](/headless-forms/form.md) and provides the following properties and methods:

> :notebook_with_decorative_cover: Example manipulating the form from outside [here](/examples/fields.md), at the bottom of the form

## State Properties

| Property | Type | Description |
|----------|------|-------------|
| `$isValidating` | `boolean` | Whether the form is currently validating |
| `$isSubmitting` | `boolean` | Whether the form is currently submitting |
| `$isDirty` | `boolean` | Whether any field has been modified |
| `$isTouched` | `boolean` | Whether any field has been touched/focused |

## Form Values Management

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `values()` | - | `object` | Gets the current form values |
| `setFieldValue(path, value, validate, stateChanges)` | `path: string, value: any, validate?: boolean, stateChanges?: object` | `Promise<void>` | Sets a field value |
| `getFieldValue(path)` | `path: string` | `any` | Retrieves the value of a field |
| `reset()` | - | `void` | Resets form to initial state |

## Validation Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `validate()` | - | `Promise<boolean>` | Validates all fields |
| `validateField(path)` | `path: string` | `Promise<boolean>` | Validates a specific field |
| `errors()` | - | `object` | Gets all form errors by field path |
| `setFieldErrors(path, errors)` | `path: string, errors: string[]` | `void` | Sets errors for a specific field |
| `getFieldErrors(path)` | `path: string` | `string[]` | Gets errors for a specific field |
| `setErrors(errors)` | `errors: Record<string, string[]>` | `void` | Sets errors for multiple fields |

## Field Management

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getField(path)` | `path: string` | `FieldController` | Gets a field's state |
| `removeField(path)` | `path: string` | `void` | Removes a field from the form |
| `hasField(path)` | `path: string` | `boolean` | Checks if a field exists |
| `setFieldFocused(path)` | `path: string` | `void` | Marks a field as focused |
| `setFieldBlurred(path)` | `path: string` | `void` | Marks a field as blurred |

## Array Operations

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `add(path, index, item)` | `path: string, index: number, item: any` | `void` | Adds an item to an array |
| `remove(path, index)` | `path: string, index: number` | `void` | Removes an item from an array |
| `move(path, fromIndex, toIndex)` | `path: string, fromIndex: number, toIndex: number` | `void` | Moves an item in an array |
| `sort(path, callback)` | `path: string, callback: (a, b) => number` | `void` | Sorts array items |

> [!WARNING] You must ensure that the path holds an array or array-like object

## Event Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `on(event, handler)` | `event: string, handler: Function` | `{ off: Function }` | Subscribes to an event |
| `off(event, handler)` | `event: string, handler?: Function` | `void` | Unsubscribes from an event |
| `emit(event, data)` | `event: string, data: any` | `void` | Emits a custom event |

## Field State

The field state is returned by calling `form.getField(path)`

Each field in the form has the following state properties:

| Path | Type | Description |
|------|------|-------------|
| `$errors` | `string[]` | Validation error messages |
| `$isDirty` | `boolean` | Field has been modified |
| `$isTouched` | `boolean` | Field has been focused/interacted with |
| `$isValidating` | `boolean` | Field is currently validating |
| `$isValid` | `boolean` | Computed property: field has no errors |