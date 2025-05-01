# `<Enforma/>` API

<TabNav :items="[
{ label: 'Usage', link: '/field-forms/enforma-form' },
{ label: 'API', link: '/field-forms/enforma-form_api' },
{ label: 'FormController API', link: '/field-forms/enforma-form-controller_api' },
]" />

## Props

| Prop               | Type        | Description                                                                                                        |
|--------------------|-------------|--------------------------------------------------------------------------------------------------------------------|
| `data`             | `Object`    | The form data object                                                                                               |
| `schema`           | `Object`    | Optional form schema for schema-based rendering                                                                    |
| `rules`            | `Object`    | Validation rules for form fields                                                                                   |
| `messages`         | `Object`    | Custom validation messages                                                                                         |
| `submitHandler`    | `Function`  | Function to be called on submit                                                                                    |
| `config`           | `Object`    | Form configuration options                                                                                         |
| `showResetButton`  | `Boolean` | To show the reset button (default `true`)                                                                          |
| `showSubmitButton` | `Boolean` | To show the submit button (default `true`). This is useful if you want to place the submit button outside the form |

## Events

| Event                | Payload                                            | Description                                             |
|----------------------|----------------------------------------------------|---------------------------------------------------------|
| `submit_error`       | `formData`                                         | Emitted when there's an error while submitting the form |
| `submit_success`     | `formData`                                         | Emitted when the form is successfully submited          |
| `validation_error`   | `{ formController }`                               | Emitted when there's an error during validation         |
| `validation_success` | `formData`                                         | Emitted when validation passes                          |
| `field_change`       | `{ path, value, fieldController, formController }` | Emitted when any field value changes                    |
| `field_blur`         | `{ name, fieldController, formController }`        | Emitted when a field is blurred                         |
| `field_focus`        | `{ name, fieldController, formController }`        | Emitted when a field is focused                         |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | None | The main slot for form content |
