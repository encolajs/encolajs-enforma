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
| `$isChanged` | `boolean` | Whether the values differ from the saved ones (those the form was given, or `commit()`'s). Unlike `$isDirty`, it turns false again when the user undoes a change: an "Unsaved changes" badge, a Save button disabled while there is nothing to save |
| `$isPending` | `boolean` | Whether work handed to the form (`track()`, `beginPending()`) is still running, such as an upload. The form won't submit meanwhile. Read-only |
| `$formId` | `string` | The form's id: the one given to `useForm()` (its `id` option) or to `<Enforma>`/`<HeadlessForm>` (their `id` prop), or one made up |
| `$formAttrs` | `object` | The `<form>`'s attributes: its `id` and its ARIA attributes (`aria-busy`, `aria-invalid`). Bind them to a `<form>` of your own: `<form v-bind="controller.$formAttrs">` |

## Form Values Management

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `values()` | - | `object` | Gets the current form values |
| `setFieldValue(path, value, validate, stateChanges)` | `path: string, value: any, validate?: boolean, stateChanges?: object` | `Promise<void>` | Sets a field value |
| `getFieldValue(path)` | `path: string` | `any` | Retrieves the value of a field |
| `reset()` | - | `void` | Resets form to initial state |
| `commit(values?)` | `values?: object` | `void` | The current values, or `values`, become the saved ones: those `reset()` returns to and `$isChanged` compares with. Call it after a successful save, so Discard brings back what was saved. The fields' states clear, as `reset()` clears them. `values` only become the saved copy: set them on the form too to show them |

The controller also gives a field's value as `controller[path]` (`controller.email`, `controller['address.city']`). For a field named like one of its methods (`track`, `commit`, `reset`, `values`, `submit`…) that gives the method: read values with `getFieldValue(path)`, which is right for every name.

## Validation Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `validate()` | - | `Promise<boolean>` | Validates all fields |
| `validateField(path)` | `path: string` | `Promise<boolean>` | Validates a specific field |
| `errors()` | - | `object` | Gets all form errors by field path |
| `setFieldErrors(path, errors)` | `path: string, errors: string[]` | `void` | Sets errors for a specific field |
| `getFieldErrors(path)` | `path: string` | `string[]` | Gets errors for a specific field |
| `setErrors(errors)` | `errors: Record<string, string[]>` | `void` | Sets errors for multiple fields |

## Pending Work

Work the form waits for before it submits, such as an upload. [See Pending Work](/core-concepts/pending-work.md)

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `track(work, path?)` | `work: Promise \| (signal: AbortSignal) => Promise, path?: string` | `Promise` | The form waits for the promise until it settles, and gives what it gives. Given a function, calls it with a signal that aborts when the form drops the work; a dropped work rejects with an `AbortError`. Without `path`, the work is the form's own |
| `beginPending(path?)` | `path?: string` | `{ done, signal }` | The form waits until `done()` is called (a second call does nothing). `signal` aborts when the form drops the work. Without `path`, the work is the form's own |

## Field Management

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getField(path)` | `path: string` | `FieldController` | Gets a field's state |
| `removeField(path)` | `path: string` | `void` | Removes a field from the form |
| `hasField(path)` | `path: string` | `boolean` | Checks if a field exists |
| `focusField(path)` | `path: string` | `boolean` | Goes to the field at `path`: opens the tabs and collapsibles holding it, scrolls it into view and focuses its input: the element with the field's id, else the one its label names, else the first element in the field that takes focus. Says whether something on the page answered |
| `focusFirstError()` | | `boolean` | Goes to the first field with errors, in the order they are on the page, as a refused submit does: after `setErrors()`, for instance. Says whether there was one |
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
| `$isPending` | `boolean` | Field has work running (`track()`, `beginPending()`), such as an upload. Read-only |
| `$isValid` | `boolean` | Computed property: field has no errors |