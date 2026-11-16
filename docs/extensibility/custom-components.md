# Using Custom Components

Enforma's component architecture is designed to be highly customizable, allowing you to replace and extend its core components to meet your specific requirements. This guide explains how to create and use custom components to tailor Enforma's behavior and appearance to your needs.

## Understanding Enforma's Component System

Enforma uses a component-based architecture where each form element is represented by a specific Vue component:

- **EnformaField**: Renders form fields with labels, inputs, and validation messages
- **EnformaSection**: Groups fields together
- **EnformaRepeatable**: Creates repeatable field groups
- **EnformaRepeatableTable**: Displays repeatable fields in a table format
- **EnformaSchema**: Renders forms based on JSON schema configurations
- **Button components**: Submit, reset, and various repeatable control buttons

These components are registered globally in Enforma's configuration system, making it easy to replace them with your own implementations.

## When to Create Custom Components

Consider creating custom components when you need to:

1. **Implement specialized form elements** that aren't covered by existing components
2. **Modify the default rendering** of form elements to match your design system
3. **Add additional functionality** to existing form elements
4. **Change the behavior** of how form elements interact with each other

## Registering Custom Components

### Global Registration

To register your custom components globally, use the `EnformaPlugin` configuration:

```js
import { EnformaPlugin } from '@encolajs/enforma'
import MyCustomField from './components/MyCustomField.vue'
import MyCustomRepeatable from './components/MyCustomRepeatable.vue'

app.use(EnformaPlugin, {
  components: {
    field: MyCustomField,
    repeatable: MyCustomRepeatable,
    // Other component overrides...
  }
})
```

### Form-Specific Registration

For form-specific customization, provide components via the form's `config` prop:

```vue
<template>
  <Enforma 
    :data="formData" 
    :rules="validationRules"
    :config="formConfig"
  />
</template>

<script setup>
import { ref } from 'vue'
import MyCustomField from './components/MyCustomField.vue'

const formData = ref({})
const formConfig = {
  components: {
    field: MyCustomField,
    // Other component overrides...
  }
}
</script>
```

### Using Presets

For more comprehensive customization, you can create a preset that bundles multiple custom components and configuration options:

```js
// src/presets/my-custom-preset.js
import MyCustomField from './components/MyCustomField.vue'
import MyCustomRepeatable from './components/MyCustomRepeatable.vue'
import MySubmitButton from './components/MySubmitButton.vue'
import { setGlobalConfig, getGlobalConfig } from '@encolajs/enforma'

export default function useMyCustomPreset() {
  const currentConfig = getGlobalConfig()
  
  const customPreset = {
    components: {
      field: MyCustomField,
      repeatable: MyCustomRepeatable,
      submitButton: MySubmitButton,
      // Other component overrides...
    },
    // Additional configuration...
  }
  
  // Merge with current config
  const mergedConfig = {
    ...currentConfig,
    components: {
      ...currentConfig.components,
      ...customPreset.components,
    },
    // Merge other configuration sections as needed
  }
  
  setGlobalConfig(mergedConfig)
}
```

Then use your preset in your main.js file:

```js
import { createApp } from 'vue'
import { EnformaPlugin } from '@encolajs/enforma'
import useMyCustomPreset from './presets/my-custom-preset'
import App from './App.vue'

const app = createApp(App)
app.use(EnformaPlugin)
useMyCustomPreset()
app.mount('#app')
```

## Creating Custom Components

### Custom Field Component

A custom field component replaces the default `EnformaField` component, giving you complete control over how form fields are rendered. Here's how to create one:

