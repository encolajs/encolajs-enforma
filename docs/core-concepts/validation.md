# Validation System

Enforma provides a flexible validation system supporting multiple validation libraries, ensuring data integrity while maintaining a smooth user experience.

Enforma's validation approach focuses on:

- **Immediate feedback** - Issues are detected and reported as users interact with the form
- **Clear error messages** - Helpful, specific messages guide users to correct issues
- **Localization** - Support for internationalized validation messages
- **Cross-field validation** - Fields can be validated in relation to one another
- **Multiple validators** - Choose from Zod, Yup, Valibot, @encolajs/validator, or use no validation
- **Tree-shakable** - Only bundle the validator you actually use

## Supported Validators

Starting with v1.3.0, Enforma supports multiple validation libraries. Choose the one that best fits your project needs:

- **@encolajs/validator** - Laravel-style validation rules with pipe notation (`required|email|min:8`)
- **Zod** - TypeScript-first schema validation with excellent type inference
- **Yup** - Object schema validation with powerful conditional logic
- **Valibot** - Lightweight, modular validation library for optimal bundle size
- **No validation** - Use forms without any validation for simple data collection

Each validator integrates seamlessly with Enforma's `useForm()` composable and all form components.

## Integration with @encolajs/validator

The EncolaJS Validator provides Laravel-style validation rules with a simple pipe notation, making it easy to express complex validation requirements.

### Installation

```bash
npm install @encolajs/validator
```

### Basic Usage

Import the validator factory and create a validator instance:

```vue
<script setup>
import { useForm } from '@encolajs/enforma'
import { createEncolaValidator } from '@encolajs/enforma/validators/encola'

const formData = { email: '', name: '' }

const validator = createEncolaValidator({
  email: 'required|email',
  name: 'required|min_length:2'
})

const form = useForm(formData, validator)
</script>
```

### Form-Level Validation

Enforma supports validation at multiple levels:

1. **Form-level validation** - Validator passed to the form component
2. **Field-level validation** - Rules specified on individual fields
3. **Schema-level validation** - Rules defined in form schemas

**Using with form components:**

```vue
<template>
  <Enforma v-bind="formProps">
    ... form content goes here ...
  </Enforma>
</template>

<script setup>
import { createEncolaValidator } from '@encolajs/enforma/validators/encola'

const formData = {
  email: '',
  password: ''
}

const validator = createEncolaValidator(
  {
    email: 'required|email',
    password: 'required|min:8|same_as:@password_confirmation',
    password_confirmation: 'required'
  },
  {
    'email.required': 'Please provide your email address',
    'password.min': 'Password must be at least 8 characters',
    'password.same_as': 'Passwords must match',
  }
)

const formProps = {
  data: formData,
  validator
}
</script>
```

### Field-Level Validation

You can specify validation rules directly on individual `<EnformaField>` components:

```vue
<template>
  <Enforma :data="formData" :submitHandler="submit">
    <EnformaField
      name="email"
      label="Email"
      inputComponent="input"
      rules="required|email"
      :messages="{
        required: 'Email is required',
        email: 'Please enter a valid email address'
      }"
    />
    <EnformaField
      name="phone"
      label="Phone"
      inputComponent="input"
      rules="required|phone"
      :messages="{
        required: 'Phone number is required',
        phone: 'Please enter a valid phone number'
      }"
    />
  </Enforma>
</template>
```

### Custom Messages

Customize error messages by passing a second parameter to `createEncolaValidator`:

```vue
<script setup>
import { createEncolaValidator } from '@encolajs/enforma/validators/encola'

const validator = createEncolaValidator(
  {
    email: 'required|email',
    password: 'required|min_length:8'
  },
  {
    'email.required': 'Please enter your email address',
    'email.email': 'Please enter a valid email',
    'password.min_length': 'Password must be at least 8 characters'
  }
)
</script>
```

### Using with HeadlessForm

```vue
<template>
  <HeadlessForm :data="formData" :validator="validator">
    <HeadlessField name="email" #default="{ field, error }">
      <input v-bind="field" />
      <span v-if="error">{{ error }}</span>
    </HeadlessField>
  </HeadlessForm>
</template>

<script setup>
import { ref } from 'vue'
import { HeadlessForm, HeadlessField } from '@encolajs/enforma'
import { createEncolaValidator } from '@encolajs/enforma/validators/encola'

const formData = ref({ email: '' })
const validator = createEncolaValidator({ email: 'required|email' })
</script>
```

### Built-in Validation Rules

EncolaJS Validator provides a comprehensive set of validation rules. Common rules include:

