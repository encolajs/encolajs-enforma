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

### Inside Custom Components

Usually you will need to access the configuration if you're building custom components or if you add custom configuration to your application.

Here's an example of accessing the form's config for a a custom input component

```vue {5,13}
<template>
  <!-- assuming you are using tailwind options already configured -->
  <input
   
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

## Configuration Reference

Below are detailed tables for all the configuration options available in Enforma. These options can be set at both the global and form-specific levels.

### Pass-Through Configuration (`pt`)

The pass-through configuration allows you to customize the props passed to various components.

| Option | Type | Description |
|--------|------|-------------|
| `wrapper` | `ComponentProps` | Props for the field wrapper component |
| `wrapper__invalid` | `ComponentProps` | Props added to the wrapper when the field is invalid |
| `wrapper__required` | `ComponentProps` | Props added to the wrapper when the field is required |
| `label` | `ComponentProps` | Props for the label element |
| `required` | `ComponentProps` | Props for the required indicator component |
| `input` | `ComponentProps` | Props for the input element |
| `error` | `ComponentProps` | Props for the error message element |
| `help` | `ComponentProps` | Props for the help/instructions element |
| `section` | `ComponentProps` | Props for section components |
| `schema` | `ComponentProps` | Props for schema components |
| `submit` | `ComponentProps` | Props for submit button components |
| `reset` | `ComponentProps` | Props for reset button components |
| `repeatable` | `Object` | Configuration for repeatable components |
| `repeatable_table` | `Object` | Configuration for repeatable table components |

#### PT for Repeatable Components

| Option | Type | Description |
|--------|------|-------------|
| `wrapper` | `ComponentProps` | Props for the repeatable wrapper |
| `items` | `ComponentProps` | Props for the repeatable items container |
| `add` | `ComponentProps` | Props for the add button |
| `remove` | `ComponentProps` | Props for the remove button |
| `moveUp` | `ComponentProps` | Props for the move up button |
| `moveDown` | `ComponentProps` | Props for the move down button |
| `actions` | `ComponentProps` | Props for the actions container |
| `itemActions` | `ComponentProps` | Props for the item actions container |

#### PT for RepeatableTable Components

| Option | Type | Description |
|--------|------|-------------|
| `wrapper` | `ComponentProps` | Props for the table wrapper (inherits from repeatable) |
| `table` | `ComponentProps` | Props for the table element |
| `th` | `ComponentProps` | Props for table header cells |
| `td` | `ComponentProps` | Props for table data cells |
| `actionsTd` | `ComponentProps` | Props for the actions column |
| `actions` | `ComponentProps` | Props for the actions container (inherits from repeatable) |
| `itemActions` | `ComponentProps` | Props for the item actions container (inherits from repeatable) |
| `add` | `ComponentProps` | Props for the add button (inherits from repeatable) |
| `remove` | `ComponentProps` | Props for the remove button (inherits from repeatable) |
| `moveUp` | `ComponentProps` | Props for the move up button (inherits from repeatable) |
| `moveDown` | `ComponentProps` | Props for the move down button (inherits from repeatable) |

### Behavior Configuration (`behavior`)

Controls how the form behaves during validation and interaction.

| Option | Type | Description                                                                                                                                                                                                                            |
|--------|------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `validateOn` | `'input' \| 'change' \| 'blur' \| 'submit'` | When to trigger validation                                                                                                                                                                                                             |
| `cloneFn` | `(data: any) => any` | Custom function to clone initial form data for resetting the form. If the default implementation is not behaving as expected, you can try to use [lodash's deepCopy](https://lodash.com/docs/4.17.15#cloneDeep) or implement your own. |

### Expressions Configuration (`expressions`)

Controls how expressions are evaluated in the form.

| Option | Type | Description |
|--------|------|-------------|
| `delimiters.start` | `string` | Start delimiter for expressions (default: `${`) |
| `delimiters.end` | `string` | End delimiter for expressions (default: `}`) |

### Components Configuration (`components`)

Defines which components to use for rendering different parts of the form.

| Option | Type | Description |
|--------|------|-------------|
| `field` | `Component` | Component for rendering form fields (default: `<EnormaField/>`) |
| `section` | `Component` | Component for rendering form sections (default: `<EnormaSection/>`) |
| `repeatable` | `Component` | Component for rendering repeatable fields (default: `<EnormaRepeatable/>`) |
| `repeatableTable` | `Component` | Component for rendering repeatable tables (default: `<EnormaRepeatableTable/>`) |
| `repeatableAddButton` | `Component` | Component for the add button in repeatable fields (default: `<EnormaRepeatableAddButton/>`) |
| `repeatableRemoveButton` | `Component` | Component for the remove button in repeatable fields (default: `<EnormaRepeatableRemoveButton/>`) |
| `repeatableMoveUpButton` | `Component` | Component for the move up button in repeatable fields (default: `<EnormaRepeatableMoveUpButton/>`) |
| `repeatableMoveDownButton` | `Component` | Component for the move down button in repeatable fields (default: `<EnormaRepeatableMoveDownButton/>`) |
| `submitButton` | `Component` | Component for the form submit button (default: `<EnormaSubmittButton/>`) |
| `resetButton` | `Component` | Component for the form reset button (default: `<EnormaResetButton/>`) |
| `schema` | `Component` | Component for rendering schema-based forms  (default: `<EnormaSchema/>`) |

### Validation Configuration

| Option | Type | Description |
|--------|------|-------------|
| `rules` | `Record<string, Function>` | Custom validation rules |
| `messages` | `Record<string, string>` | Custom validation messages |
| `errorMessageFormatter` | `messageFormatter` | Function to format error messages |

### Transformers Configuration

Functions that transform form and field properties.

| Option | Type | Description |
|--------|------|-------------|
| `transformers.form_props` | `Function[]` | Transformers for form properties (schema, context, config) |
| `transformers.field_props` | `Function[]` | Transformers for field properties |
| `transformers.repeatable_props` | `Function[]` | Transformers for repeatable field properties |
| `transformers.repeatable_table_props` | `Function[]` | Transformers for repeatable table properties |
| `transformers.section_props` | `Function[]` | Transformers for section properties |
| `[key: string]` | `Function[]` | Other custom transformers |

## Button Configuration

As of the latest version, Enforma includes enhanced button customization capabilities that eliminate the need for custom button component files in most cases. All button components support dynamic configuration through props and pass-through configuration.

### Button Props

All button components (`EnformaSubmitButton`, `EnformaResetButton`, and repeatable buttons) accept these standard props:

| Prop | Type | Description |
|------|------|-------------|
| `content` | `string` | Button text or HTML content (supports translation keys) |
| `loadingContent` | `string` | Content to show when loading (submit button only) |
| `as` | `string \| Component` | Component to render as (overrides configuration) |

### Pass-Through Button Configuration

You can configure button appearance and behavior through the pass-through configuration system:

```js
// Global configuration
const config = {
  pt: {
    submit: {
      as: MyButton,           // Component to use
      content: 'Save Changes', // Button text
      loadingContent: 'Saving...', // Loading text
      class: 'btn btn-primary',
      disabled: false
    },
    reset: {
      as: MyButton,
      content: 'Clear Form',
      class: 'btn btn-secondary'
    },
    repeatable: {
      add: {
        as: MyButton,
        content: '<i class="icon-plus"></i> Add Item',
        class: 'btn btn-success'
      },
      remove: {
        as: MyButton, 
        content: '×',
        class: 'btn btn-danger'
      },
      moveUp: {
        as: MyButton,
        content: '↑',
        class: 'btn btn-info'
      },
      moveDown: {
        as: MyButton,
        content: '↓', 
        class: 'btn btn-info'
      }
    }
  }
}
```

## Required Field Indicator Configuration

The required field indicator (*) is a dedicated component that can be customized through configuration.

Read more on the [required indicator](/field-forms/enforma-required-indicator_api.md)

## HTML Content Support

Error and help messages can be rendered as HTML content when enabled through configuration.

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pt.error.renderAsHtml` | `boolean` | `false` | Render error messages as HTML |
| `pt.help.renderAsHtml` | `boolean` | `false` | Render help text as HTML |

