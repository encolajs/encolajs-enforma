# Migration Guide: v1.6.x to v1.7.0

## `useGlobalEvents` and `globalFormEmitter` are removed

Since 1.6.0, `<Enforma>` and `HeadlessForm` no longer emitted on `globalFormEmitter`; only a `useForm()` made with `useGlobalEvents: true` did. Both are now gone: every form has its own emitter. Listen to a form's events on the form itself (`@submit_success`, `@field_changed`…) or on its controller (`formController.on(…)`).

# Migration Guide: v1.5.x to v1.6.0

Version 1.6.0 fixes how forms behave next to each other and how expressions run. Most forms need no change. Read on if you listen to forms' events through the shared emitter, configure components globally, or write expressions in JavaScript syntax.

## What's New in v1.6.0

- 🔒 **Expressions are interpreted, never compiled into code.** `${…}` strings are read with [`@andreasnicolaou/typescript-expression-language`](https://github.com/andreasnicolaou/typescript-expression-language), a port of Symfony's ExpressionLanguage, instead of `new Function()`. Forms work under a Content Security Policy without `'unsafe-eval'`.
- 🎯 **`expressions.only`** limits which schema keys are evaluated: `{ expressions: { only: ['if'] } }` evaluates `if` and keeps every other string, a label holding `${…}` included, as text.
- 🐛 **Each form's events are its own.** `<Enforma>` and `HeadlessForm` sent their events through one emitter every form on the page shared, and never removed their listeners: two forms on a page (a page's and a modal's) heard each other's `submit_success`, `field_changed` and so on, and every unmounted form left its handlers behind. Each form now has its own emitter, removed with it.
- ⚙️ **A form's `config` reaches its fields, sections and buttons**, so two forms on one page can use different field components. Components in a config are taken as they are, never merged.
- 🔁 **A changed `schema` or `context`** updates the form without remounting it.
- 🧩 **`provideEnformaForm()`** renders Enforma's schema under a form controller you made with `useForm()`.
- 📦 New exports: `EnformaSchema`, `EnformaSection`, `useEnformaField`, `provideEnformaForm`, `formFieldSlotsKey`, `fieldRulesCollectorKey`.
- 🪶 `@nuxt/ui` and `reka-ui` are optional peer dependencies.

## What may need a change

### Expressions use the expression language, not JavaScript

Comparisons, `&&`/`||` (or `and`/`or`), `!`/`not`, the ternary, `??`, `in`, arithmetic, property access and method calls on the context work as before:

```js
if: '${form.getFieldValue("contactPreference") === "email" || form.getFieldValue("contactPreference") === "both"}'
label: '${context.getExperienceLabel(form.getFieldValue("position"))}'
if: "${form.country in ['CH', 'GB']}"
```

What no longer works is JavaScript-only syntax: arrow functions, template literals, `new`, and methods called on strings or numbers (`form.name.toUpperCase()`). Move such logic into a function of the form's `context` and call it from the expression.

An expression reads three names: `form`, `context` and `config`. `form` now gives the form's **values** (copies of them), `form.getFieldValue(path)`, `form.values()` and the form's state (`form.$isDirty`, `form.$isTouched`, `form.$isValidating`, `form.$isSubmitting`). The controller's other methods (`setFieldValue()`, `submit()`, `reset()`…) are no longer reachable from an expression, and reading a value no longer registers a field for it.

### A form's events reach that form's listeners only

Listen to a form's events on the form itself (`@submit_success`, `@field_changed`…) or on its controller (`formController.on(…)`). A listener on `globalFormEmitter` no longer hears `<Enforma>` or `HeadlessForm`: only a `useForm()` made with `useGlobalEvents: true` still emits there.

### Default components

Without `EnformaPlugin` or a preset, the `schema`, `section` and `field` components default to Enforma's own (`EnformaSchema`, `EnformaSection`, `EnformaField`) rather than a `<div>`. `DEFAULT_CONFIG.components.schema` and `.section` are now `null`, meaning "Enforma's own".

### Vue 3.3 or later

Enforma now needs Vue 3.3 or later (`toValue()`).

# Migration Guide: v1.2.x to v1.3.x

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

## Migration Strategies

### Option 1: Keep Using @encolajs/validator (Minimal Changes)

This is the easiest migration path if you're happy with the current validation syntax.

**Step 1**: Install @encolajs/validator (if not already installed)

```bash
npm install @encolajs/validator
```

**Step 2**: Update your code to use the new API

```vue
<script setup>
import { useForm } from '@encolajs/enforma'
import { createEncolaValidator } from '@encolajs/enforma/validators/encola'

// Old way (deprecated but still works)
// const form = useForm(formData, { email: 'required|email' })

// New way (recommended)
const form = useForm(formData, createEncolaValidator({
  email: 'required|email',
  name: 'required|min_length:2'
}))
</script>
```

For HeadlessForm components:

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