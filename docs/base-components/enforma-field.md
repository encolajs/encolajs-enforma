# EnformaField

`EnformaField` is the core component for rendering individual form fields. It handles state management, validation, and UI rendering for a single/multiple form input.

## Basic Usage

```vue
<template>
  <Enforma :data="formData" :submitHandler="submit">
    <EnformaField 
      name="firstName"
      ... rest of the props go here
      ... when NOT using schema+fields rendering mode
    />
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
const formData = {
  firstName: '',
}

function submit(data) {
  console.log('Form submitted:', data);
}
</script>
```

## Props

| Prop | Type                             | Description                                                                                   |
|------|----------------------------------|-----------------------------------------------------------------------------------------------|
| `name` | `String`                         | The field name (required)                                                                     |
| `label` | `String`                         | Field label                                                                                   |
| `component` | `String\|Object`                 | Override the default component for this field type                                            |
| `placeholder` | `String`                         | Input placeholder text                                                                        |
| `hideLabel` | `Boolean`                        | Whether to hide the field label                                                               |
| `showLabelNextToInput` | `Boolean`                        | Whether to show the label next to the input instead of above it                               |
| `required` | `Boolean`                        | Whether the field is required                                                                 |
| `help` | `String`                         | Help text to display below the field                                                          |
| `if` | `Boolean` | Controls whether the field is displayed or hidden (in schema-based forms, this prop can also accept expressions - see [Dynamic Props](/core-concepts/dynamic-props.md)) |
| `labelProps` | `Object`                         | Additional props to pass to the label element                                                 |
| `errorProps` | `Object`                         | Additional props to pass to the error message element                                         |
| `helpProps` | `Object`                         | Additional props to pass to the help text element                                             |
| `wrapperProps` | `Object`                         | Additional props to pass to the wrapper div element                                           |
| `inputProps` | `Object`                         | Additional props to pass to the input component                                               |
| `validateOn` | `String`                         | When to trigger validation                                                                    |

### The `component` Prop

This component determines the type of component to be used for the input part of the field. This can be
- a basic HTML tag like `input` or `textarea`
- a component globally registered within the Vue app (eg: 'InputText')
- a component supported by a present (see [the PrimeVue preset](/presets/primevue.md)).
- an actual input-type component imported in your Vue component like so
```vue {5,11}
<template>
  <Enforma ... ommited for brevity>
    <EnformaField
      name="firstName"
      :component="InputText"
    />
  </Enforma>
</template>

<script setup>
import { InputText } from 'your-ui-library-of-choice'  
</script>
```

### The `if` Prop

This prop is similar to VueJS' `v-show` and controls whether the field is displayed or hidden. When used directly in EnformaField, it only accepts boolean values. 

When a field is defined in a schema, the `if` prop can use dynamic expressions (like `${form.country === 'US'}`) which will be evaluated at runtime. For more details on dynamic expressions in schemas, see the [dynamic props section](/core-concepts/dynamic-props.md).

## Slots

There are no slots for customizing the layout of the `EnformaField` because the component is [so simple](https://github.com/encolajs/encolajs-enforma/blob/master/src/core/EnformaField.vue), if you really want to customize it, it's better to just 
roll your own.

## Input Components

The `EnformaField` component is generic and, while it has opinions on the layout of the field, it requires you to "bring your own" input fields. More about this on th e [UI Library Integration](/ui-library-integration/)