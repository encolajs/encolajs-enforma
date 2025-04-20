# Rendering Modes

Enforma provides multiple rendering approaches to accommodate different developer preferences and application requirements.

## Available Rendering Modes

Enforma supports four main rendering modes:

1. **Field-based Rendering** - Explicit component declarations with maximum control
2. **Schema-based Rendering** - JSON-driven form generation with minimal markup
3. **Headless Mode** - Pure behavior with complete UI control
4. **Mixed Mode** - Combining approaches for optimal flexibility

## Field-based Rendering

This approach uses explicit component declarations for each form element:

```vue
<template>
  <Enforma v-model="formData" :validators="validators" @submit="onSubmit">
    <EnformaField name="firstName" label="First Name" />
    <EnformaField name="lastName" label="Last Name" />
    <EnformaField name="email" type="email" label="Email Address" />
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>
```

**Benefits:**
- Complete control over field placement and layout
- Direct access to field components for customization
- Familiar template-based approach

## Schema-based Rendering

This approach uses a JSON schema to define the form structure:

```vue
<template>
  <Enforma v-model="formData" :schema="formSchema" @submit="onSubmit" />
</template>

<script setup>
const formSchema = {
  fields: [
    { name: 'firstName', label: 'First Name', component: 'text' },
    { name: 'lastName', label: 'Last Name', component: 'text' },
    { name: 'email', label: 'Email Address', component: 'email' }
  ]
};
</script>
```

**Benefits:**
- Concise form definitions
- Easy dynamic form generation
- Separation of form structure from presentation
- Excellent for server-driven forms

## Headless Mode

This approach provides behavior without enforcing design:

```vue
<template>
  <HeadlessForm v-model="formData" :validators="validators" @submit="onSubmit">
    <template #default="{ submitForm, formState }">
      <form @submit.prevent="submitForm">
        <HeadlessField name="firstName">
          <template #default="{ value, errors, updateValue }">
            <div>
              <label>First Name</label>
              <input :value="value" @input="e => updateValue(e.target.value)" />
              <div v-if="errors.length">{{ errors[0] }}</div>
            </div>
          </template>
        </HeadlessField>
        <!-- Other fields -->
        <button type="submit">Submit</button>
      </form>
    </template>
  </HeadlessForm>
</template>
```

**Benefits:**
- Complete UI design freedom
- Full access to form state and behavior
- Works with any UI framework or custom components

## Mixed Mode

You can combine approaches in the same form:

```vue
<template>
  <Enforma v-model="formData" :validators="validators" @submit="onSubmit">
    <!-- Schema-based section -->
    <EnformaSchema :schema="personalInfoSchema" />
    
    <!-- Explicit field declarations -->
    <h3>Contact Information</h3>
    <EnformaField name="email" type="email" label="Email" />
    <EnformaField name="phone" type="tel" label="Phone" />
    
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>
```

**Benefits:**
- Use the best approach for each part of your form
- Balance convenience with control
- Incrementally adopt schema-based rendering

## Choosing a Rendering Mode

Consider these factors when selecting a rendering mode:

- **Form complexity** - More complex forms may benefit from schema approach
- **Design requirements** - Custom designs may require headless mode
- **Dynamic requirements** - Server-driven forms work best with schema mode
- **Developer preferences** - Some teams prefer explicit markup over schemas