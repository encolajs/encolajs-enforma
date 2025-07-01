# Schema Builder

A visual schema builder component for creating Enforma form schemas through an intuitive interface. Supports both visual editing and direct JSON editing modes.

## Features

- **Dual Editing Modes**: Switch between visual UI builder and raw JSON editing
- **Real-time Preview**: Use alongside `<Enforma/>` for live form preview
- **90% Use Cases**: Covers common form building scenarios without complexity
- **Copy/Paste Support**: Easy schema import/export via clipboard
- **PrimeVue Integration**: Uses PrimeVue components with Tailwind CSS styling

## Basic Usage

```vue
<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <!-- Schema Builder -->
    <div>
      <h2>Schema Builder</h2>
      <SchemaBuilder 
        v-model="schema" 
        :preview-data="sampleData"
        @update:modelValue="onSchemaUpdate"
      />
    </div>
    
    <!-- Live Form Preview -->
    <div>
      <h2>Form Preview</h2>
      <Enforma 
        :schema="schema" 
        :data="formData" 
        @update:data="formData = $event"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { SchemaBuilder, Enforma } from '@encolajs/enforma'

const schema = ref({})
const formData = ref({})
const sampleData = ref({ name: 'John Doe', email: 'john@example.com' })

const onSchemaUpdate = (newSchema) => {
  console.log('Schema updated:', newSchema)
}
</script>
```

## Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `FormSchema` | `{}` | Current schema (v-model) |
| `mode` | `'visual' \| 'json'` | `'visual'` | Edit mode |
| `previewData` | `Record<string, any>` | `{}` | Sample data for form preview |
| `availableComponents` | `string[]` | Built-in | Available input components |

## Supported Schema Types

### Field Schema (90% Use Cases)
- **name**: Field identifier (auto-generated, non-editable)
- **label**: Display label
- **inputComponent**: Input type (`input`, `textarea`, `select`, `checkbox`, etc.)
- **required**: Boolean flag for required fields
- **help**: Help text
- **section**: Parent section reference
- **inputProps**: Simple key-value properties
  - For `input`: `placeholder`, `maxlength`
  - For `textarea`: `placeholder`, `rows`
  - For `select`: `options` array

### Section Schema
- **title**: Section title (required)
- **titleComponent**: HTML tag (`h2`, `h3`, `h4`, `div`)

### Repeatable Schema
- **min/max**: Item count limits
- **allowAdd/allowRemove**: Permission flags
- **subfields**: Simplified field definitions (name, label, inputComponent only)

## Available Input Components

- Text Input (`input`)
- Textarea (`textarea`)
- Select Dropdown (`select`)
- Checkbox (`checkbox`)
- Radio Button (`radio`)
- Number Input (`number`)
- Date Input (`date`)
- Email Input (`email`)
- Password Input (`password`)

## JSON Mode

Switch to JSON mode for:
- Direct schema editing
- Copy/paste from other projects
- Advanced configurations not supported in visual mode
- Bulk editing operations

Features:
- Syntax validation with error messages
- Format/prettify functionality
- Import from clipboard
- Export to clipboard

## Composable Usage

For custom implementations, use the `useSchemaBuilder` composable:

```ts
import { useSchemaBuilder } from '@encolajs/enforma'

const {
  state,
  setMode,
  addField,
  addSection,
  addRepeatable,
  exportToClipboard,
  importFromClipboard
} = useSchemaBuilder({
  initialSchema: {},
  initialMode: 'visual'
})
```

## Limitations (By Design)

The SchemaBuilder focuses on 90% use cases and excludes advanced features:

- No custom validation rules editor
- No conditional rendering (`if` conditions)
- No advanced `labelProps` or styling configuration
- No custom component registration
- No form context or advanced configuration

For these advanced features, use JSON mode or edit schemas manually.

## Demo

See `SchemaBuilderDemo.vue` for a complete working example with side-by-side schema builder and form preview.