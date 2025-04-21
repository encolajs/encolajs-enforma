# Configuration

Enforma provides a powerful configuration system that lets you customize form behavior at both global and form-specific levels.

Enforma's configuration system allows you to define:

- Default validators
- UI component mappings
- Field transformers
- Custom error messages
- App-specific options. The configuration can receive additional data besides those required by the library.

## Global Configuration

Global configuration is done using 2 mechanisms:
1. When installing the Enforma plugin (see [installation](/installation.md))
2. By using a UI preset (see [the PrimeVue preset](/ui-library-integration/primevue-preset.md))

The global configuration options are available via VueJS' [provide/inject](https://vuejs.org/guide/components/provide-inject) mechanism in all base components.

> [!WARNING] If you are using headless component and want access to the configuration options you have to import it yourself (see "Accessing Configuration"). 

## Form Configuration

At each form you can change the configuration available to the form by using the `:config` prop:

```vue
<Enforma 
  :data="value" 
  :rules="validationRules" 
  :config="localConfig"
/>
```

The form's configuration object is merged with the global configuration into a config object specific to the form.

You should use form configuration under specific circumstances of that particular form:
- Specific props have to be added to the components of that form
- Some transformers are needed only to that form
- Some components need to be overwritten just for that form

## Accessing Configuration

### Inside Enforma Forms

Usually you will need to access the configuration if you're building custom components or if you add custom configuration to your application.

Here's an example of accessing the form's config for a a custom input component

```vue {5,13}
<template>
  <!-- assuming you are using tailwind options already configured -->
  <input
    type="email"
    :class="getConfig('tailwind.text')"
    v-bind="$attrs"
  />
</template>
<script setup>
import { useFormConfig } from '@encolajs/enforma/utils/useFormConfig'
const { getConfig } = useFormConfig()
</script>
```

### Inside Headless Forms

Here's a sample form component that uses only headless components
```vue {9,20-21}
<template>
<HeadlessForm :data=data :rules=rules :submitHandler=submitHandler>
  ...
  <HeadlessField
     name="email"
  >
    <template #default="fieldCtrl">
       <div
          :class="getConfig('pt.wrapper.class', 'field-wrapper')"
       >
       ... here goes the label, input(s), error message...
       </div>   
    </template>
  </HeadlessField>   
  ...
</HeadlessForm>
</template>

<script setup>
import { useFormConfig } from '@encolajs/enforma/utils/useFormConfig'
const { getConfig } = useFormConfig()
</script>
```