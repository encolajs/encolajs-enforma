# PrimeVue Preset

Enforma includes a built-in preset for [PrimeVue](https://primevue.org/), making it easy to create forms using PrimeVue components without manual configuration. This integration provides a seamless experience that leverages PrimeVue's extensive component library while maintaining Enforma's powerful form management capabilities.

## Installation

To use the PrimeVue preset, you need to have PrimeVue installed in your project:

```bash
npm install primevue
```

Follow the [PrimeVue setup instructions](https://primevue.org/installation) to configure it in your Vue application.

## Basic Usage

Import and use the PrimeVue preset:

```js
// main.js
import { createApp } from 'vue'
import { EnformaPlugin } from '@encolajs/enforma'
import { primevuePreset } from '@encolajs/enforma/presets/primevue'
import PrimeVue from 'primevue/config'
import { InputText, Select } from 'primevue'
import App from './App.vue'

// Create the app
const app = createApp(App);

// Add PrimeVue
app.use(PrimeVue);

// Configure Enforma
app.use(EnformaPlugin)

// Configure PrimeVue preset
// You are required to specify which inputs you are using 
// in order to optimize the bundle size
usePrimeVuePreset({
  input: InputText,
  text: InputText,
  select: Select,
  // add more components here
})

app.mount('#app');
```

Now use Enforma components with PrimeVue styling:

```vue
<template>
  <Enforma :data="formData" :submitHandler="submit">
    <EnformaField name="name" label="Name" />
    <EnformaField name="email" label="Email" />
    <EnformaField name="country" inputComponent="select" label="Country" :inputProps="{options: countries}" />
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
import { ref } from 'vue';
import { Enforma, EnformaField, EnformaSubmitButton } from '@encolajs/enforma';

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

The preset also includes a set of PrimeVue-styled components:

| Button | PrimeVue Component |
|--------|-------------------|
| EnformaSubmitButton | Button (type="submit") |
| EnformaResetButton | Button (type="reset") |
| EnformaRepeatableAddButton | Button (icon="pi pi-plus") |
| EnformaRepeatableRemoveButton | Button (icon="pi pi-trash") |
| EnformaRepeatableMoveUpButton | Button (icon="pi pi-arrow-up") |
| EnformaRepeatableMoveDownButton | Button (icon="pi pi-arrow-down") |

> [!INFO] 
> These can be customized by changing the Enforma configuration **AFTER** applying the preset. <br>
> Alternatively, you can make your own PrimeVue preset based on the one provided by the library