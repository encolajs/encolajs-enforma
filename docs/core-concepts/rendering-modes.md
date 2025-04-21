# Rendering Modes

Enforma provides multiple rendering approaches to accommodate different developer preferences and application requirements.

Enforma supports four main rendering modes:

1. **Field-based Rendering** - Explicit component declarations with maximum control
2. **Schema-based Rendering** - JSON-driven form generation with minimal markup
3. **Headless Mode** - Pure behavior with complete UI control
4. **Mixed Mode** - Combining approaches for optimal flexibility

## Field-based Rendering

##### :notebook_with_decorative_cover: Complete working example [here](/examples/fields.md)

This approach uses explicit component declarations for each form element:

```vue
<template>
  <Enforma :data="data":rules="rules" :submitHandler="submit">
    <EnformaField 
      name="firstName" 
      label="First Name" 
      ... rest of the props go here 
    />
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
- Optional use of custom components (eg: your own submit button)

## Schema-based Rendering

##### :notebook_with_decorative_cover: Complete working example [here](/examples/schema.md)

```vue
<template>
  <Enforma :data="data" :rules="rules" :schema="formSchema" :submitHandler="submit" />
</template>

<script setup>
const formSchema = {
  first_name: {
    label: 'First name',
    required: true, // mark field as required
    input_props: {
      // custom props for the input component
    }
  }
};
</script>
```

**Benefits:**
- Concise form definitions
- Easy dynamic form generation
- Separation of form structure from presentation
- Excellent for server-driven forms

You can learn more about using schemas in the [EnformaSchema component section](/components/schema.md)

## Headless Mode

##### :notebook_with_decorative_cover: Complete working example [here](/examples/headless-components.md)

This approach provides behavior without enforcing design:

```vue
<template>
  <HeadlessForm :data="data":rules="rules" :submitHandler="submit">
    <template #default="formCtrl">
      <HeadlessField name="firstName">
        <template #default="{ id, attrs, events, error}">
          <div>
            <label :for="id">First Name</label>
            <input v-bind="attrs" v-on="events" />
            <<div 
              v-if="error"
              :id="attrs['aria-errormessage']">
              {{ error }}
            </div>
          </div>
        </template>
      </HeadlessField>
      <!-- Other fields -->
      <button type="submit">Submit</button>
    </template>
  </HeadlessForm>
</template>
```

**Benefits:**
- Complete UI design freedom
- Full access to form state and behavior
- Works with any UI framework or custom components

> [!INFO] When using Headless components it's best to create an app-specific wrapper component

## Mixed Mode

##### :notebook_with_decorative_cover: Complete working example [here](/examples/mixed-form.md)

```vue
<template>
  <Enforma :data="data" :rules="rules" :schema="schema" :submitHandler="submit">
    <!-- passing just the name enough if `email` is defined in the schema -->
    <EnformaField name="email" /> 
    
    <!-- use a field that is missing from the schema -->
    <EnformaField name="phone" label="Phone" />

    <!-- use a headless component if the default rendering result is not to your liking -->
    <HeadlessField name="password">
      
      <!-- template goes here -->

    </HeadlessField>
    
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>
```

## Choosing a Rendering Mode

Consider these factors when selecting a rendering mode:

- **Form complexity** - More complex forms may benefit from schema approach
- **Design requirements** - Custom designs may require headless mode
- **Dynamic requirements** - Server-driven forms work best with schema mode
- **Developer preferences** - Some teams prefer explicit markup over schemas