- `required` - Field must not be empty
- `email` - Must be a valid email address
- `min:{value}` - Minimum string length or numeric value
- `max:{value}` - Maximum string length or numeric value
- `gt:{value}` - Greater than (exclusive)
- `gte:{value}` - Greater than or equal (inclusive)
- `lt:{value}` - Less than (exclusive)
- `lte:{value}` - Less than or equal (inclusive)
- `date:{format}` - Must be a valid date
- `number` - Must be a number
- `phone` - Must be a valid phone number
- `url` - Must be a valid URL
- `same_as:@field` - Must match another field
- ... and [many more](https://encolajs.com/validator/guide/validation-rules.html)

For a complete list of available validation rules, visit the [EncolaJS Validator Documentation](https://encolajs.com/validator/).

### Cross-field Validation

EncolaJS Validator supports validators that reference other field values using the `@` prefix:

```js
const validator = createEncolaValidator({
  password: 'required|min:8|same_as:@password_confirmation',
  password_confirmation: 'required'
})
```

This ensures the password and password_confirmation fields match.

### Async Validation

The EncolaJS Validator library is async by default, so any function that returns a boolean-resolving `Promise` can be used as a validation rule.

For implementing a server-calling validation rule, check out the ["Async Validation" recipe](/recipes/async-validation.md).

### Migrating from Legacy API

::: warning DEPRECATED API
The legacy `:rules` prop and rules object parameter are deprecated but still supported in v1.3.0.
:::

See the [Migration Guide](/migration-guide-1_3) for complete migration instructions.

## Integration with Zod

Zod is a TypeScript-first schema validation library with excellent type inference and error messages.

### Installation

```bash
npm install zod
```

### Basic Usage

```vue
<script setup lang="ts">
import { useForm } from '@encolajs/enforma'
import { createZodValidator } from '@encolajs/enforma/validators/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(18, 'Must be 18 or older')
})

type FormData = z.infer<typeof schema>

const formData: FormData = { email: '', name: '', age: 0 }
const form = useForm(formData, createZodValidator(schema))
</script>
```

### Complex Validation

Zod supports complex validation scenarios with chained validators:

```vue
<script setup lang="ts">
import { z } from 'zod'
import { createZodValidator } from '@encolajs/enforma/validators/zod'

const schema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  email: z.string().email('Invalid email'),
  age: z.number().min(18).max(120)
})

const validator = createZodValidator(schema)
</script>
```

### Nested Objects

Validate complex nested data structures:

```vue
<script setup lang="ts">
import { z } from 'zod'
import { createZodValidator } from '@encolajs/enforma/validators/zod'

const schema = z.object({
  user: z.object({
    name: z.string().min(2),
    email: z.string().email()
  }),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    zipCode: z.string().regex(/^\d{5}$/, 'Must be 5 digits')
  })
})

const validator = createZodValidator(schema)
</script>
```

### Using with HeadlessForm

```vue
<template>
  <HeadlessForm :data="formData" :validator="validator">
    <HeadlessField name="email" #default="{ field, error }">
      <input type="email" v-bind="field" />
      <span v-if="error" class="error">{{ error }}</span>
    </HeadlessField>

    <button type="submit">Submit</button>
  </HeadlessForm>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { HeadlessForm, HeadlessField } from '@encolajs/enforma'
import { createZodValidator } from '@encolajs/enforma/validators/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Please enter a valid email')
})

const formData = ref({ email: '' })
const validator = createZodValidator(schema)
</script>
```

Learn more in the [Zod documentation](https://zod.dev/).

## Integration with Yup

Yup is a powerful schema validation library with excellent support for conditional validation and cross-field dependencies.

### Installation

```bash
npm install yup
```

### Basic Usage

```vue
<script setup>
import { useForm } from '@encolajs/enforma'
import { createYupValidator } from '@encolajs/enforma/validators/yup'
import * as yup from 'yup'

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required')
})

const formData = { email: '', password: '', confirmPassword: '' }
const form = useForm(formData, createYupValidator(schema))
</script>
```

### Conditional Validation

Yup excels at conditional validation based on other field values:

```vue
<script setup>
import * as yup from 'yup'
import { createYupValidator } from '@encolajs/enforma/validators/yup'

const schema = yup.object({
  country: yup.string().required('Country is required'),
  zipCode: yup.string()
    .when('country', {
      is: 'US',
      then: (schema) => schema.matches(/^\d{5}$/, 'US zip must be 5 digits'),
      otherwise: (schema) => schema.required('Zip code is required')
    })
})

const validator = createYupValidator(schema)
</script>
```

### Cross-field Validation

Validate fields in relation to each other:

```vue
<script setup>
import * as yup from 'yup'

const schema = yup.object({
  startDate: yup.date().required('Start date is required'),
  endDate: yup.date()
    .min(yup.ref('startDate'), 'End date must be after start date')
    .required('End date is required')
})
</script>
```

### Nested Objects and Arrays

```vue
<script setup>
import * as yup from 'yup'

const schema = yup.object({
  user: yup.object({
    name: yup.string().min(2).required(),
    email: yup.string().email().required()
  }),
  tags: yup.array()
    .of(yup.string().min(1).required())
    .min(1, 'At least one tag is required')
})
</script>
```

### Using with HeadlessForm

```vue
<template>
  <HeadlessForm :data="formData" :validator="validator">
    <HeadlessField name="email" #default="{ field, error }">
      <input v-bind="field" />
      <span v-if="error">{{ error }}</span>
    </HeadlessField>

    <HeadlessField name="password" #default="{ field, error }">
      <input type="password" v-bind="field" />
      <span v-if="error">{{ error }}</span>
    </HeadlessField>

    <HeadlessField name="confirmPassword" #default="{ field, error }">
      <input type="password" v-bind="field" />
      <span v-if="error">{{ error }}</span>
    </HeadlessField>
  </HeadlessForm>
</template>

<script setup>
import { ref } from 'vue'
import { createYupValidator } from '@encolajs/enforma/validators/yup'
import * as yup from 'yup'

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(8).required(),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required()
})

const formData = ref({ email: '', password: '', confirmPassword: '' })
const validator = createYupValidator(schema)
</script>
```

Learn more in the [Yup documentation](https://github.com/jquense/yup).

## Integration with Valibot

Valibot is a lightweight, modular validation library designed for optimal bundle size. It provides a modern API with excellent TypeScript support.

### Installation

```bash
npm install valibot
```

### Basic Usage

```vue
<script setup>
import { useForm } from '@encolajs/enforma'
import { createValibotValidator } from '@encolajs/enforma/validators/valibot'
import * as v from 'valibot'

const schema = v.object({
  email: v.pipe(
    v.string(),
    v.email('Please enter a valid email address')
  ),
  name: v.pipe(
    v.string(),
    v.minLength(2, 'Name must be at least 2 characters')
  ),
  age: v.pipe(
    v.number(),
    v.minValue(18, 'You must be 18 or older')
  )
})

const formData = { email: '', name: '', age: 0 }
const form = useForm(formData, createValibotValidator(schema))
</script>
```

### Complex Types

Valibot's modular design makes it easy to compose complex validation schemas:

```vue
<script setup>
import * as v from 'valibot'
import { createValibotValidator } from '@encolajs/enforma/validators/valibot'

const schema = v.object({
  email: v.pipe(v.string(), v.email('Invalid email')),
  tags: v.array(v.pipe(v.string(), v.minLength(1))),
  settings: v.object({
    notifications: v.boolean(),
    theme: v.picklist(['light', 'dark']),
    fontSize: v.pipe(v.number(), v.minValue(10), v.maxValue(24))
  })
})

const validator = createValibotValidator(schema)
</script>
```

### Nested Objects

```vue
<script setup>
import * as v from 'valibot'

const schema = v.object({
  user: v.object({
    name: v.pipe(v.string(), v.minLength(2)),
    email: v.pipe(v.string(), v.email())
  }),
  address: v.object({
    street: v.string(),
    city: v.string(),
    zipCode: v.pipe(
      v.string(),
      v.regex(/^\d{5}$/, 'Must be 5 digits')
    )
  })
})
</script>
```

### Using with HeadlessForm

```vue
<template>
  <HeadlessForm :data="formData" :validator="validator">
    <HeadlessField name="email" #default="{ field, error }">
      <input v-bind="field" />
      <span v-if="error">{{ error }}</span>
    </HeadlessField>

    <HeadlessField name="name" #default="{ field, error }">
      <input v-bind="field" />
      <span v-if="error">{{ error }}</span>
    </HeadlessField>
  </HeadlessForm>
</template>

<script setup>
import { ref } from 'vue'
import { createValibotValidator } from '@encolajs/enforma/validators/valibot'
import * as v from 'valibot'

const schema = v.object({
  email: v.pipe(v.string(), v.email('Invalid email')),
  name: v.pipe(v.string(), v.minLength(2, 'Name too short'))
})

const formData = ref({ email: '', name: '' })
const validator = createValibotValidator(schema)
</script>
```

Learn more in the [Valibot documentation](https://valibot.dev/).

## Using Enforma Without Validation

You can use Enforma forms without any validation for simple data collection scenarios.

### When to Skip Validation

No validation is useful for:

- **Simple data collection forms** - Forms that only collect information without strict requirements
- **Multi-step wizards** - When validation happens only at the final step
- **Server-side validation only** - When all validation is handled on the backend
- **Draft or autosave features** - When users can save incomplete data

### Basic Usage

Simply omit the validator parameter when creating a form:

```vue
<script setup>
import { useForm } from '@encolajs/enforma'

const formData = { email: '', name: '', notes: '' }
const form = useForm(formData) // No validator = no validation

// All validation methods will pass
const isValid = await form.validate() // Always returns true
</script>
```

### Using with HeadlessForm

```vue
<template>
  <HeadlessForm :data="formData">
    <HeadlessField name="email" #default="{ field }">
      <input v-bind="field" placeholder="Email (optional)" />
    </HeadlessField>

    <HeadlessField name="notes" #default="{ field }">
      <textarea v-bind="field" placeholder="Your notes..." />
    </HeadlessField>

    <button type="submit">Save Draft</button>
  </HeadlessForm>
</template>

<script setup>
import { ref } from 'vue'
import { HeadlessForm, HeadlessField } from '@encolajs/enforma'

const formData = ref({
  email: '',
  notes: ''
})
</script>
```

### Behavior Without Validation

When no validator is provided:

- `form.validate()` always returns `true`
- `form.errors()` always returns an empty object `{}`
- Field error states remain empty
- Form submission is never blocked by validation
- All form data is considered valid

This allows you to use Enforma's reactive form management and data binding features without enforcing validation rules.