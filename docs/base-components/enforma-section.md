# EnformaSection

`EnformaSection` helps you organize form fields into logical groups or sections. It provides visual separation, optional collapsibility, and conditional display for sections of your form.

## Basic Usage

```vue
<template>
  <Enforma :data="formData" :submitHandler="submit">
    <EnformaSection title="Personal Information">
      <EnformaField name="firstName" label="First Name" />
      <EnformaField name="lastName" label="Last Name" />
      <EnformaField name="birthDate" type="date" label="Date of Birth" />
    </EnformaSection>
    
    <EnformaSection title="Contact Information">
      <EnformaField name="email" type="email" label="Email Address" />
      <EnformaField name="phone" label="Phone Number" />
      <EnformaField name="preferredContact" type="radio" 
                   label="Preferred Contact Method"
                   :options="['Email', 'Phone']" />
    </EnformaSection>
    
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
import { ref } from 'vue';
import { Enforma, EnformaSection, EnformaField, EnformaSubmitButton } from 'encolajs-formkit';

const formData = ref({
  firstName: '',
  lastName: '',
  birthDate: '',
  email: '',
  phone: '',
  preferredContact: ''
});

function submit(data) {
  console.log('Form submitted:', data);
}
</script>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | `String` | Section title |
| `subtitle` | `String` | Optional section subtitle |
| `collapsible` | `Boolean` | Whether the section can be collapsed |
| `collapsed` | `Boolean` | Initial collapsed state (if collapsible) |
| `if` | `Boolean\|Function\|String` | Conditional display expression |
| `name` | `String` | Optional identifier for the section |
| `helpText` | `String` | Help text displayed below the title |
| `titleTag` | `String` | HTML tag for the title (default: 'h3') |
| `sectionClass` | `String` | CSS class for the section container |
| `titleClass` | `String` | CSS class for the title element |
| `contentClass` | `String` | CSS class for the section content |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | None | The main content of the section |
| `title` | `{ title }` | Custom title rendering |
| `subtitle` | `{ subtitle }` | Custom subtitle rendering |
| `help` | `{ helpText }` | Custom help text rendering |
| `actions` | None | Additional actions in the header |
| `indicator` | `{ collapsed }` | Custom collapse indicator |

## Collapsible Sections

Make sections collapsible to save space in long forms:

```vue
<template>
  <Enforma :data="formData">
    <EnformaSection 
      title="Basic Information" 
      collapsible
    >
      <!-- Basic fields -->
    </EnformaSection>
    
    <EnformaSection 
      title="Advanced Settings" 
      collapsible 
      collapsed
      help-text="These settings are optional"
    >
      <!-- Advanced fields -->
    </EnformaSection>
  </Enforma>
</template>
```

## Conditional Sections

Show sections conditionally based on form state:

```vue
<template>
  <Enforma :data="formData">
    <EnformaField 
      name="needsShipping" 
      type="checkbox" 
      label="This order requires shipping" 
    />
    
    <EnformaSection 
      title="Shipping Information" 
      :if="$form.needsShipping"
    >
      <EnformaField name="shippingAddress.street" label="Street" />
      <EnformaField name="shippingAddress.city" label="City" />
      <EnformaField name="shippingAddress.zipCode" label="ZIP Code" />
      <EnformaField name="shippingAddress.country" label="Country" />
    </EnformaSection>
  </Enforma>
</template>
```

## Custom Section Titles

Use slots for custom title rendering:

```vue
<template>
  <Enforma :data="formData">
    <EnformaSection>
      <template #title>
        <div class="custom-title">
          <i class="user-icon"></i>
          <span>User Information</span>
          <span class="badge">Required</span>
        </div>
      </template>
      
      <!-- Fields -->
    </EnformaSection>
  </Enforma>
</template>
```

## Section Actions

Add action buttons to section headers:

```vue
<template>
  <Enforma :data="formData">
    <EnformaSection title="Payment Methods">
      <template #actions>
        <button 
          type="button" 
          class="add-payment" 
          @click="addNewPaymentMethod"
        >
          Add Method
        </button>
      </template>
      
      <!-- Payment method fields -->
    </EnformaSection>
  </Enforma>
</template>

<script setup>
function addNewPaymentMethod() {
  // Logic to add a new payment method
}
</script>
```

## Nested Sections

Sections can be nested for complex forms:

```vue
<template>
  <Enforma :data="formData">
    <EnformaSection title="User Profile">
      <EnformaField name="name" label="Full Name" />
      <EnformaField name="email" type="email" label="Email" />
      
      <EnformaSection 
        title="Preferences" 
        collapsible 
        collapsed
      >
        <EnformaField name="preferences.theme" label="Theme" />
        <EnformaField name="preferences.notifications" type="checkbox" 
                     label="Enable Notifications" />
        
        <EnformaSection 
          title="Email Preferences" 
          :if="$form.preferences?.notifications"
        >
          <EnformaField name="preferences.emailDaily" type="checkbox"
                       label="Daily Summary" />
          <EnformaField name="preferences.emailWeekly" type="checkbox"
                       label="Weekly Newsletter" />
        </EnformaSection>
      </EnformaSection>
    </EnformaSection>
  </Enforma>
</template>
```

## Mixing with Schema

You can use sections with schema-based forms:

```vue
<template>
  <Enforma :data="formData" :schema="formSchema">
    <!-- This section is added to the schema-generated form -->
    <EnformaSection title="Custom Section">
      <EnformaField name="customField" label="Custom Field" />
    </EnformaSection>
  </Enforma>
</template>

<script setup>
const formSchema = {
  sections: [
    {
      title: 'Personal Information',
      fields: [
        { name: 'firstName', label: 'First Name', component: 'text' },
        { name: 'lastName', label: 'Last Name', component: 'text' }
      ]
    },
    {
      title: 'Account Settings',
      fields: [
        { name: 'email', label: 'Email', component: 'email' },
        { name: 'password', label: 'Password', component: 'password' }
      ]
    }
  ]
};
</script>
```

## Styling Sections

Apply custom styling to sections:

```vue
<template>
  <Enforma :data="formData">
    <EnformaSection 
      title="Personal Information" 
      section-class="primary-section"
      title-class="section-title"
      content-class="section-content"
    >
      <!-- Fields -->
    </EnformaSection>
  </Enforma>
</template>

<style>
.primary-section {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 24px;
}

.section-title {
  background-color: #f5f5f5;
  padding: 12px 16px;
  font-weight: 600;
}

.section-content {
  padding: 16px;
}
</style>
```

## Best Practices

- Use sections to group related fields logically
- Provide clear, descriptive titles for each section
- Consider using collapsible sections for optional or advanced settings
- Use conditional sections to simplify forms based on user input
- Add help text for sections that might need additional explanation
- Maintain consistent styling across sections for a cohesive form design
- Keep the nesting level reasonable (avoid too many nested sections)