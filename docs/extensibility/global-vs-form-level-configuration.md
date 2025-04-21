# Global vs Form-level Configuration

Enforma provides a flexible configuration system that allows you to define settings at both global and form-specific levels. This guide explains the differences between these configuration levels and how they interact.

## Configuration Hierarchy

Enforma's configuration system follows a cascade pattern, where more specific configurations override more general ones:

1. **Global Configuration**: Applied to all forms in your application
2. **Form-Level Configuration**: Applied to a specific form instance
3. **Field-Level Configuration**: Applied to individual fields

The more specific the configuration, the higher its priority.

## Global Configuration

Global configuration is set when creating a FormKit instance and applies to all forms in your application. It's ideal for setting application-wide defaults.

### Setting Global Configuration

```js
// main.js
import { createApp } from 'vue';
import { createEnforma } from 'encolajs-formkit';
import App from './App.vue';

// Create a FormKit instance with global configuration
const formkit = createEnforma({
  config: {
    validateOn: ['blur', 'submit'],
    
    components: {
      // Default component mappings
      text: MyTextInput,
      email: MyEmailInput
    },
    
    // Default field styling
    fieldDefaults: {
      class: 'app-form-field',
      labelClass: 'app-field-label',
      errorClass: 'app-field-error'
    },
    
    // Global validation options
    validation: {
      debounce: 300,
      immediateMessages: false
    }
  }
});

const app = createApp(App);
app.use(formkit);
app.mount('#app');
```

### Global Configuration Options

Key options available for global configuration:

| Option | Type | Description |
|--------|------|-------------|
| `validateOn` | `Array` | When validation should trigger |
| `components` | `Object` | Component mappings for field types |
| `componentProps` | `Object` | Default props for components |
| `validators` | `Object` | Global validator definitions |
| `fieldDefaults` | `Object` | Default props for all fields |
| `preset` | `Object` | UI library preset |
| `i18n` | `Object` | Internationalization settings |
| `debug` | `Boolean` | Enable debug mode |

## Form-Level Configuration

Form-level configuration applies only to a specific form instance. It overrides global configuration for that form.

### Setting Form-Level Configuration

```vue
<template>
  <Enforma 
    v-model="formData" 
    :config="formConfig"
    @submit="onSubmit"
  >
    <!-- Form fields -->
  </Enforma>
</template>

<script setup>
import { ref } from 'vue';
import { Enforma } from 'encolajs-formkit';

const formData = ref({
  // Form data
});

const formConfig = {
  // Form-specific configuration
  validateOn: ['submit'],
  
  // Form-specific component overrides
  components: {
    text: CustomTextInput
  },
  
  // Field defaults for this form
  fieldDefaults: {
    class: 'custom-form-field'
  }
};
</script>
```

### Form-Level Configuration Options

Form-level configuration accepts the same options as global configuration, but applied only to the specific form.

## Field-Level Configuration

Field-level configuration is the most specific and has the highest priority. It applies to individual field instances.

### Setting Field-Level Configuration

```vue
<template>
  <Enforma v-model="formData">
    <!-- Field with specific configuration -->
    <EnformaField 
      name="username" 
      label="Username" 
      :validateOn="['blur']" 
      class="username-field" 
    />
  </Enforma>
</template>
```

## Configuration Merging Rules

When multiple levels of configuration exist, they're merged according to these rules:

1. Start with global configuration
2. Merge form-level configuration, overriding any conflicting properties
3. Apply field-level props, which override both global and form-level settings

For objects like `components` or `componentProps`, the merge is shallow by default:

```js
// Global config
const globalConfig = {
  components: {
    text: DefaultTextInput,
    email: DefaultEmailInput
  }
};

// Form config
const formConfig = {
  components: {
    text: CustomTextInput
    // email not specified, so it uses the global one
  }
};

// Resulting config
const mergedConfig = {
  components: {
    text: CustomTextInput,    // From form config
    email: DefaultEmailInput  // From global config
  }
};
```

## Common Use Cases

### Application-wide Styling

Use global configuration for consistent styling:

```js
const formkit = createEnforma({
  config: {
    fieldDefaults: {
      class: 'app-form-field',
      labelClass: 'app-form-label',
      errorClass: 'app-form-error'
    }
  }
});
```

### Specific Form Behavior

Override validation behavior for a specific form:

```js
const loginFormConfig = {
  validateOn: ['submit'], // Only validate on submission
  immediateMessages: false // Don't show messages until submit
};
```

### Custom Component for a Field Type

Override a component for all instances of a field type in a form:

```js
const signupFormConfig = {
  components: {
    password: EnhancedPasswordInput // With strength meter
  }
};
```

## Best Practices

### Global Configuration

- Use global configuration for application-wide defaults
- Define consistent styling and behavior patterns
- Set up shared validators
- Configure default component mappings
- Set reasonable validation triggers

### Form-Level Configuration

- Override global settings for specific form requirements
- Customize validation behavior based on form context
- Provide form-specific component overrides
- Set proper labels and error message formatting

### Field-Level Settings

- Use field-level props for unique field requirements
- Override validation rules for specific fields
- Customize individual field appearance
- Set field-specific error messages

## Advanced Configuration

### Dynamic Configuration

Generate configuration dynamically based on application state:

```js
function createFormConfig(userRole) {
  return {
    fieldDefaults: {
      readonly: userRole === 'viewer'
    },
    validateOn: userRole === 'admin' ? ['input', 'blur'] : ['submit']
  };
}

// In component
const formConfig = computed(() => createFormConfig(userStore.role));
```

### Configuration Composition

Compose configurations from reusable pieces:

```js
const baseConfig = {
  validateOn: ['blur', 'submit'],
  fieldDefaults: { class: 'form-field' }
};

const readonlyConfig = {
  fieldDefaults: { readonly: true }
};

const adminConfig = {
  validateOn: ['input', 'blur']
};

// Merge configurations based on conditions
const formConfig = {
  ...baseConfig,
  ...(isReadonly.value ? readonlyConfig : {}),
  ...(isAdmin.value ? adminConfig : {})
};
```

By understanding and leveraging the configuration hierarchy, you can create forms that are both consistent at a global level and appropriately customized for specific contexts.