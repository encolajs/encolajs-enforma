# Migration Guide: v1.6.x to v1.7.0

## Root sections are ordered with the root fields

A section is at the root of the form when its `section` is left out, `null` or empty. Root sections and the fields at the root are now ordered together by `position`, as a section's own fields and sub-sections are: a root section is rendered above the root fields with a higher `position`, and after the root fields without one.

What changes:

- A section with `section: null` used to be rendered before every root field, whatever their positions. Give it a `position` lower than the fields' to keep it first.
- A field with `section: null` (or empty) is now rendered at the root. It used to be rendered nowhere.
- `<EnformaSchema>` renders the root as one section, `default`, so the root sections are inside its element rather than beside it, and their component gets all their keys as props, as a sub-section's does, rather than only `name`.

## `EnformaField` takes no rules or messages

Validation is set up for the whole form: a validator, `<Enforma>`'s `rules` and `messages`, or the rules in its schema. The `rules` and `messages` props of `<EnformaField>` are no longer read, and `fieldRulesCollectorKey` is no longer exported. They were read after the form had made its validator, so a field's rules were never checked: move them to the form.

```vue
<!-- Before -->
<Enforma :data="data">
  <EnformaField name="email" rules="required|email" :messages="{ email: 'Invalid email' }" />
</Enforma>

<!-- After -->
<Enforma :data="data" :rules="{ email: 'required|email' }" :messages="{ 'email:email': 'Invalid email' }">
  <EnformaField name="email" />
</Enforma>
```

A field of the schema keeps its `rules` and `messages`: the form reads them from the schema.

## A refused submit goes to the first field with errors

A refused submit used to leave the page as it was. It now goes to the first field with errors: it opens the tabs and collapsibles holding it, scrolls it into view and focuses its input (see [Going to the first field with errors](https://encolajs.com/enforma/core-concepts/validation#going-to-the-first-field-with-errors)). To keep the page where it is, set `behavior.focusFirstError: false` in the plugin's options or in a form's `config`.

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
