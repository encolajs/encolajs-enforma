# Components API

<!-- 
This page should provide:
1. Comprehensive API reference for all UI components
2. Props, events, slots, and methods for each component
3. TypeScript interfaces and types
4. Component relationships and hierarchy
5. Usage patterns and examples
-->

This page provides a comprehensive reference of all components in EncolaJS Enforma, including their props, events, slots, and exposed methods.

## Enforma

The main form component that manages form state, validation, and submission.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `Object` | Yes | The form data object |
| `rules` | `Object` | No | Validation rules object |
| `messages` | `Object` | No | Custom validation messages |
| `schema` | `Object` | No | Form schema for schema-driven forms |
| `submitHandler` | `Function` | Yes | Function to handle form submission |
| `context` | `Object` | No | Context data provided to all fields |
| `config` | `Object` | No | Form configuration object |
| `showResetButton` | `Boolean` | No | Whether to show the reset button (default: `true`) |

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
| `default` | Form state object | Main content area for form fields |
| `actions` | `{ formCtrl, formConfig }` | Button area, contains submit and reset buttons |

### Exposed Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `formRef` | - | `Ref<FormController>` | Reference to the underlying form controller |
| `on` | `event: string, handler: Function` | `{ off: Function }` | Subscribe to a form event |
| `off` | `event: string, handler?: Function` | - | Unsubscribe from a form event |

## EnformaField

Component for rendering individual form fields.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `name` | `String` | Yes | Field name/path |
| `label` | `String` | No | Field label text |
| `type` | `String` | No | Field type (defaults to "input") |
| `placeholder` | `String` | No | Field placeholder text |
| `hideLabel` | `Boolean` | No | Whether to hide the label |
| `required` | `Boolean` | No | Whether the field is required |
| `help` | `String` | No | Help text to display |
| `if` | `Boolean` | No | Conditional display |
| `labelProps` | `Object` | No | Props for label element |
| `errorProps` | `Object` | No | Props for error element |
| `helpProps` | `Object` | No | Props for help text element |
| `wrapperProps` | `Object` | No | Props for wrapper element |
| `inputProps` | `Object` | No | Props for input element |
| `validateOn` | `String` | No | When to validate this field |
| `section` | `String` | No | Section this field belongs to |
| `position` | `Number` | No | Position order within section |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ ...fieldState, attrs: props.input }` | Custom field content |

## EnformaRepeatable

Component for repeatable/array fields.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `name` | `String` | Yes | Array field name/path |
| `type` | `String` | Yes | Must be "repeatable" |
| `label` | `String` | No | Field label text |
| `subfields` | `Object` | Yes | Definition of repeatable fields |
| `min` | `Number` | No | Minimum number of items |
| `max` | `Number` | No | Maximum number of items |
| `item` | `Object` | No | Template for new items |
| `addButtonText` | `String` | No | Text for add button |
| `removeButtonText` | `String` | No | Text for remove button |
| `addButton` | `Component` | No | Custom add button component |
| `removeButton` | `Component` | No | Custom remove button component |
| `moveUpButton` | `Component` | No | Custom move up button component |
| `moveDownButton` | `Component` | No | Custom move down button component |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ items, index, ... }` | Custom item rendering |
| `add-button` | `{ add, canAdd, ... }` | Custom add button |
| `item-actions` | `{ remove, canRemove, ... }` | Custom item actions |

## EnformaRepeatableTable

Table-based repeatable component for array data.

### Props

Same as EnformaRepeatable, plus:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `headers` | `Array` | No | Column headers |
| `hideHeaders` | `Boolean` | No | Whether to hide table headers |
| `tableProps` | `Object` | No | Props for table element |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `header` | `{ headers }` | Custom table header |
| `row` | `{ item, index, ... }` | Custom row rendering |
| `cell` | `{ item, field, ... }` | Custom cell rendering |
| `actions` | `{ item, index, ... }` | Custom row actions |

## EnformaSubmitButton

Submit button for the form.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | `String` | No | Button text (defaults to "Submit") |
| `loadingLabel` | `String` | No | Button text when submitting |
| `attrs` | `Object` | No | Additional button attributes |

## EnformaResetButton

Reset button for the form.
[FETCH_HEAD](../../.git/FETCH_HEAD)
[config](../../.git/config)
### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | `String` | No | Button text (defaults to "Reset") |
| `confirmReset` | `Boolean` | No | Whether to confirm before resetting |
| `confirmMessage` | `String` | No | Confirmation message |
| `attrs` | `Object` | No | Additional button attributes |

## Type Definitions

### FormController

```typescript
interface FormController {
  // State properties
  $stateVersion: { value: number };
  $isValidating: boolean;
  $isSubmitting: boolean;
  $isDirty: boolean;
  $isTouched: boolean;

  // Methods
  reset(): void;
  values(): object;
  errors(): Record<string, string[]>;
  submit(): Promise<boolean>;
  validate(): Promise<boolean>;
  validateField(path: string): Promise<boolean>;
  
  // Field management
  setFieldValue(
    path: string,
    value: any,
    validate?: boolean,
    stateChanges?: StateChanges
  ): Promise<void>;
  setFieldErrors(path: string, errors: string[]): void;
  setErrors(errors: Record<string, string[]>): void;
  setFieldFocused(path: string): void;
  setFieldBlurred(path: string): void;
  getField(path: string): FieldState;
  removeField(path: string): void;
  hasField(path: string): boolean;
  
  // Array operations
  add(arrayPath: string, index: number, item: any): void;
  remove(arrayPath: string, index: number): void;
  move(arrayPath: string, fromIndex: number, toIndex: number): void;
  sort(arrayPath: string, callback: (a: any, b: any) => number): void;
  
  // Event handling
  on(event: string, handler: Function): { off: Function };
  off(event: string, handler?: Function): void;
  emit(event: string, data: any): void;
  
  // Dynamic field access
  [key: string]: any;
}
```

### FieldState

```typescript
interface FieldState {
  $errors: string[];
  $isDirty: boolean;
  $isTouched: boolean;
  $isValidating: boolean;
  _id: string;
}
```

### StateChanges

```typescript
interface StateChanges {
  $isDirty?: boolean;
  $isTouched?: boolean;
  $isValidating?: boolean;
  $errors?: string[];
}
```

### FormEvents

```typescript
type FormEventType = 
  | 'submit_success'
  | 'submit_error'
  | 'validation_error'
  | 'field_changed'
  | 'field_focused'
  | 'field_blurred'
  | 'form_reset'
  | 'form_initialized';

type FormEvents = {
  submit_success: { formController: FormController };
  submit_error: { error: any; formController: FormController };
  validation_error: { formController: FormController };
  field_changed: {
    path: string;
    value: any;
    fieldState: FieldState;
    formController: FormController;
  };
  field_focused: {
    path: string;
    fieldState: FieldState;
    formController: FormController;
  };
  field_blurred: {
    path: string;
    fieldState: FieldState;
    formController: FormController;
  };
  form_reset: { formController: FormController };
  form_initialized: { formController: FormController };
};
```