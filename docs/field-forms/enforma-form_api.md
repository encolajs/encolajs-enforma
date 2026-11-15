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
| `validator`        | `FormValidator` | Validator instance (created with `createEncolaValidator`, `createZodValidator`, etc.)                          |
| `submitHandler`    | `Function`  | Function to be called on submit                                                                                    |
| `config`           | `Object`    | Form configuration options                                                                                         |
| `context`          | `Object`    | What expressions read as `context`: data and functions                                                             |
| `id`               | `String`    | The `<form>`'s id, read once, as the form is made. Without it, one is made up. A button outside the form names the form by it |
| `showResetButton`  | `Boolean` | To show the reset button (default `true`)                                                                          |
| `showSubmitButton` | `Boolean` | To show the submit and reset buttons (default `true`). Hide them to place the buttons outside the form ([recipe](/recipes/form-in-modal.md)) |
| ~~`rules`~~        | ~~`Object`~~ | **DEPRECATED:** Use `validator` prop instead                                                                      |
| ~~`messages`~~     | ~~`Object`~~ | **DEPRECATED:** Use `validator` prop instead                                                                      |

::: warning DEPRECATED PROPS
The `:rules` and `:messages` props are deprecated in v1.3.0. Use the `:validator` prop with a validator factory function instead:

```vue
<script setup>
import { createEncolaValidator } from '@encolajs/enforma/validators/encola'

const validator = createEncolaValidator(
  { firstName: 'required', email: 'required|email' },
  { 'firstName.required': 'First name is required' }
)
</script>
<template>
  <Enforma :data="formData" :validator="validator" />
</template>
```

See the [Migration Guide](/migration-guide-1_3) for complete migration instructions.
:::

## Events

| Event                | Payload                                            | Description                                                                                                     |
|----------------------|----------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| `submit_error`       | `formData`                                         | Emitted when there's an error while submitting the form                                                         |
| `submit_success`     | `formData`                                         | Emitted when the form is successfully submited                                                                  |
| `validation_fail`   | `(formController, paths)`                          | Emitted when validation fails, with the fields that failed in the order the schema renders them. This is where you add notifications/toasts, open the tab holding the first and focus it (`formController.focusField(paths[0])`) |
| `validation_success` | `formData`                                         | Emitted when validation passes                                                                                  |
| `field_change`       | `{ path, value, fieldController, formController }` | Emitted when any field value changes                                                                            |
| `field_blur`         | `{ name, fieldController, formController }`        | Emitted when a field is blurred                                                                                 |
| `field_focus`        | `{ name, fieldController, formController }`        | Emitted when a field is focused                                                                                 |

## Slots

| Slot      | Props | Description                                                        |
|-----------|-------|--------------------------------------------------------------------|
| `default` | None | The main slot for form content where the fields are being rendered |
| `actions` | None | The place where the submit and reset buttons are being rendered    |

## Submit and Reset Buttons

`<EnformaSubmitButton>` and `<EnformaResetButton>` are the buttons `<Enforma>` renders in its `actions` slot. Render them yourself to place them elsewhere: in the form, or outside it ([recipe](/recipes/form-in-modal.md)).

| Prop             | Type               | Description                                                                                                  |
|------------------|--------------------|--------------------------------------------------------------------------------------------------------------|
| `form`           | `Object`           | The form to submit or reset, for a button outside it: a ref to its `<Enforma>`, or a controller from `useForm()`. `null` until the form mounts, and the button is disabled until then. Without it, the form the button is in |
| `content`        | `String`           | The button's text (default `Submit` / `Reset`), unless the config has one (`pt.submit.content` / `pt.reset.content`, which the default preset sets). To name one button, put its text in its default slot: `<EnformaSubmitButton>Save</EnformaSubmitButton>` |
| `loadingContent` | `String`           | The submit button's text while the form submits (default `Submitting...`), unless the config has one (`pt.submit.loadingContent`) |
| `as`             | `String`, `Object` | The component to render (default `button`, or `pt.submit.as` / `pt.reset.as` from the config)                |

The submit button given a `form` names it by its id (`<button type="submit" form="…">`), so a click and Enter in a field submit it. Both buttons are disabled while the form submits.
