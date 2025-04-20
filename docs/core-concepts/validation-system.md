# Validation System

Enforma provides a comprehensive validation system that ensures data integrity while maintaining a smooth user experience.

## Validation Philosophy

Enforma's validation approach focuses on:

- **Immediate feedback** - Issues are detected and reported as users interact with the form
- **Flexible triggers** - Validation can run on various events (input, blur, submit)
- **Clear error messages** - Helpful, specific messages guide users to correct issues
- **Localization** - Support for internationalized validation messages
- **Cross-field validation** - Fields can be validated in relation to one another

## Validation Architecture

The validation system consists of:

1. **Validators** - Functions that test field values against specific rules
2. **Validation Engine** - Coordinates validation execution and result tracking
3. **Error Message System** - Generates and manages user-friendly error feedback
4. **Validation UI Integration** - Connects validation results with visual feedback

## Built-in Validators

Enforma includes common validators out of the box:

- Required
- Min/max length
- Min/max value
- Email format
- Pattern matching
- Custom validators

## Validation Triggers

You can configure when validation occurs:

```js
const formConfig = {
  validateOn: ['input', 'blur', 'submit'], // Default
  fields: {
    username: {
      validateOn: ['blur', 'submit'] // Field-specific override
    }
  }
};
```

## Cross-field Validation

Enforma supports validators that reference other field values:

```js
const formConfig = {
  fields: {
    password: {
      validators: ['required', 'min:8']
    },
    confirmPassword: {
      validators: ['required', { name: 'matches', params: ['password'] }]
    }
  }
};
```

## Async Validation

For scenarios requiring server-side validation (like username availability):

```js
const usernameValidator = {
  name: 'unique',
  validate: async (value, { api }) => {
    const response = await api.checkUsername(value);
    return response.isAvailable;
  },
  message: 'This username is already taken'
};
```

## Integration with Validation Libraries

Enforma works seamlessly with popular validation libraries:

- Built-in validation
- EncolaJS Validator
- Yup
- Zod
- Custom validation providers

Configure your preferred validation approach through the form configuration.