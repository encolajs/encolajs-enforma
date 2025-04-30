# Multi-input Fields

This recipe shows how you can go about implementing an input with multiple controls.

The most common example would be range of numbers that have a `min` and a `max` control.

## Quick Implementation

A simple way to do this is create a "fake" input component that displays both the controls (one for `min` and one for `max`) and the error messages. The main advantage of this approach is that you can leverage existing components, validation 
rules etc

> You can see it action on the [form with fields example](/examples/fields.md)

<<< @/examples/enforma/SalaryField.vue

In the form you can do 

```html
<EnformaField
   label="Salary"
   name="salary"
   inputProp="NumberRange" />
```

## Proper Implementation

A proper, more robust, implementation would look like this:
1. You build a proper input component that works independently
   - The input component does not rely on the `HeadlessField` to interact with the form
   - The input component emits `onInput`, `onChange` or `update:modelValue` to communicate with the outside world
   - The component is used inside the Enforma form just like a regular `<input/>`
2. You implement specific validation rules to validate the `min` and `max` parts of the range. The validation rules might look like this: `range: "required|has_min|has_max|is_range"`. The validator rules would be
   - `has_min` - checks if the range has a `min` component that is a number and returns a "Start of the range is missing" type of message
   - `has_max` - checks if the range has a `max` component that is a number and returns a "End of the range is missing" type of message
   - `is_range` - checks if the `max` value is greater than the `min` value and returns a "End of range must be greater than the start" type of message