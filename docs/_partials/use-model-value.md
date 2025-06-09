### `useModelValue`

> [!IMPORTANT]
> This prop is required by the input components that **do not** expose `input` and `change` events and instead use `update:modelValue`. Vuetify and Quasar do this for all their form components
 
This changes the way fields are marked as dirty which, in turn, determines when validation is triggered. 

The ideal UX for validating a form field is the following: the field is validated after the user is done changing the field for the first time (i.e. on change) and everytime it changes the field afterward (i.e. on input). 

However, when you are using `update:modelValue` the field must be validated on every change.

Use `useModelValue` to ensure the proper events are bound to the input when `input` and `change` events are not enough.