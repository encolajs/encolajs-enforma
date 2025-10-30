# UI Library Integration

Enforma is designed to be UI-library agnostic, allowing you to integrate with any Vue UI library. This guide explains how to connect Enforma with your preferred UI components.

## Included Presets

Enforma comes with several built-in presets for popular UI libraries:

- [Vuetify Preset](vuetify-preset.md) - For integrating with Vuetify 3
- [PrimeVue Preset](primevue-preset.md) - For integrating with PrimeVue
- [Quasar Preset](quasar-preset.md) - For integrating with Quasar Framework
- [Reka UI Preset](rekaui-preset.md) - For integrating with Reka UI (headless components)
- [Nuxt UI Preset](nuxtui-preset.md) - For integrating with Nuxt UI

## Custom Integration

`<EnformaField>` is the most frequently used component and it is the entry point for introducing your UI input components (text, radio buttons, selects etc)

This can be achieved by passing the input component you want as the `inputComponent` prop:

## Using a Locally Imported Component

```vue
<template>
  <Enforma :data="formData" :config="formConfig">
    <!-- Form fields will use mapped components -->
    <EnformaField name="name" label="Name" :inputComponent="MyTextInput" />
    <EnformaField name="email" label="Email" :inputComponent="MyEmailInput" />
    <EnformaField 
      name="subscription" 
      inputComponent="MySelect" 
      label="Subscription Plan" 
      :inputProps="{
        options: [... options go here...]
      }" 
    />
  </Enforma>
</template>

<script setup>
import { Enforma, EnformaField } from '@encolajs/enforma';
import { MyTextInput, MyEmailInput, MySelect } from 'my-ui-library';
</script>
```

## Using a Transformer

```js
// src/inputComponentPropTransformer.js
import {
  MyTextInput,
  MyPasswordInput,
  MyNumberInput,
  MySelect,
  MyCheckbox,
  MyRadio,
  MyTextarea,
  MyDatePicker,
  MyButton
} from 'my-ui-library';

const inputMap = {
    // Input types
    text: MyTextInput,
    password: MyPasswordInput,
    number: MyNumberInput,
    select: MySelect,
    checkbox: MyCheckbox,
    radio: MyRadio,
    textarea: MyTextarea,
    date: MyDatePicker,
}

export default function inputComponentPropTransformer(fieldProps) {
  if (fieldProps.inputComponent && 'object' !== typeof fieldProps.inputComponent) {
    // if the component is not already a Vue component
    fieldProps.inputComponent = inputComponents[fieldProps.inputComponent] || InputText
  } else if (!fieldProps.inputComponent) {
    // default to InputText
    fieldProps.inputComponent = MyTextInput
  }
  return fieldProps
}
```

When initializing the Enforma plugin:

```js
import inputComponentPropTransformer from 'src/inputComponentPropTransformer.js'
import { EnformaPlugin } from '@encolajs/enforma'

app.use(EnformaPlugin, {
  transformers: {
    field_props: [inputComponentPropTransformer]
  }
}))
```

The same can be achieved inside a preset like [the PrimeVue preset](primevue-preset.md)