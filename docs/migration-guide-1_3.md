# Migration from v1.2.x to v1.3.x

Version 1.3.0 maintains full backward compatibility. Your existing code will continue to work with deprecation warnings in development mode.

## What's New in v1.3.0

- 🎯 Support for multiple validation libraries (Zod, Yup, Valibot)
- 🔧 New `:validator` prop for HeadlessForm and other form components
- 📦 Tree-shakable validator adapters via separate entry points
- 🎨 `FormValidator` interface for creating custom validators
- 🪶 Optional peer dependencies - only install the validators you need

## Deprecation Warnings

The following APIs are deprecated but still work. You'll see console warnings in development mode:

### 1. Passing rules object to useForm()

**Deprecated**:
```typescript
const form = useForm(data, { email: 'required|email' })
```

**Recommended**:
```typescript
import { createEncolaValidator } from '@encolajs/enforma/validators/encola'

const form = useForm(data, createEncolaValidator({
  email: 'required|email'
}))
```

### 2. Using :rules prop on HeadlessForm

**Deprecated**:
```vue
<HeadlessForm :data="formData" :rules="{ email: 'required|email' }" />
```

**Recommended**:
```vue
<script setup>
import { createEncolaValidator } from '@encolajs/enforma/validators/encola'

const validator = createEncolaValidator({ email: 'required|email' })
</script>

<template>
  <HeadlessForm :data="formData" :validator="validator" />
</template>
```

## Migration steps

**Step 1**: Install @encolajs/validator (if not already installed)

```bash
npm install @encolajs/validator
```

**Step 2**: Update your code to use the new API

```vue
<script setup>
import { createEncolaValidator } from '@encolajs/enforma/validators/encola'

const validator = createEncolaValidator({
  email: 'required|email',
  name: 'required'
})
</script>

<template>
  <!-- Old way (deprecated but still works) -->
  <!-- <HeadlessForm :rules="{ email: 'required|email' }" /> -->

  <!-- New way (recommended) -->
  <HeadlessForm :data="formData" :validator="validator" />
</template>
```

## Common Migration Patterns

### Pattern 1: Simple Forms

**Before**:
```vue
<script setup>
const form = useForm(data, {
  email: 'required|email',
  name: 'required'
})
</script>
```

**After**:
```vue
<script setup>
import { createEncolaValidator } from '@encolajs/enforma/validators/encola'

const form = useForm(data, createEncolaValidator({
  email: 'required|email',
  name: 'required'
}))
</script>
```

### Pattern 2: Forms with Custom Messages

**Before**:
```vue
<script setup>
const form = useForm(data, rules, {
  customMessages: {
    'email.required': 'Please enter your email',
    'email.email': 'Email format is invalid'
  }
})
</script>
```

**After**:
```vue
<script setup>
import { createEncolaValidator } from '@encolajs/enforma/validators/encola'

const validator = createEncolaValidator(
  { email: 'required|email' },
  {
    'email.required': 'Please enter your email',
    'email.email': 'Email format is invalid'
  }
)

const form = useForm(data, validator)
</script>
```

### Pattern 3: HeadlessForm Component

**Before**:
```vue
<template>
  <HeadlessForm
    :data="formData"
    :rules="{ email: 'required|email' }"
    :customMessages="messages"
  />
</template>
```

**After**:
```vue
<script setup>
import { createEncolaValidator } from '@encolajs/enforma/validators/encola'

const validator = createEncolaValidator(
  { email: 'required|email' },
  messages
)
</script>

<template>
  <HeadlessForm :data="formData" :validator="validator" />
</template>
```

## Troubleshooting

### Issue: "Cannot find module '@encolajs/enforma/validators/encola'"

**Solution**: Make sure you're importing from the correct path:

```typescript
// ✅ Correct
import { createEncolaValidator } from '@encolajs/enforma/validators/encola'

// ❌ Incorrect
import { createEncolaValidator } from '@encolajs/enforma'
```

### Issue: Deprecation warnings in production

Deprecation warnings only show in development mode (`process.env.NODE_ENV !== 'production'`). If you're seeing them in production, check your build configuration.

### Issue: TypeScript errors with Zod/Yup/Valibot

Make sure you have TypeScript 5.0+ installed:

```bash
npm install -D typescript@^5.0.0
```

### Issue: Validator not found / tree-shaking issues

Ensure your bundler is configured correctly for tree-shaking. The validators are in separate entry points to enable proper code splitting.

### Other issues

If you encounter other issues while migration [report an issue](https://github.com/encolajs/encolajs-enforma/issues) in Github.
