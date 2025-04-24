# `FormController` API

<TabNav :items="[
{ label: 'Usage', link: '/base-components/enforma-form' },
{ label: 'API', link: '/base-components/enforma-form_api' },
{ label: 'FormController API', link: '/base-components/enforma-form-controller_api' },
]" />

The FormController is the object returned by the `useForm` composable, which is used by the [HeadlessForm component](/headless/form.md) and provides the following properties and methods:

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
| `add(arrayPath, index, item)` | `arrayPath: string, index: number, item: any` | `void` | Adds an item to an array |
| `remove(arrayPath, index)` | `arrayPath: string, index: number` | `void` | Removes an item from an array |
| `move(arrayPath, fromIndex, toIndex)` | `arrayPath: string, fromIndex: number, toIndex: number` | `void` | Moves an item in an array |
| `sort(arrayPath, callback)` | `arrayPath: string, callback: (a, b) => number` | `void` | Sorts array items |

## Event Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `on(event, handler)` | `event: string, handler: Function` | `{ off: Function }` | Subscribes to an event |
| `off(event, handler)` | `event: string, handler?: Function` | `void` | Unsubscribes from an event |
| `emit(event, data)` | `event: string, data: any` | `void` | Emits a custom event |

## Field State

Each field in the form has the following state properties:

| Path | Type | Description |
|------|------|-------------|
| `fieldPath` | `any` | Direct access to field value |
| `fieldPath.$errors` | `string[]` | Validation error messages |
| `fieldPath.$isDirty` | `boolean` | Field has been modified |
| `fieldPath.$isTouched` | `boolean` | Field has been focused/interacted with |
| `fieldPath.$isValidating` | `boolean` | Field is currently validating |
| `fieldPath.$isValid` | `boolean` | Computed property: field has no errors |

And they can be accessed via the form controller like so

```js
form['items.2.price.$errors']
form['items.1.price.$isValid']
```