---
name: enforma
description: Enforma (@encolajs/enforma) forms for Vue 3. Use when a project depends on @encolajs/enforma, or a task adds or changes an Enforma form, form schema, UI preset setup or form validation, or chases an [Enforma] console message.
license: MIT
---

# Enforma

Written for `@encolajs/enforma` 1.7. For anything this file doesn't cover, look it up in the docs (Context7 library `/encolajs/encolajs-enforma`, or https://encolajs.com/enforma/) and in the installed types, `node_modules/@encolajs/enforma/dist/*.d.ts`.

## Steps

1. **Read the project's setup.** Find the UI kit and validator in `package.json`, the `app.use(EnformaPlugin)` and `use<Kit>Preset(...)` calls (in `main.ts`, or a Nuxt plugin), and an existing form. Done when you know the kit, the validator and the mode the project's forms already use.
2. **Pick the mode** from the table below. Match the project's existing forms unless the task calls for another mode.
3. **Write the form** with the reference below.
4. **Check it in the running app or a test.** Done when the form renders, an invalid submit shows errors on the right fields and calls no `submitHandler`, a valid submit reaches `submitHandler`, and the console has no `[Enforma]` message.

## Modes

| Mode | Fits | Built with |
|------|------|-----------|
| Field form | a fixed form laid out in the template | `<Enforma>` with `<EnformaField>`, `<EnformaRepeatable>`, `<EnformaRepeatableTable>`, `<EnformaSection>` |
| Schema form | a form described by data: from the server, or many similar forms | `<Enforma :schema>` |
| Mixed | a schema with a few parts written by hand | `<Enforma :schema>` plus field slots (docs: Mixed Forms, Field Slots) |
| Headless | full control over the markup | `<HeadlessForm>`, `<HeadlessField>`, `<HeadlessRepeatable>`, or `useForm`, `useField`, `useRepeatable` |

`<Enforma>` takes `data`, `validator`, `submitHandler`, and `schema` for schema forms. It renders the submit and reset buttons itself.

## Setup: plugin and preset

```ts
import { EnformaPlugin } from '@encolajs/enforma'
import usePrimeVuePreset from '@encolajs/enforma/presets/primevue'
import { InputText, Select } from 'primevue'

app.use(EnformaPlugin)
usePrimeVuePreset({ input: InputText, text: InputText, select: Select })
```

| Kit | Preset (default export of `@encolajs/enforma/presets/<kit>`) | Field component in templates |
|-----|------|------|
| PrimeVue | `usePrimeVuePreset({ ... })`: pass the PrimeVue components the forms use, keyed by `inputComponent` name | `EnformaField` |
| Vuetify | `useVuetifyPreset()` | `VuetifyField` from `@encolajs/enforma/presets/vuetify/Field` |
| Quasar | `useQuasarPreset()` | `QuasarField` from `@encolajs/enforma/presets/quasar/Field` |
| Reka UI | `useRekauiPreset({ input: MyInput, ... })`: Reka UI is headless, so pass the project's own wrapper components | `RekauiField` from `@encolajs/enforma/presets/rekaui/Field` |
| Nuxt UI | `useNuxtUIPreset({ input: UInput, select: USelect, ..., tabs: UTabs, collapsible: UCollapsible, badge: UBadge })`, in a Nuxt plugin with components from `#components` | `NuxtUIField` from `@encolajs/enforma/presets/nuxtui/Field` |

Schema forms and repeatables pick the kit's field component up from the preset; the table's last column is for fields written in a template. A field chooses its input with `inputComponent`: a name the preset maps (`'input'`, `'select'`, `'datepicker'`, `'toggle'`, `'switch'`, ...) or a component. Its props go in `inputProps`.

## Validation

Give the form a validator through the `validator` prop (or `useForm(data, validator)`). The validator's library is an optional peer dependency the project installs itself.

| Library | Factory, from `@encolajs/enforma/validators/<name>` |
|---------|---------|
| @encolajs/validator | `createEncolaValidator(rules, messages?)` from `encola` |
| Zod | `createZodValidator(z.object({ ... }))` from `zod` |
| Yup | `createYupValidator(object({ ... }))` from `yup` |
| Valibot | `createValibotValidator(v.object({ ... }))` from `valibot` |

@encolajs/validator rules are pipe strings keyed by path:

```ts
createEncolaValidator(
  {
    email: 'required|email',
    'salary.max': 'number|gt:@salary.min', // @path reads another field
    'addresses.*.street': 'required', // * is every item of a repeatable
  },
  { 'email:required': 'Enter your email' } // messages: 'path:rule'
)
```

Server errors: in `submitHandler(data, formController)`, call `formController.setErrors({ path: ['message'] })`, then `formController.focusFirstError()`. Throw to signal a failed submit; the return value is ignored.

## Schema

A schema is a flat object keyed by field path. Nesting comes from the paths and from `section`, never from nested objects:

```ts
const schema = {
  name: { type: 'field', label: 'Name', required: true },
  'address.city': { label: 'City' }, // type defaults to 'field'
  extra: { type: 'section', title: 'Other addresses', titleComponent: 'h3' },
  addresses: {
    type: 'repeatable', // or 'repeatable_table'
    section: 'extra',
    subfields: { street: { label: 'Street' }, city: { label: 'City' } },
  },
  note: { type: 'content', section: 'extra', component: MyNote },
}
```

- `section` places an entry in a section; `position` orders fields and sub-sections together.
- A section with `component: 'tabs'` turns its sub-sections into tabs, and `component: 'collapsible'` makes it open and close (`props: { open: false }`).
- `if` and other props take expressions: the whole string is one `'${...}'`, written in Symfony ExpressionLanguage over `form`, `context` and `config` (`'${form.type == "business"}'`, strings joined with `~`).

## Gotchas

- A section shows its `title` only when it also has a `titleComponent`. Tabs and collapsibles show theirs without one.
- `required: true` on a field draws the required marker; the validator decides what is required.
- Schema `rules` and `messages` keys work only with @encolajs/validator, and only on a form without a `validator` prop: a `validator` replaces them, and Enforma warns that the schema's rules are left out.
- Vuetify, Quasar, Reka UI and Nuxt UI inputs emit `update:modelValue`; their kit field components already set `useModelValue`. A custom input that emits only `update:modelValue` needs `useModelValue: true`.
- `<HeadlessField>` belongs inside `<HeadlessForm>` or `<Enforma>`. Its slot gives `{ id, value, attrs, events, error, model }`: bind `v-bind="attrs" v-on="events"`.
- Import from `@encolajs/enforma` and its subpaths. Some docs pages embed Enforma's own source, which imports from `@/...`; that alias exists only inside Enforma.
