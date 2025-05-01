# Vuetify Preset

Enforma includes a built-in preset for [Vuetify](https://vuetifyjs.com/), making it easy to create forms using Vuetify components. This integration provides a seamless experience that leverages Vuetify's Material Design-based component library while maintaining Enforma's powerful form management capabilities.

## Installation

To use the Vuetify preset, you need to have Vuetify installed in your project:

```bash
npm install vuetify
```

Follow the [Vuetify setup instructions](https://vuetifyjs.com/en/getting-started/installation/) to configure it in your Vue application.

## Basic Usage

Import and use the Vuetify preset:

```js
// main.js
import { createApp } from 'vue';
import { EnformaPlugin } from '@encolajs/enforma';
import { useVuetifyPreset } from '@encolajs/enforma/presets/vuetify';
import { createVuetify } from 'vuetify';
import App from './App.vue';

// Create Vuetify instance
const vuetify = createVuetify();

// Create the app
const app = createApp(App);

// Add plugins
app.use(vuetify);
app.use(EnformaPlugin);

// Add the Vuetify preset
useVuetifyPreset()

app.mount('#app');
```

Now use Enforma components with Vuetify styling:

```vue
<template>
  <v-container>
    <Enforma :data="formData" :submitHandler="submit">
      <VuetifyField name="name" label="Name" />
      <VuetifyField name="email" label="Email" />
      <VuetifyField name="country" type="select" label="Country" :options="countries" />
    </Enforma>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { Enforma, EnformaField, EnformaSubmitButton } from '@encolajs/enforma';
// creating a custom field component wass needed 
// due to how Vuetify is rendering labels and hints/messages 
import VuetifyField from '@encolajs/enforma/presets/vuetify/Field';

const formData = ref({
  name: '',
  email: '',
  country: ''
});

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'mx', label: 'Mexico' }
];

function submit(data) {
  console.log('Form submitted:', data);
}
</script>
```

## Form Components

The preset also includes styled button components:

| Button | Vuetify Component |
|--------|-------------------|
| EnformaSubmitButton | VBtn (type="submit") |
| EnformaResetButton | VBtn (type="reset") |
| EnformaRepeatableAddButton | VBtn (prependIcon="mdi-plus") |
| EnformaRepeatableRemoveButton | VBtn (prependIcon="mdi-delete") |
| EnformaRepeatableMoveUpButton | VBtn (prependIcon="mdi-arrow-up") |
| EnformaRepeatableMoveDownButton | VBtn (prependIcon="mdi-arrow-down") |

> [!WARNING]
> The Vuetify library is pretty comples so the provided preset may not fit all the edge-cases and we have little to none experience with Vuetify. 
> If you might need to take the files provided in the preset provided and customize it. **PRs are welcome** :)

## Known Issues

Due to how Vuetify implements events, some of the components might not work with the `HeadlessField` component. 
For example the `VSwitch` component does not trigger a `change` event that is "correct", meaning similar to a native browser's event and the changed value cannot be interpreted correctly. 

> [!INFO] To fix this issue you have to use the `update:modelValue` to update the value in the form 

> [!WARNING] This is a problem ONLY if you are using the headless components