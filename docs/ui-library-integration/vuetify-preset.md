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
import { createFormKit } from 'encolajs-formkit';
import { vuetifyPreset } from 'encolajs-formkit/presets/vuetify';
import { createVuetify } from 'vuetify';
import App from './App.vue';

// Create Vuetify instance
const vuetify = createVuetify();

// Create the app
const app = createApp(App);

// Configure FormKit with Vuetify preset
const formkit = createFormKit({
  preset: vuetifyPreset
});

// Add plugins
app.use(vuetify);
app.use(formkit);

app.mount('#app');
```

Now use Enforma components with Vuetify styling:

```vue
<template>
  <v-container>
    <Enforma v-model="formData" @submit="onSubmit">
      <EnformaField name="name" label="Name" />
      <EnformaField name="email" type="email" label="Email" />
      <EnformaField name="country" type="select" label="Country" :options="countries" />
      <EnformaSubmitButton>Submit</EnformaSubmitButton>
    </Enforma>
  </v-container>
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

function onSubmit(data) {
  console.log('Form submitted:', data);
}
</script>
```

## Supported Components

The Vuetify preset maps these field types to Vuetify components:

| Field Type | Vuetify Component |
|------------|-------------------|
| text | VTextField |
| password | VTextField (type="password") |
| email | VTextField (type="email") |
| number | VTextField (type="number") |
| textarea | VTextarea |
| select | VSelect |
| multiselect | VSelect (multiple) |
| checkbox | VCheckbox |
| radio | VRadioGroup + VRadio |
| switch | VSwitch |
| date | VDatePicker |
| time | VTimePicker |
| slider | VSlider |
| file | VFileInput |
| combobox | VCombobox |
| autocomplete | VAutocomplete |
| chips | VChipGroup + VChip |
| rating | VRating |
| color | VColorPicker |

## Form Buttons

The preset also includes styled button components:

| Button | Vuetify Component |
|--------|-------------------|
| EnformaSubmitButton | VBtn (type="submit") |
| EnformaResetButton | VBtn (type="reset") |
| EnformaRepeatableAddButton | VBtn (prependIcon="mdi-plus") |
| EnformaRepeatableRemoveButton | VBtn (prependIcon="mdi-delete") |
| EnformaRepeatableMoveUpButton | VBtn (prependIcon="mdi-arrow-up") |
| EnformaRepeatableMoveDownButton | VBtn (prependIcon="mdi-arrow-down") |

## Customizing the Preset

You can extend or override the default Vuetify preset:

```js
import { vuetifyPreset } from 'encolajs-formkit/presets/vuetify';
import MyCustomComponent from './components/MyCustomComponent.vue';

// Create a customized version of the preset
const customVuetifyPreset = {
  ...vuetifyPreset,
  components: {
    ...vuetifyPreset.components,
    // Override or add components
    custom: MyCustomComponent,
    select: MyCustomSelect  // Override the default select
  },
  componentProps: {
    ...vuetifyPreset.componentProps,
    // Add or override default props
    text: {
      ...vuetifyPreset.componentProps.text,
      variant: 'outlined',
      density: 'comfortable'
    },
    submitButton: {
      ...vuetifyPreset.componentProps.submitButton,
      color: 'success',
      size: 'large'
    }
  }
};

// Use in createFormKit
const formkit = createFormKit({
  preset: customVuetifyPreset
});
```

## Vuetify-Specific Features

### Dense Fields

Use Vuetify's density prop:

```vue
<template>
  <Enforma v-model="formData">
    <EnformaField 
      name="username" 
      label="Username" 
      density="compact" 
    />
    <EnformaField 
      name="password" 
      type="password" 
      label="Password" 
      density="compact" 
    />
  </Enforma>
</template>
```

### Input Variants

Apply Vuetify's input variants:

```vue
<template>
  <Enforma v-model="formData">
    <EnformaField 
      name="name" 
      label="Name" 
      variant="outlined" 
    />
    <EnformaField 
      name="email" 
      type="email" 
      label="Email" 
      variant="filled" 
    />
    <EnformaField 
      name="message" 
      type="textarea" 
      label="Message" 
      variant="solo" 
    />
  </Enforma>
</template>
```

### Prefix and Suffix Icons

Add icons to your fields:

```vue
<template>
  <Enforma v-model="formData">
    <EnformaField 
      name="email" 
      type="email" 
      label="Email" 
      prependIcon="mdi-email" 
    />
    <EnformaField 
      name="password" 
      type="password" 
      label="Password" 
      prependIcon="mdi-lock" 
      appendIcon="mdi-eye-off" 
    />
    <EnformaField 
      name="amount" 
      type="number" 
      label="Amount" 
      prependInnerIcon="mdi-currency-usd" 
    />
  </Enforma>
</template>
```

### Form Layout with Vuetify Grid

Combine with Vuetify's layout components:

```vue
<template>
  <Enforma v-model="formData">
    <v-row>
      <v-col cols="12" md="6">
        <EnformaField name="firstName" label="First Name" />
      </v-col>
      <v-col cols="12" md="6">
        <EnformaField name="lastName" label="Last Name" />
      </v-col>
      <v-col cols="12">
        <EnformaField name="address" label="Address" />
      </v-col>
      <v-col cols="12" md="4">
        <EnformaField name="city" label="City" />
      </v-col>
      <v-col cols="12" md="4">
        <EnformaField name="state" label="State" />
      </v-col>
      <v-col cols="12" md="4">
        <EnformaField name="zipCode" label="ZIP Code" />
      </v-col>
    </v-row>
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>
```

## Validation Integration

Vuetify components display validation state automatically:

```vue
<template>
  <Enforma v-model="formData" :validators="validators">
    <EnformaField name="email" type="email" label="Email" />
    <EnformaField name="password" type="password" label="Password" />
    <EnformaSubmitButton>Register</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
const validators = {
  email: ['required', 'email'],
  password: ['required', 'min:8']
};
</script>
```

## Using with Vuetify Theme

The Vuetify preset works with Vuetify's theming system:

```js
// main.js
import { createVuetify } from 'vuetify';

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
          // other colors
        }
      },
      dark: {
        colors: {
          primary: '#2196F3',
          secondary: '#03A9F4',
          // other colors
        }
      }
    }
  }
});
```

Then use theme colors in your form:

```vue
<template>
  <Enforma v-model="formData">
    <EnformaField 
      name="email" 
      type="email" 
      label="Email" 
      color="primary" 
    />
    <EnformaSubmitButton color="secondary">Submit</EnformaSubmitButton>
  </Enforma>
</template>
```

## Creating Complex Forms

### Form with Sections

Use Vuetify's Card component for sections:

```vue
<template>
  <Enforma v-model="formData">
    <v-card class="mb-4">
      <v-card-title>Personal Information</v-card-title>
      <v-card-text>
        <EnformaField name="firstName" label="First Name" />
        <EnformaField name="lastName" label="Last Name" />
        <EnformaField name="birthDate" type="date" label="Date of Birth" />
      </v-card-text>
    </v-card>
    
    <v-card class="mb-4">
      <v-card-title>Contact Information</v-card-title>
      <v-card-text>
        <EnformaField name="email" type="email" label="Email" />
        <EnformaField name="phone" label="Phone" />
      </v-card-text>
    </v-card>
    
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>
```

## Best Practices

- Follow Vuetify's component guidelines for consistent appearance
- Use Vuetify's grid system for form layout
- Leverage theme colors for visual consistency
- Consider density and variant options for different form contexts
- Use Vuetify's icons consistently across your form
- For complex forms, combine with Vuetify's structural components
- Test your forms in both light and dark themes if your app supports both