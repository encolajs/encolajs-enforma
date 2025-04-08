## Core Concepts

The Vue Form Kit is designed as a flexible, powerful form creation library with the following key features:

1. **Dual-Mode Operation**: Support for both schema-based and template-based form creation
2. **Separation of Logic and UI**: Headless components providing core functionality without UI opinions
3. **Field Transformers**: A pipeline approach for adapting abstract field definitions to concrete UI components
4. **Dynamic Expressions**: Support for conditional visibility and dynamic properties based on form state
5. **Configuration System**: Multi-level configuration for customizing default behavior and appearance
6. **Context Integration**: Support for external context data and functions accessible in expressions
7. **Validation Integration**: Deep integration with the @encolajs/validator library

## Architecture Layers

The architecture is organized into distinct layers:

### 1. Headless Components Layer

These components provide core functionality without UI opinions:

- **HeadlessForm**: Handles form state, validation, and submission
- **HeadlessField**: Manages field state, value changes, and validation
- **HeadlessRepeatable**: Provides array field functionality (add, remove, reorder)

These can be used directly by developers who want full control over the UI, or serve as the foundation for higher-level components.

### 2. Core Components Layer

Built on top of the headless layer, these components provide a more convenient API:

- **FormKit**: Main entry point with slot-based layout system
- **FormKitSection**: Section-based field renderer
- **FormKitField**: Common wrapper for field components

### 3. Field Registry & Transformers

A system for mapping abstract field types to concrete UI components:

- **Field Registry**: Maps field types to component implementations
- **Transformer Pipeline**: Processes field definitions to adapt them for specific UI libraries

### 4. Configuration System

A multi-level configuration approach:

- **Default Configuration**: Base settings for all forms
- **Global Configuration**: Library-level settings
- **Form Configuration**: Per-form customization
- **Field Configuration**: Field-specific overrides

## Form Schemas

The form schema components receives the following props:

```javascript
{
  // Fields with their definitions
  props: {
    // Field definitions...
  },
  
  // Separate validation rules
  rules: {
    // Validation rules using @encolajs/validator format
  },
  
  // Custom validation messages
  messages: {
    // Custom error messages
  }
}
```

Field definitions focus on UI and behavior, not validation rules:

```javascript
{
  type: 'text',                     // Abstract field type
  section: 'personal_info',         // Section assignment
  if: "form.userType === 'business'", // Conditional visibility
  props: { /* ... */ },             // Props for entire field component
  label_props: { /* ... */ },       // Props for label component
  input_props: { /* ... */ },       // Props for input component
  help_props: { /* ... */ },        // Props for help text component
  error_props: { /* ... */ }        // Props for error component
}
```

## Dynamic Expressions

Two types of expressions are supported:

1. **Conditional Expressions**: Used in `if` properties to determine visibility
   ```javascript
   if: "form.country === 'US' && form.userType !== 'guest'"
   ```

2. **Property Expressions**: Used within props to compute values dynamically
   ```javascript
   disabled: "${form.is_readonly || form.userType === 'guest'}"
   ```

Expressions can access:
- **form**: The current form values
- **context**: External data and functions provided to the form
- **errors**: Current validation errors

## Section-Based Rendering

Forms can be organized into sections for structured layouts:

```vue
<FormKit>
  <template #default="{ form }">
    <div class="personal-section">
      <h2>Personal Information</h2>
      <FormKitFields section="personal" />
    </div>
    
    <div class="address-section" v-if="form.has_address">
      <h2>Address Information</h2>
      <FormKitFields section="address" />
    </div>
  </template>
</FormKit>
```

This approach gives full control over form layout while maintaining the convenience of schema-based field definitions.

## Repeatable Fields

Repeatable fields allow for array-like data structures:

```javascript
{
  items: {
    type: 'repeatable_table',
    is_repeatable: true,
    subfields: {
      // Subfield definitions...
    },
    min_items: 1,
    max_items: 10
  }
}
```

