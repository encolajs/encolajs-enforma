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
import { createApp } from 'vue';
import { createEnforma } from 'encolajs-formkit';
import { primevuePreset } from 'encolajs-formkit/presets/primevue';
import PrimeVue from 'primevue/config';
import App from './App.vue';

// Create the app
const app = createApp(App);

// Configure FormKit with PrimeVue preset
const formkit = createEnforma({
  preset: primevuePreset
});

// Add plugins
app.use(PrimeVue);
app.use(formkit);

app.mount('#app');
```

Now use Enforma components with PrimeVue styling:

```vue
<template>
  <Enforma :data="formData" :submitHandler="submit">
    <EnformaField name="name" label="Name" />
    <EnformaField name="email" label="Email" />
    <EnformaField name="country" inputComponent="select" label="Country" :options="countries" />
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
import { ref } from 'vue';
import { Enforma, EnformaField, EnformaSubmitButton } from 'encolajs-formkit';

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

## Supported Components

The PrimeVue preset maps these field types to PrimeVue components:

| Field Type | PrimeVue Component |
|------------|-------------------|
| text | InputText |
| password | Password |
| email | InputText (type="email") |
| number | InputNumber |
| textarea | Textarea |
| select | Dropdown |
| multiselect | MultiSelect |
| checkbox | Checkbox |
| radio | RadioButton |
| switch | InputSwitch |
| date | Calendar |
| time | Calendar (timeOnly) |
| datetime | Calendar (showTime) |
| slider | Slider |
| rating | Rating |
| color | ColorPicker |
| autocomplete | AutoComplete |
| chips | Chips |
| editor | Editor |
| file | FileUpload |

## Form Buttons

The preset also includes styled button components:

| Button | PrimeVue Component |
|--------|-------------------|
| EnformaSubmitButton | Button (type="submit") |
| EnformaResetButton | Button (type="reset") |
| EnformaRepeatableAddButton | Button (icon="pi pi-plus") |
| EnformaRepeatableRemoveButton | Button (icon="pi pi-trash") |
| EnformaRepeatableMoveUpButton | Button (icon="pi pi-arrow-up") |
| EnformaRepeatableMoveDownButton | Button (icon="pi pi-arrow-down") |

## Customizing the Preset

You can extend or override the default PrimeVue preset:

```js
import { primevuePreset } from 'encolajs-formkit/presets/primevue';
import MyCustomComponent from './components/MyCustomComponent.vue';

// Create a customized version of the preset
const customPrimeVuePreset = {
  ...primevuePreset,
  components: {
    ...primevuePreset.components,
    // Override or add components
    custom: MyCustomComponent,
    select: MyCustomDropdown  // Override the default select
  },
  componentProps: {
    ...primevuePreset.componentProps,
    // Add or override default props
    text: {
      ...primevuePreset.componentProps.text,
      class: 'custom-input'
    },
    button: {
      ...primevuePreset.componentProps.button,
      size: 'large'
    }
  }
};

// Use in createEnforma
const formkit = createEnforma({
  preset: customPrimeVuePreset
});
```

## PrimeVue-Specific Features

### Autocompletion

The PrimeVue preset includes support for the AutoComplete component:

```vue
<template>
  <Enforma :data="formData">
    <EnformaField 
      name="city" 
      type="autocomplete" 
      label="City" 
      :suggestions="filteredCities"
      @complete="searchCities"
    />
  </Enforma>
</template>

<script setup>
import { ref } from 'vue';

const formData = ref({
  city: ''
});

const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 
  'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'
];

const filteredCities = ref([]);

function searchCities(event) {
  const query = event.query;
  filteredCities.value = cities.filter(city => 
    city.toLowerCase().includes(query.toLowerCase())
  );
}
</script>
```

### Advanced Select Features

Use PrimeVue's rich select features:

```vue
<template>
  <Enforma :data="formData">
    <EnformaField 
      name="country" 
      inputComponent="select" 
      label="Country" 
      :options="countries"
      option-label="name"
      option-value="code"
      :filter="true"
      placeholder="Select a Country"
    />
  </Enforma>
</template>

<script setup>
const countries = [
  { name: 'United States', code: 'US' },
  { name: 'Canada', code: 'CA' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'France', code: 'FR' },
  { name: 'Germany', code: 'DE' },
  { name: 'Japan', code: 'JP' }
];
</script>
```

### Form Layout with PrimeVue Grid

Combine with PrimeVue's layout components:

```vue
<template>
  <Enforma :data="formData">
    <div class="grid">
      <div class="col-12 md:col-6">
        <EnformaField name="firstName" label="First Name" />
      </div>
      <div class="col-12 md:col-6">
        <EnformaField name="lastName" label="Last Name" />
      </div>
      <div class="col-12">
        <EnformaField name="address" label="Address" />
      </div>
      <div class="col-12 md:col-4">
        <EnformaField name="city" label="City" />
      </div>
      <div class="col-12 md:col-4">
        <EnformaField name="state" label="State" />
      </div>
      <div class="col-12 md:col-4">
        <EnformaField name="zipCode" label="ZIP Code" />
      </div>
    </div>
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>
```

## Validation Integration

PrimeVue components display validation state automatically:

```vue
<template>
  <Enforma :data="formData" :rules="validators">
    <EnformaField name="email" label="Email" />
    <EnformaField name="password" type="password" label="Password" />
    <EnformaSubmitButton>Register</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
const validators = {
  email: ['required', 'email'],
  password: [
    'required',
    { name: 'min', params: [8], message: 'Password must be at least 8 characters' }
  ]
};
</script>
```

## Theming

The PrimeVue preset works with all PrimeVue themes. Simply configure the theme according to PrimeVue's documentation:

```js
// main.js
import 'primevue/resources/themes/lara-light-blue/theme.css';
```

## Best Practices

- Import PrimeVue styles and theme according to PrimeVue documentation
- Use PrimeVue's layout components for consistent spacing
- Leverage PrimeVue-specific features like filtering and templates
- Consider using PrimeVue's validation styling for a consistent look
- When customizing components, maintain PrimeVue's API expectations
- For complex forms, consider combining with PrimeVue's Panel or Card components