```vue
<!-- MyCustomField.vue -->
<template>
  <div v-bind="props.wrapperProps" class="my-custom-field">
    <!-- Custom label implementation -->
    <label 
      v-if="!props.hideLabel && props.label" 
      v-bind="props.labelProps"
      class="my-custom-label"
    >
      {{ t(props.label) }}
      <span v-if="props.required" v-bind="props.requiredProps">
        {{ requiredIndicator }}
      </span>
    </label>
    
    <!-- Input component using v-model binding -->
    <div class="my-custom-input-wrapper">
      <component
        :is="props.inputComponent"
        v-model="fieldController.value"
        v-bind="props.inputProps"
        v-on="props.inputEvents || {}"
      />
    </div>
    
    <!-- Custom error message implementation -->
    <div 
      v-if="fieldController.error" 
      class="my-custom-error"
      v-bind="props.errorProps"
    >
      {{ fieldController.error }}
    </div>
  </div>
</template>

<script setup>
import { useEnformaField } from '@encolajs/enforma/core/useEnformaField'
import { useTranslation } from '@encolajs/enforma/utils/useTranslation'
import { useFormConfig } from '@encolajs/enforma/utils/useFormConfig'

// Define the same props as EnformaField to maintain compatibility
const originalProps = defineProps({
  name: { type: String, required: true },
  label: { type: String, default: null },
  inputComponent: { 
    type: [String, Object],
    default: null 
  },
  hideLabel: { type: Boolean, default: false },
  showLabelNextToInput: { type: Boolean, default: false },
  required: { type: [Boolean, String], default: undefined },
  help: { type: String, default: null },
  useModelValue: { type: Boolean, default: false },
  // Props passed to inner elements
  labelProps: { type: Object, default: () => ({}) },
  errorProps: { type: Object, default: () => ({}) },
  helpProps: { type: Object, default: () => ({}) },
  props: { type: Object, default: () => ({}) },
  inputProps: { type: Object, default: () => ({}) },
  // These are here only because they might be passed from the schema
  section: { type: String, default: null },
  position: { type: Number, default: null },
})

// Use the Enforma field composable to access field controller
const { fieldController, props } = useEnformaField(originalProps)

// Get translation function
const { t } = useTranslation()

// Get configuration
const { getConfig } = useFormConfig()
const requiredIndicator = getConfig('pt.required.text', '*')
</script>

<style scoped>
.my-custom-field {
  margin-bottom: 1rem;
}
.my-custom-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}
.my-custom-error {
  margin-top: 0.25rem;
  color: #dc2626;
  font-size: 0.875rem;
}
</style>
```

### Custom Section Components

