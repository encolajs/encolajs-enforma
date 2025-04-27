# Quasar Preset

Enforma includes a built-in preset for [Quasar Framework](https://quasar.dev/), making it easy to create forms using Quasar components. This integration provides a seamless experience that leverages Quasar's feature-rich UI components while maintaining Enforma's powerful form management capabilities.

## Installation

To use the Quasar preset, you need to have Quasar installed in your project:

```bash
# If using Vue CLI
vue add quasar

# If using Vite
npm install quasar @quasar/extras
```

Follow the [Quasar setup instructions](https://quasar.dev/start/vite-plugin) to configure it in your Vue application.

## Basic Usage

Import and use the Quasar preset:

```js
// main.js
import { createApp } from 'vue';
import { createEnforma, useQuasarPreset } from '@encolajs/enforma';
import { Quasar } from 'quasar';
import App from './App.vue';

// Import Quasar CSS
import 'quasar/dist/quasar.css';
// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css';

// Create the app
const app = createApp(App);

// Configure Quasar
app.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
});

// Configure Enforma
const enforma = createEnforma();
app.use(enforma);

// Apply Quasar preset
useQuasarPreset();

app.mount('#app');
```

Now use Enforma components with Quasar styling:

```vue
<template>
  <q-card class="q-pa-md">
    <Enforma :data="formData" :submitHandler="submit">
      <QuasarField name="name" label="Name" />
      <QuasarField name="email" label="Email" />
      <QuasarField 
        name="country" 
        label="Country" 
        input-component="select" 
        :input-props="{ options: countries, 'emit-value': true, 'map-options': true }" 
      />
      <div class="row q-mt-md">
        <div class="col-12">
          <div class="flex justify-end q-gutter-md">
            <q-btn outline color="grey" label="Reset" type="reset" />
            <q-btn color="primary" label="Submit" type="submit" />
          </div>
        </div>
      </div>
    </Enforma>
  </q-card>
</template>

<script setup>
import { ref } from 'vue';
import { Enforma } from '@encolajs/enforma';
// creating a custom field component was needed 
// due to how Quasar is rendering labels and hints/messages 
import QuasarField from '@encolajs/enforma/presets/quasar/Field';
import { QBtn, QCard } from 'quasar';

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

The preset includes the following mapped components:

| Field Type | Quasar Component |
|------------|------------------|
| `input`    | QInput           |
| `select`   | QSelect          |
| `toggle`   | QToggle          |
| `switch`   | QToggle          |

The preset also includes styled button components:

| Button | Quasar Component |
|--------|-------------------|
| EnformaSubmitButton | QBtn (type="submit") |
| EnformaResetButton | QBtn (type="reset") |
| EnformaRepeatableAddButton | QBtn (icon="add") |
| EnformaRepeatableRemoveButton | QBtn (icon="delete") |
| EnformaRepeatableMoveUpButton | QBtn (icon="arrow_upward") |
| EnformaRepeatableMoveDownButton | QBtn (icon="arrow_downward") |

> [!NOTE]
> This preset takes advantage of Quasar's UI components and styling conventions. If you need to customize it further, you can modify the preset files or create your own custom components based on them.