The existing HeadlessRepeatable component and useRepeatable composable provide the foundation for this functionality.

## Custom Field Components

The architecture supports specialized field components for complex scenarios, such as the CountryDependentState example that changes between dropdown and text input based on country selection.

Custom components can leverage the form context, dynamic expressions, and other form kit features while encapsulating their specialized logic.

## Template-Based Usage

For developers who prefer direct template control, the library supports a template-based approach:

```vue
<FormKit>
  <template #default="{ Field, form, submit }">
    <Field
      name="firstName"
      type="text"
      label="First Name"
      :input-props="{ /* ... */ }"
    />
    
    <Field
      name="email"
      type="email"
      label="Email"
      :input-props="{ /* ... */ }"
    />
    
    <button @click="submit">Submit</button>
  </template>
</FormKit>
```

This mode still leverages the form state management and validation system but gives direct control over the form structure.

## Preset System

The library includes a preset system for UI framework integration, with PrimeVue as the first supported framework:

```javascript
import { createPrimeVuePreset } from '@your-org/vue-form-kit/presets/primevue';

const primeVuePreset = createPrimeVuePreset();
```

Presets provide:
- Field type mappings
- Component implementations
- Default styling
- Framework-specific configuration

## Configuration Options

The configuration system supports customization at multiple levels:

```javascript
// Default configuration (built into the library)
const defaultConfig = {
  components: { /* ... */ },
  defaultProps: { /* ... */ },
  validation: { /* ... */ },
  expressions: { /* ... */ }
};

// User configuration
const userConfig = {
  defaultProps: {
    error: {
      class: 'custom-error-class'
    }
  }
};
```

Configuration is merged intelligently, allowing for targeted overrides while maintaining sensible defaults.

## Context Integration

External context can be provided to forms:

```vue
<FormKit :context="myContext">
  <!-- Form content -->
</FormKit>
```

Where context might contain:

```javascript
const myContext = {
  // Data
  userPermissions: ['read', 'write'],
  maxFileSize: 5242880,
  
  // Functions
  formatDate(date) { /* ... */ },
  canEdit(resourceType) { /* ... */ }
};
```

This context is accessible in expressions using `context.property` syntax.

## Complex Field Scenarios

The architecture supports complex field scenarios like:

1. **Dependent Fields**: Fields that depend on the values of other fields, such as the country/state example
2. **Dynamic Field Types**: Fields that change their type based on conditions
3. **Computed Properties**: Field properties that are calculated based on form state
4. **Conditional Validation**: Validation rules that apply only under certain conditions

These scenarios can be handled through a combination of expressions, transformers, and custom components as appropriate.

## Implementation Approach

The recommended implementation approach is:

1. **Start with the headless layer**: Ensure the core functionality works
2. **Build the core components**: Implement the slot-based system
3. **Add expression evaluation**: Implement the dynamic expression system
4. **Integrate configuration**: Add the multi-level configuration system
5. **Create the PrimeVue preset**: Build the first UI integration
6. **Add advanced features**: Implement repeatable fields, context integration, etc.
7. **Create documentation**: Provide comprehensive usage examples

This approach ensures a solid foundation while progressively adding more advanced features.

## Key Design Decisions

1. **Headless First**: The headless components provide a solid foundation that can be used independently of the higher-level components.

2. **Slot-Based Layout**: Using slots for layout provides maximum flexibility while maintaining a clean separation between data and presentation.

3. **Transformer Pipelines**: The transformer approach allows for clean adaptation of abstract field definitions to concrete UI components.

4. **Separate Validation Rules**: Keeping validation rules separate from field definitions creates a cleaner separation of concerns.

5. **Context Object**: Supporting an external context object allows forms to integrate with application state beyond the form values themselves.

6. **Dual-Mode API**: Supporting both schema-based and template-based approaches maximizes flexibility for different development styles.

This architecture creates a form library that is both powerful and flexible, suitable for a wide range of applications while maintaining a clean, intuitive API.