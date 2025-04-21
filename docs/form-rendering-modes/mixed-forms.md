# Mixed Forms

Enforma's flexible architecture allows you to combine different rendering approaches within the same form. This "mixed mode" approach lets you use the right technique for each part of your form.

## Understanding Mixed Forms

In mixed forms, you can combine:

1. **Field-based components** - For parts of the form where you need exact layout control
2. **Schema-based rendering** - For sections that are dynamically generated
3. **Headless components** - For custom UI elements that need special behavior

This approach gives you the best of all worlds - the convenience of schema-based forms with the flexibility of explicit components.

## Basic Example

Here's a simple mixed form that combines field-based and schema-based approaches:

```vue
<template>
  <Enforma :data="formData" :submitHandler="submit">
    <h2>Personal Information</h2>
    
    <!-- Explicit field declarations -->
    <div class="form-row">
      <EnformaField name="firstName" label="First Name" class="col-6" />
      <EnformaField name="lastName" label="Last Name" class="col-6" />
    </div>
    
    <h2>Contact Information</h2>
    
    <!-- Schema-based section -->
    <EnformaSchema :schema="contactSchema" />
    
    <!-- Regular field again -->
    <EnformaField 
      name="comments" 
      type="textarea" 
      label="Additional Comments" 
    />
    
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
import { ref } from 'vue';
import { Enforma, EnformaField, EnformaSchema, EnformaSubmitButton } from 'encolajs-formkit';

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  preferredContact: '',
  comments: ''
});

const contactSchema = {
  fields: [
    { name: 'email', label: 'Email Address', component: 'email' },
    { name: 'phone', label: 'Phone Number', component: 'tel' },
    { 
      name: 'preferredContact', 
      label: 'Preferred Contact Method', 
      component: 'radio',
      options: ['Email', 'Phone'] 
    }
  ]
};

function submit(data) {
  console.log('Form submitted:', data);
  // Process form submission
}
</script>
```

## Including Headless Components

You can also include headless components for custom UI elements:

```vue
<template>
  <Enforma :data="formData" :submitHandler="submit">
    <!-- Standard form fields -->
    <EnformaField name="name" label="Full Name" />
    <EnformaField name="email" type="email" label="Email" />
    
    <!-- Custom UI with headless component -->
    <div class="custom-rating-field">
      <label>Rate your experience</label>
      <HeadlessField name="rating">
        <template #default="{ value, updateValue }">
          <StarRating
            :value="value"
            @update:value="updateValue"
          />
        </template>
      </HeadlessField>
    </div>
    
    <!-- Back to standard fields -->
    <EnformaField 
      name="feedback" 
      type="textarea" 
      label="Additional Feedback" 
    />
    
    <EnformaSubmitButton>Submit Feedback</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
import { Enforma, EnformaField, EnformaSubmitButton } from 'encolajs-formkit';
import { HeadlessField } from 'encolajs-formkit/headless';
import StarRating from '@/components/StarRating.vue';
// ...
</script>
```

## Combining Schema with Customization

You can use schema-driven forms but override specific fields with custom implementations:

```vue
<template>
  <Enforma :data="formData" :schema="formSchema" :submitHandler="submit">
    <template #field:specialField="{ fieldProps }">
      <div class="custom-field-implementation">
        <label>{{ fieldProps.label }}</label>
        <CustomComponent 
          :value="formData.specialField"
          @update:value="val => formData.specialField = val"
        />
      </div>
    </template>
  </Enforma>
</template>

<script setup>
const formSchema = {
  fields: [
    // These will use the default rendering
    { name: 'name', label: 'Name', component: 'text' },
    { name: 'email', label: 'Email', component: 'email' },
    
    // This will use the custom slot implementation
    { name: 'specialField', label: 'Special Field', component: 'custom' }
  ]
};
</script>
```

## Dynamic Form Building

Mixed forms are especially powerful for building forms that have both static and dynamic sections:

```vue
<template>
  <Enforma :data="formData" :submitHandler="submit">
    <!-- Static form header -->
    <h2>Product Order Form</h2>
    
    <!-- Static fields -->
    <EnformaField name="customerName" label="Customer Name" />
    <EnformaField name="customerEmail" type="email" label="Email" />
    
    <!-- Dynamic product selection -->
    <h3>Selected Products</h3>
    <EnformaSchema :schema="generateProductsSchema()" />
    
    <!-- Static form footer -->
    <EnformaField 
      name="shippingNotes" 
      type="textarea" 
      label="Shipping Notes" 
    />
    
    <EnformaSubmitButton>Place Order</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
function generateProductsSchema() {
  // Generate dynamic schema based on selected products
  return {
    fields: selectedProducts.value.map(product => ({
      name: `quantity.${product.id}`,
      label: `${product.name} Quantity`,
      component: 'number',
      min: 1,
      max: 100,
      defaultValue: 1
    }))
  };
}
</script>
```

## When to Use Mixed Forms

Mixed forms are ideal when:

- Parts of your form are static and parts are dynamic
- You need precise layout control for some sections
- Some fields require custom UI that isn't easily schema-defined
- You're transitioning from one approach to another
- You have a complex form with varying requirements across sections

This approach gives you the flexibility to use the best technique for each part of your form, making it a powerful option for complex real-world applications.