A section of the schema can be drawn by a component of your own, which the section names with `component` (see [Section components](/schema-forms/schema-reference#section-components)). Register it in the form's config under that name, or in the Vue app:

```js
const config = { components: { card: CardSection } }
// in the schema: shipping: { type: 'section', title: 'Shipping', component: 'card' }
```

It receives the section's schema as props: its `name`, its `title` and its other keys.

A section component draws its own frame and leaves its items to Enforma with `<EnformaSectionItems :name>`, which renders them exactly as `EnformaSection` does: in render order (fields and sub-sections by `position`), those hidden by their `if` left out, each with its component or the form's `field(name)` slot.

```vue
<template>
  <UCard>
    <template #header>{{ title }}</template>
    <EnformaSectionItems :name="name" />
  </UCard>
</template>

<script setup>
import { EnformaSectionItems } from '@encolajs/enforma'

defineProps({ name: { type: String, required: true }, title: String })
</script>
```

To draw the items itself, a section component uses `useEnformaSection(name, props?)`. It gives `schema`, the section's entry with the props its component was given over it, after the `section_props` transformers; `shown`, whether its `if` holds; and `items`, in render order, those hidden by their `if` left out. Each item has its `kind` (`field`, `section`, `repeatable` or `content`), its `name`, its `schema` entry, the `component` drawing it and the `props` it is given, and, for a field the form has a slot for, that `slot`. `<EnformaSectionItems :name :kinds>` draws only the items of some kinds: `:kinds="['field', 'repeatable', 'content']"` leaves the sub-sections to you.

It also gives `fields`, the paths of the fields inside the section at any depth (its sub-sections' too, those hidden by their `if` left out, a repeatable's path standing for its items' fields), and `errorCount`, how many of them have errors (each failing field of a repeatable's items, and one more for an error on the list itself), which follows each check, a fix and `reset()`.

#### Tabs and collapsibles of your own

The presets draw `component: 'tabs'` and `component: 'collapsible'` sections (see [Tabs and collapsible sections](/schema-forms/schema-reference#tabs-and-collapsible-sections)). To draw them with other widgets, register your components under those names. `useEnformaTabs(name, props?)` gives what tabs need: `tabs` (the sub-sections shown), `active` (the open tab's name, which you set to open another), `orientation`, `labelOf(tab)`, `tabId(name)`, `panelId(name)` and `panelFor(name)`, each tab's [panel](#panels-of-your-own). `useEnformaCollapsible(name, props?)` gives `title`, `open`, `panel`, `headerId` and `bodyId`.

```vue
<template>
  <MyTabs v-model="active">
    <MyTab v-for="tab in tabs" :key="tab.name" :value="tab.name">
      {{ labelOf(tab) }}
      <EnformaErrorBadge :count="panelFor(tab.name).errorCount" />
    </MyTab>
    <!-- Every panel drawn, one shown: the fields of the others are checked -->
    <MyTabPanel v-for="tab in tabs" :key="tab.name" :value="tab.name">
      <EnformaPanel :panel="panelFor(tab.name)">
        <EnformaSectionItems :name="tab.name" />
      </EnformaPanel>
    </MyTabPanel>
  </MyTabs>
</template>

<script setup>
import {
  EnformaErrorBadge,
  EnformaPanel,
  EnformaSectionItems,
  useEnformaTabs,
} from '@encolajs/enforma'

const props = defineProps({ name: { type: String, required: true } })
const { tabs, active, labelOf, panelFor } = useEnformaTabs(() => props.name, () => props)
</script>
```

`<EnformaErrorBadge :count>` shows the count, which screen readers hear as "2 errors", and nothing while there are none. Give it your UI library's badge with `as` (`:as="UBadge" color="error"`).

### Panels of your own

A panel is what hides fields until it is opened: a tab, a collapsible, an accordion's item. When its content is wrapped in an `<EnformaPanel>`, `focusField()` and a refused submit open it before going to a field inside it, the outermost panel first, and it counts the fields inside it that have errors. This works in hand-written forms as in a schema's sections; [Tabs and Collapsibles](/field-forms/tabs-and-collapsibles) in forms with fields walks through it with a live example.

The component drawing the panels makes one for each with `useEnformaPanel({ reveal })`, `reveal` opening it, and reads its `errorCount`: a tab's header sits outside the tab's content, so the component holding both holds the panel.

```vue
<template>
  <Enforma :data="data" :rules="rules">
    <UTabs v-model="tab" :items="items" :unmount-on-hide="false">
      <template #trailing="{ item }">
        <UBadge v-if="panels[item.value].errorCount" color="error" :label="panels[item.value].errorCount" />
      </template>
      <template #content="{ item }">
        <EnformaPanel :panel="panels[item.value]">
          <template v-if="item.value === 'profile'">
            <EnformaField name="name" label="Name" />
          </template>
          <template v-else>
            <EnformaField name="iban" label="IBAN" />
          </template>
        </EnformaPanel>
      </template>
    </UTabs>
  </Enforma>
</template>

<script setup>
import { ref } from 'vue'
import { Enforma, EnformaField, EnformaPanel, useEnformaPanel } from '@encolajs/enforma'

const data = ref({ name: '', iban: '' })
const rules = { name: 'required', iban: 'required' }

const tab = ref('profile')
const items = [
  { label: 'Profile', value: 'profile' },
  { label: 'Billing', value: 'billing' },
]
const panels = {
  profile: useEnformaPanel({ reveal: () => { tab.value = 'profile' } }),
  billing: useEnformaPanel({ reveal: () => { tab.value = 'billing' } }),
}
</script>
```

Keep the panels' content mounted while hidden: a field whose panel unmounts isn't checked (see [Which fields are checked](/core-concepts/validation#which-fields-are-checked)). Give `<EnformaPanel>` the same panel for as long as the panel is drawn.

### Custom Button Components

You can also create custom button components for form actions:

```vue
<!-- MySubmitButton.vue -->
<template>
  <button 
    type="submit"
    :disabled="loading"
    class="my-submit-button"
    @click="handleClick"
  >
    <span v-if="loading" class="loading-indicator">
      <span class="spinner"></span>
    </span>
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  label: { type: String, default: 'Submit' },
})

const emit = defineEmits(['click'])

function handleClick(event) {
  emit('click', event)
}
</script>

<style scoped>
.my-submit-button {
  padding: 0.5rem 1rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-weight: 500;
  cursor: pointer;
}
.my-submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.loading-indicator {
  margin-right: 0.5rem;
}
.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
```

## Rendering a Schema Under Your Own Form Controller

`<Enforma>` makes its own form controller and its own `<form>` element. A component that keeps its own controller (made with `useForm()`, with its own validator) and its own `<form>` calls `provideEnformaForm()` in its `setup()`, then renders `<EnformaSchema>`:

```vue
<script setup>
import { EnformaSchema, provideEnformaForm, useForm } from '@encolajs/enforma'
import { createEncolaValidator } from '@encolajs/enforma/validators/encola'
import MyField from './MyField.vue'

const props = defineProps(['schema', 'values'])
const controller = useForm(props.values, createEncolaValidator({ name: 'required' }))

provideEnformaForm({
  controller,
  schema: () => props.schema,
  // this form's own config, over the global one
  config: { components: { field: MyField }, expressions: { only: ['if'] } },
})
</script>

<template>
  <form v-bind="controller.$formAttrs" novalidate @submit.prevent="controller.submit()">
    <EnformaSchema :schema="schema" />
  </form>
</template>
```

The controller's validator holds the rules: the `rules` in the schema are left to you. Only the fields that are rendered are checked, so a field hidden by its `if` isn't.

`controller.$formAttrs` gives the `<form>` its id (`useForm(values, validator, { id: 'profile' })` sets it, or one is made up) and its ARIA attributes. A submit button outside the `<form>` names the form by that id: `<EnformaSubmitButton :form="controller" />` ([recipe](/recipes/form-in-modal.md#a-form-of-your-own)).

## Accessing Form Configuration in Custom Components

When creating custom components, you'll often need to access the form configuration. Use the `useFormConfig` composable to get configuration values:

```vue
<template>
  <div class="my-custom-component" :class="customClass">
    <!-- Component content -->
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFormConfig } from '@encolajs/enforma/utils/useFormConfig'

const { getConfig } = useFormConfig()

// Get a specific configuration value with a fallback
const customClass = computed(() => 
  getConfig('myCustom.className', 'default-class')
)
</script>
```

## Creating Transformers for Custom Components

Transformers allow you to modify component props before they're passed to the component. This is particularly useful when adapting to specific UI libraries:

```js
// myCustomTransformer.js
export function myCustomFieldTransformer(fieldProps, field, formController, config) {
  // Add your custom logic to transform props
  
  // For example, adjust class names
  fieldProps.wrapperProps = fieldProps.wrapperProps || {}
  fieldProps.wrapperProps.class = `${fieldProps.wrapperProps.class || ''} my-custom-field-class`
  
  // Or modify how input components are mapped
  if (fieldProps.inputComponent === 'date') {
    fieldProps.inputComponent = 'MyCustomDatePicker'
    fieldProps.inputProps = {
      ...fieldProps.inputProps,
      format: 'yyyy-MM-dd'
    }
  }
  
  return fieldProps
}
```

Register your transformer in your configuration:

```js
app.use(EnformaPlugin, {
  transformers: {
    field_props: [myCustomFieldTransformer]
  }
})
```

## Integration with UI Libraries

While presets handle UI library integration, you can create custom components that work with specific UI libraries:

```vue
<!-- TailwindField.vue -->
<template>
  <div class="mb-4">
    <label 
      v-if="props.label" 
      :for="fieldId"
      class="block text-sm font-medium text-gray-700 mb-1"
    >
      {{ props.label }}
      <span v-if="props.required" class="text-red-500">*</span>
    </label>
    
    <component
      :is="props.inputComponent"
      :id="fieldId"
      v-model="fieldController.value"
      v-bind="props.inputProps"
      class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      :class="{ 'border-red-500': fieldController.error }"
    />
    
    <p 
      v-if="fieldController.error"
      class="mt-1 text-sm text-red-600"
    >
      {{ fieldController.error }}
    </p>
  </div>
</template>

<script setup>
import { useEnformaField } from '@encolajs/enforma/core/useEnformaField'
import { computed } from 'vue'

const originalProps = defineProps({
  name: { type: String, required: true },
  // ... other props
})

const { fieldController, props } = useEnformaField(originalProps)
const fieldId = computed(() => `field-${props.name}`)
</script>
```

## Complete Configuration Reference

Here's a complete reference for all components that can be customized in Enforma:

| Component Key | Default Component | Description |
|---------------|-------------------|-------------|
| `field` | `EnformaField` | Renders form fields with labels and validation |
| `section` | `EnformaSection` | Groups related fields together |
| `repeatable` | `EnformaRepeatable` | Creates repeatable field groups |
| `repeatableTable` | `EnformaRepeatableTable` | Displays repeatable fields in a table format |
| `repeatableAddButton` | `EnformaRepeatableAddButton` | Button to add new repeatable items |
| `repeatableRemoveButton` | `EnformaRepeatableRemoveButton` | Button to remove repeatable items |
| `repeatableMoveUpButton` | `EnformaRepeatableMoveUpButton` | Button to move repeatable items up |
| `repeatableMoveDownButton` | `EnformaRepeatableMoveDownButton` | Button to move repeatable items down |
| `submitButton` | `EnformaSubmitButton` | Form submission button |
| `resetButton` | `EnformaResetButton` | Form reset button |
| `schema` | `EnformaSchema` | Renders forms from JSON schema |

## Best Practices

1. **Maintain API Compatibility**: Ensure your custom components accept the same props as the components they're replacing.
2. **Use Composables**: Leverage Enforma's composables like `useEnformaField` to maintain core functionality.
3. **Incremental Customization**: Start with small customizations before replacing entire components.
4. **Test Thoroughly**: Verify your custom components work with all form features including validation, dynamic behavior, and schema generation.
5. **Separate Concerns**: Create separate components for UI presentation and form logic.

## Related Resources

- [Configuration Reference](/core-concepts/configuration.md)
- [Creating Your Own UI Preset](/ui-library-integration/creating-your-own-ui-preset.md)
- [Using Transformers](/extensibility/using-transformers.md)