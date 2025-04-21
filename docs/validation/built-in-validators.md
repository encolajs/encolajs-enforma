# Built-in Validators

Enforma comes with a comprehensive set of built-in validators to handle common validation scenarios. These validators can be used with any form component to ensure data integrity and provide immediate feedback to users.

## Using Validators

Validators can be specified in several ways:

### String Format

```vue
<EnformaField 
  name="username" 
  label="Username" 
  validators="required|min:3|max:20" 
/>
```

### Array Format

```vue
<EnformaField 
  name="email" 
  label="Email" 
  :rules="['required', 'email']" 
/>
```

### Object Format (for parameters and custom messages)

```vue
<EnformaField 
  name="password" 
  label="Password" 
  :rules="[
    'required',
    { name: 'min', params: [8], message: 'Password must be at least 8 characters' },
    { 
      name: 'pattern', 
      params: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/], 
      message: 'Password must include uppercase, lowercase, and numbers' 
    }
  ]" 
/>
```

## Core Validators

### required

Ensures the field has a value.

```js
validators="required"
```

### email

Validates email format.

```js
validators="email"
```

### min / max

For strings: validates length.
For numbers: validates value.

```js
validators="min:3|max:100"
```

### pattern

Validates against a regular expression.

```js
validators="pattern:^[A-Za-z0-9]+$"
```

Or with a RegExp object:

```js
:rules="[
  { name: 'pattern', params: [/^[A-Za-z0-9]+$/] }
]"
```

### url

Validates URL format.

```js
validators="url"
```

### numeric

Ensures the value contains only numbers.

```js
validators="numeric"
```

### integer

Ensures the value is an integer.

```js
validators="integer"
```

### alpha

Ensures the value contains only alphabet characters.

```js
validators="alpha"
```

### alphanumeric

Ensures the value contains only alphanumeric characters.

```js
validators="alphanumeric"
```

### date

Validates date format.

```js
validators="date"
```

### minDate / maxDate

Validates date ranges.

```js
validators="minDate:2023-01-01|maxDate:2023-12-31"
```

### between

Ensures the value is between two numbers.

```js
validators="between:1,100"
```

### matches

Ensures the value matches another field's value.

```js
validators="matches:password"
```

Or for password confirmation:

```js
:rules="[
  'required',
  { name: 'matches', params: ['password'] }
]"
```

### oneOf

Ensures the value is one of the provided options.

```js
validators="oneOf:option1,option2,option3"
```

### custom

For inline custom validation:

```js
:rules="[
  {
    name: 'custom',
    validate: (value) => value.includes('@company.com'),
    message: 'Must be a company email address'
  }
]"
```

## Async Validators

Some validators can work asynchronously:

```js
:rules="[
  {
    name: 'unique',
    validate: async (value) => {
      const response = await fetch(`/api/check-username?username=${value}`);
      const data = await response.json();
      return data.isAvailable;
    },
    message: 'This username is already taken'
  }
]"
```

## Conditional Validation

Validators can be conditionally applied:

```js
:rules="formData.accountType === 'business' ? ['required'] : []"
```

Or using dynamic expressions:

```js
:rules="[
  { 
    name: 'required', 
    when: '$form.needsValidation' 
  }
]"
```

## Error Messages

Customize error messages:

```js
:rules="[
  { 
    name: 'required', 
    message: 'This field cannot be left empty' 
  },
  { 
    name: 'email', 
    message: 'Please enter a valid email address' 
  }
]"
```

## Validation Groups

Group validators for reuse:

```js
const validators = {
  username: ['required', 'min:3', 'max:20'],
  email: ['required', 'email'],
  password: [
    'required',
    'min:8',
    { 
      name: 'pattern', 
      params: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/],
      message: 'Password must include uppercase, lowercase, and numbers'
    }
  ]
};
```

Then use at the form level:

```vue
<Enforma :data="formData" :rules="validators">
  <!-- Form fields -->
</Enforma>
```

## Best Practices

- Use appropriate validators for each field type
- Provide clear, specific error messages
- Group common validation patterns for reuse
- Consider field interactions when validating
- Balance immediate validation with user experience
- Test validation rules thoroughly, including edge cases