# EnformaField

`EnformaField` is the core component for rendering individual form fields. It handles state management, validation, and UI rendering for a single form input.

## Basic Usage

```vue
<template>
  <Enforma v-model="formData" @submit="onSubmit">
    <EnformaField name="firstName" label="First Name" />
    <EnformaField name="email" type="email" label="Email Address" />
    <EnformaField 
      name="message" 
      type="textarea" 
      label="Your Message" 
      placeholder="Enter your message here..."
    />
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
import { ref } from 'vue';
import { Enforma, EnformaField, EnformaSubmitButton } from 'encolajs-formkit';

const formData = ref({
  firstName: '',
  email: '',
  message: ''
});

function onSubmit(data) {
  console.log('Form submitted:', data);
}
</script>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `name` | `String` | The field name (required) |
| `type` | `String` | Field type (text, email, password, number, etc.) |
| `label` | `String` | Field label |
| `placeholder` | `String` | Input placeholder text |
| `helpText` | `String` | Help text to display below the field |
| `validators` | `Array\|String` | Validation rules |
| `validateOn` | `Array` | When to trigger validation (overrides form setting) |
| `if` | `Boolean\|Function\|String` | Conditional display expression |
| `disabled` | `Boolean` | Whether the field is disabled |
| `required` | `Boolean` | Whether the field is required |
| `options` | `Array` | Options for select, radio, and checkbox fields |
| `component` | `String\|Object` | Override the default component for this field type |

## Field Types

`EnformaField` supports various field types through the `type` prop:

```vue
<template>
  <Enforma v-model="formData">
    <EnformaField name="text" type="text" label="Text Input" />
    <EnformaField name="email" type="email" label="Email Input" />
    <EnformaField name="password" type="password" label="Password Input" />
    <EnformaField name="number" type="number" label="Number Input" />
    <EnformaField name="textarea" type="textarea" label="Textarea" />
    <EnformaField name="checkbox" type="checkbox" label="Checkbox" />
    <EnformaField name="switch" type="switch" label="Switch" />
    <EnformaField name="radio" type="radio" label="Radio Buttons" 
                 :options="['Option 1', 'Option 2', 'Option 3']" />
    <EnformaField name="select" type="select" label="Select Dropdown" 
                 :options="selectOptions" />
    <EnformaField name="multiselect" type="multiselect" label="Multi-Select" 
                 :options="selectOptions" />
    <EnformaField name="date" type="date" label="Date Picker" />
    <EnformaField name="time" type="time" label="Time Picker" />
    <EnformaField name="file" type="file" label="File Upload" />
    <EnformaField name="color" type="color" label="Color Picker" />
    <EnformaField name="range" type="range" label="Range Slider" />
  </Enforma>
</template>

<script setup>
const selectOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' }
];
</script>
```

## Validation

Add validation rules with the `validators` prop:

```vue
<template>
  <Enforma v-model="formData">
    <!-- String-based validators with pipe separator -->
    <EnformaField 
      name="username" 
      label="Username" 
      validators="required|min:3|max:20" 
    />
    
    <!-- Array of validators -->
    <EnformaField 
      name="email" 
      type="email" 
      label="Email" 
      :validators="['required', 'email']" 
    />
    
    <!-- Complex validators with options -->
    <EnformaField 
      name="password" 
      type="password" 
      label="Password" 
      :validators="passwordValidators" 
    />
  </Enforma>
</template>

<script setup>
const passwordValidators = [
  'required',
  { name: 'min', params: [8] },
  { 
    name: 'pattern', 
    params: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/], 
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
  }
];
</script>
```

## Dynamic Field Properties

Field properties can be dynamic based on form state:

```vue
<template>
  <Enforma v-model="formData">
    <EnformaField 
      name="accountType" 
      type="select" 
      label="Account Type" 
      :options="['Personal', 'Business']" 
    />
    
    <!-- This field is only shown for business accounts -->
    <EnformaField 
      name="companyName" 
      label="Company Name" 
      :if="$form.accountType === 'Business'" 
      validators="required" 
    />
    
    <!-- Required only for business accounts -->
    <EnformaField 
      name="vatNumber" 
      label="VAT Number" 
      :required="$form.accountType === 'Business'" 
    />
  </Enforma>
</template>
```

## Select Field Options

Options for select, radio, and checkbox fields can be specified in several formats:

```vue
<template>
  <Enforma v-model="formData">
    <!-- Simple array of strings -->
    <EnformaField 
      name="color" 
      type="select" 
      label="Color" 
      :options="['Red', 'Green', 'Blue']" 
    />
    
    <!-- Array of value/label objects -->
    <EnformaField 
      name="country" 
      type="select" 
      label="Country" 
      :options="[
        { value: 'us', label: 'United States' },
        { value: 'ca', label: 'Canada' },
        { value: 'mx', label: 'Mexico' }
      ]" 
    />
    
    <!-- Option groups (for select) -->
    <EnformaField 
      name="vehicle" 
      type="select" 
      label="Vehicle" 
      :options="[
        { 
          label: 'Cars', 
          options: [
            { value: 'sedan', label: 'Sedan' },
            { value: 'suv', label: 'SUV' }
          ]
        },
        { 
          label: 'Motorcycles', 
          options: [
            { value: 'sport', label: 'Sport' },
            { value: 'cruiser', label: 'Cruiser' }
          ]
        }
      ]" 
    />
    
    <!-- Dynamic options from a function -->
    <EnformaField 
      name="state" 
      type="select" 
      label="State" 
      :options="getStateOptions" 
    />
  </Enforma>
</template>

<script setup>
function getStateOptions($form) {
  // Return different options based on the selected country
  if ($form.country === 'us') {
    return ['California', 'Texas', 'New York'];
  } else if ($form.country === 'ca') {
    return ['Ontario', 'Quebec', 'British Columbia'];
  }
  return [];
}
</script>
```

## Custom Field Components

Override the default component for a field type:

```vue
<template>
  <Enforma v-model="formData">
    <!-- Use a custom component -->
    <EnformaField 
      name="tags" 
      label="Tags" 
      :component="TagsInput" 
    />
  </Enforma>
</template>

<script setup>
import TagsInput from '@/components/TagsInput.vue';
</script>
```

## Slots

Customize field rendering with slots:

```vue
<template>
  <Enforma v-model="formData">
    <EnformaField name="email" label="Email">
      <!-- Custom prefix inside the input -->
      <template #prefix>
        <i class="email-icon"></i>
      </template>
      
      <!-- Custom suffix inside the input -->
      <template #suffix>
        <button @click="autofillEmail">Autofill</button>
      </template>
      
      <!-- Custom help text -->
      <template #help>
        <div class="custom-help">
          We'll never share your email with anyone else.
        </div>
      </template>
    </EnformaField>
  </Enforma>
</template>
```

## Best Practices

- Always include a descriptive `label` for accessibility
- Use appropriate field `type` for semantic correctness
- Add `helpText` to provide additional context when needed
- Use conditional `if` properties instead of v-if for proper form state handling
- Set appropriate validation rules to ensure data quality
- For complex field interactions, consider creating custom field components