# `<Enforma/>` API

<TabNav :items="[
{ label: 'Usage', link: '/base-components/enforma-form' },
{ label: 'API', link: '/base-components/enforma-form_api' },
{ label: 'FormController API', link: '/base-components/enforma-form-controller_api' },
]" />

## Props

| Prop            | Type       | Description                                     |
|-----------------|------------|-------------------------------------------------|
| `data`          | `Object`   | The form data object                            |
| `schema`        | `Object`   | Optional form schema for schema-based rendering |
| `rules`         | `Object`   | Validation rules for form fields                |
| `messages`      | `Object`   | Custom validation messages                      |
| `submitHandler` | `Function` | Function to be called on submit                  |
| `config`        | `Object`   | Form configuration options                      |

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
