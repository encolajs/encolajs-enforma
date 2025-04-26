# Vuetify Components for Enforma

This directory contains Vuetify-specific components used by the Enforma Vuetify preset. These components are designed to integrate seamlessly with both Enforma and Vuetify.

## Components

- `SubmitButton.vue` - Form submit button using Vuetify's v-btn
- `ResetButton.vue` - Form reset button using Vuetify's v-btn
- `RepeatableAddButton.vue` - Button to add items to repeatable fields
- `RepeatableRemoveButton.vue` - Button to remove items from repeatable fields
- `RepeatableMoveUpButton.vue` - Button to move repeatable items up
- `RepeatableMoveDownButton.vue` - Button to move repeatable items down

## Usage

These components are automatically used when you apply the Vuetify preset to your Enforma configuration:

```ts
import { useVuetifyPreset } from '@encolajs/enforma'

// Apply the preset at the start of your application
useVuetifyPreset()
```

## Customization

You can override these components by providing your own custom components when calling `useVuetifyPreset()`:

```ts
import { useVuetifyPreset } from '@encolajs/enforma'
import MyCustomSubmitButton from './MyCustomSubmitButton.vue'

// Override the default submit button
useVuetifyPreset({
  submitButton: MyCustomSubmitButton
})
```