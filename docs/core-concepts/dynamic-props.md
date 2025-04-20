# Dynamic Props

Enforma allows you to create reactive form components whose properties can change based on form state, user interactions, or external data.

## Understanding Dynamic Props

Dynamic props enable your form fields to:

- Change behavior based on other field values
- Update appearance based on validation state
- Adapt to user interactions
- React to external data changes

## Using Dynamic Props

You can define dynamic props in several ways:

### 1. Expression Strings

The simplest way to define dynamic behavior is with expression strings:

```vue
<template>
  <Enforma v-model="formData">
    <EnformaField 
      name="employmentType" 
      type="select" 
      label="Employment Type"
      :options="['Full-time', 'Part-time', 'Contract', 'Not employed']"
    />
    
    <!-- This field is only required when employmentType is not "Not employed" -->
    <EnformaField 
      name="company" 
      label="Company"
      :required="$form.employmentType !== 'Not employed'"
    />
    
    <!-- This field is entirely hidden when employmentType is "Not employed" -->
    <EnformaField 
      name="yearsOfExperience" 
      label="Years at Company"
      type="number"
      :if="$form.employmentType !== 'Not employed'"
    />
  </Enforma>
</template>
```

### 2. Function Props

For more complex logic, you can use functions:

```vue
<template>
  <Enforma v-model="formData">
    <EnformaField 
      name="password" 
      type="password" 
      label="Password"
    />
    
    <EnformaField 
      name="confirmPassword" 
      type="password" 
      label="Confirm Password"
      :validators="confirmPasswordValidators"
    />
  </Enforma>
</template>

<script setup>
const confirmPasswordValidators = ($form) => {
  return [
    'required',
    { 
      name: 'matches', 
      params: [$form.password],
      message: 'Passwords must match'
    }
  ];
};
</script>
```

### 3. In Schema Definitions

Dynamic props work with schema-based forms too:

```js
const formSchema = {
  fields: [
    {
      name: 'country',
      component: 'select',
      label: 'Country',
      options: ['US', 'Canada', 'UK', 'Other']
    },
    {
      name: 'state',
      component: 'select',
      label: 'State/Province',
      if: '$form.country === "US" || $form.country === "Canada"',
      options: ($form) => getStatesByCountry($form.country)
    }
  ]
};
```

## Available Context Variables

In dynamic prop expressions, you have access to:

- **$form** - The entire form state object
- **$field** - The current field's state
- **$parent** - For nested fields, the parent's state
- **$index** - For repeatable fields, the current item index
- **$dirty** - Whether the field has been modified
- **$errors** - Validation errors for the field
- **$touched** - Whether the field has been focused and then blurred

## Performance Optimization

Dynamic props are reactive, meaning they recalculate when dependencies change. For optimal performance:

- Use the simplest expressions that meet your needs
- Avoid expensive computations in dynamic prop functions
- Consider memoizing complex calculations

## Common Use Cases

Dynamic props are particularly useful for:

1. **Conditional validation** - Apply different validation rules based on context
2. **Dependent fields** - Show/hide fields based on other values
3. **Adaptive UI** - Change field appearance based on validation state
4. **Dynamic options** - Populate select options based on other selections

By leveraging dynamic props, you can create forms that adapt intelligently to user input and application state, improving both usability and data quality.