### Usage Examples

#### Global HTML Support

Enable HTML rendering globally for all forms:

```js
const config = {
  pt: {
    error: {
      renderAsHtml: true
    },
    help: {
      renderAsHtml: true
    }
  }
}
```

#### Form-Level HTML Support

Enable HTML rendering for specific forms:

```vue
<template>
  <Enforma 
    :data="formData" 
    :config="formConfig"
  >
    <EnformaField 
      name="email" 
      label="Email" 
      help="Enter a <strong>valid</strong> email address"
    />
  </Enforma>
</template>

<script setup>
const formConfig = {
  pt: {
    help: {
      renderAsHtml: true
    },
    error: {
      renderAsHtml: true
    }
  }
}
</script>
```

#### HTML Error Messages

With HTML rendering enabled, validation errors can include HTML:

```js
// Custom error messages with HTML
const validationMessages = {
  'required': 'This field is <strong>required</strong>',
  'email': 'Please enter a <em>valid</em> email address',
  'min': 'Value must be at least <code>{min}</code>'
}
```

#### HTML Help Text

Help text can include formatting, links, and other HTML elements:

```vue
<EnformaField 
  name="password" 
  label="Password"
  help='Password must contain:
    <ul>
      <li>At least 8 characters</li>
      <li>One <strong>uppercase</strong> letter</li>
      <li>One <strong>lowercase</strong> letter</li>
      <li>One number</li>
    </ul>'
/>
```


> [!WARNING] ⚠️ HTML rendering uses `v-html` which can be vulnerable to XSS attacks. 