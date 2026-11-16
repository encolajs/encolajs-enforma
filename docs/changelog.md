# Changelog

The changes of each version since 1.3.0, the latest first. A version marked ⚠️ changes something your forms may rely on: read its breaking changes before you upgrade.

## 1.6.4 ⚠️

_2026-11-15_

### Breaking changes

- **Fields and sub-sections are ordered together by `position`.** A sub-section is rendered above the fields of its section that have a higher `position`; on equal positions the field comes first. A sub-section whose `position` is lower than a sibling field's used to be rendered after all the fields. Without positions the order is unchanged: fields first, then sub-sections. See the [Section Schema](/schema-forms/schema-reference#section-schema).

### Fixes

- Two fields whose rules name each other (a password and its repeat) no longer check each other forever once both are dirty, which hung the page when a rule answered after a timer. Each change checks each dependent field once, and `validate()` settles once they are checked.
- A dependent field hidden by its `if` stays unchecked when the field it names changes. A hidden `ends_on: 'required|date_after:@starts_on'` used to refuse the form, with an error on a field nobody could see.
- An input leaves its error state once its error is fixed. The props a preset sets on error (Nuxt UI's `highlight` and `color`, Vuetify's and Quasar's `error`) stayed on the input.

### Documentation

- A [Schema Builder](/schema-builder) page, to build a schema by dragging fields and sections.

## 1.6.3 ⚠️

_2026-11-13_

### Breaking changes

- **`useGlobalEvents` and `globalFormEmitter` are removed.** Since 1.6.0 every form emits on its own emitter; only a `useForm()` made with `useGlobalEvents: true` still used the shared one, and heard every other form. Listen to a form's events on the form (`@submit_success`, `@field_changed`…) or on its controller (`formController.on(…)`).

### Changes

- `mitt` is no longer a dependency: `createFormEmitter()` builds an emitter with the same API (`all`, `on`, `off`, `emit` and `'*'`). The `Emitter` type is exported, for code that typed a variable with mitt's.

## 1.6.2

_2026-11-13_

### Fixes

- Nuxt UI preset: the field's label points at its input. It read the field's value instead of its id, so a field whose value is `null` crashed the form and the label's `for` never matched.

### Documentation

- The examples use the Nuxt UI preset, and a PrimeVue preset example is added.

## 1.6.1

_2026-11-13_

### Security

- Expressions can no longer reach a prototype, which let a schema change it for the whole page (`config.__proto__.__defineGetter__(…)`). `__proto__`, `prototype`, `constructor` and `__define/lookupGetter/Setter__` are rejected at any depth, written in the expression or worked out as it runs (`a[b]`).

### New

- **`expressions.functions`**: functions expressions can call by their names (`${upper(form.name)}`), for the whole project (the plugin's options) or for one form (its `config`, merged name by name over the project's). See [Expressions](/schema-forms/expressions).

### Documentation

- An [Expressions](/schema-forms/expressions) page.

## 1.6.0 ⚠️

_2026-11-12_

Most forms need no change. The [migration guide](https://github.com/encolajs/encolajs-enforma/blob/master/MIGRATION.md) says what may.

### Breaking changes

- **Expressions are interpreted, never compiled into code.** `${…}` strings are read with [`@andreasnicolaou/typescript-expression-language`](https://github.com/andreasnicolaou/typescript-expression-language), a port of Symfony's ExpressionLanguage, instead of `new Function()`: write them in its syntax, not JavaScript's. Forms work under a Content Security Policy without `'unsafe-eval'`. `form` in an expression reads copies of the form's values and can't change them.
- **Each form's events are its own.** `<Enforma>` and `HeadlessForm` sent their events through one emitter every form on the page shared, and never removed their listeners: two forms on a page heard each other's events. Each form now has its own emitter, removed with it.
- **Vue 3.3** or later.

### New

- **`expressions.only`** limits which schema keys are evaluated: `{ expressions: { only: ['if'] } }` keeps every other string as text.
- **A form's `config` reaches its fields, sections and buttons**, so two forms on one page can use different field components. Components in a config are taken as they are, never merged.
- **A changed `schema` or `context`** updates the form without remounting it.
- **`provideEnformaForm()`** renders Enforma's schema under a form controller you made with `useForm()`.
- New exports: `EnformaSchema`, `EnformaSection`, `useEnformaField`, `provideEnformaForm`, `formFieldSlotsKey`, `fieldRulesCollectorKey`.
- Without `EnformaPlugin`, the schema, sections, fields and buttons fall back to Enforma's own components.
- `@nuxt/ui` and `reka-ui` are optional peer dependencies.

### Fixes

- The types path of `validators/encola`, a schema entry's optional `type`, `inputComponent` typed as a component, the buttons' content without a preset, and a stray Vuetify import.

## 1.5.0

_2026-11-03_

### New

- The preset Field components are built and exported: `@encolajs/enforma/presets/<preset>/Field` for Vuetify, Quasar, Reka UI and Nuxt UI, as their guides import them.

### Fixes

- `require()` works: the package is `"type": "module"`, so its CommonJS builds are `.cjs` files now. Node loaded them as ES modules, and `require()` of any entry point failed.
- A submit button drawn with a UI library's button (`pt.submit.as`) submits the form. The `as` option was also passed to the button, which drew a nested copy of itself: Nuxt UI's inner `UButton` was `type="button"`. `useFormConfig()` gives `getPassThroughProps()`, the pass-through props without `as`.
- Nuxt UI preset: inputs show their errors (`highlight`, `color: 'error'`), and labels, help and errors take Nuxt UI 4's colors.
- `repeatable_table_props` transformers get the form's config, not `undefined`.
- Schema Builder: the "Field" and "Section" buttons work, and the open items stay open as the schema changes.
- Type errors reported by the declaration build.

### Documentation

- The Nuxt UI setup for Vue apps follows Nuxt UI's own, and examples import the presets the right way.
- The menu is ordered by how the pages are used.

## 1.4.0

_2025-10-30_

### New

- **Nuxt UI and Reka UI presets.** See the [Nuxt UI](/ui-library-integration/nuxtui-preset) and [Reka UI](/ui-library-integration/rekaui-preset) guides, with live examples.

## 1.3.0

_2025-10-23_

Existing forms keep working, with deprecation warnings in development. The [migration guide](/migration-guide-1_3) shows how to move to validators.

### New

- **Validators other than `@encolajs/validator`**: Zod, Yup and Valibot, each through its own entry point (`@encolajs/enforma/validators/zod`…), so only those you use are bundled.
- A `:validator` prop on `HeadlessForm` and the other form components, and a validator as `useForm()`'s second argument.
- The `FormValidator` interface, to write a validator of your own.
- The validation libraries are optional peer dependencies: install the ones you use.

### Deprecated

- Passing a rules object to `useForm()`, and the `:rules` and `:customMessages` props of `HeadlessForm`. Give a validator instead (`createEncolaValidator(rules, messages)` keeps `@encolajs/validator`'s rules).
