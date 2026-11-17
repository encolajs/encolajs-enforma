# Changelog

The changes of each version since 1.3.0, the latest first. A version marked ⚠️ changes something your forms may rely on: read its breaking changes before you upgrade.

## 1.7.2

_2026-11-17_

### Fixes

- **The types work under `"moduleResolution": "node16"` and `"nodenext"`**, which `tsc --init` sets up since TypeScript 5.9. The declarations imported each other without file extensions, which these modes can't resolve: `isPlainObject`, `resolveValue` and the other helpers were missing, and `Enforma`, `useForm`, `FormSchema`, the validators and almost everything else were `any`. Apps using `"moduleResolution": "bundler"` (Vite, Nuxt) already had the right types.
- **CommonJS apps get types for what `require()` loads.** An app compiled to CommonJS under `node16` or `nodenext` was given the types of the ES module build: under `node16` TypeScript refused to import the package and the validators, and it found no types for the presets. Each entry now has declarations of its own for `require()`. A preset and a preset's `Field` are typed as what `require()` gives, the function and the component themselves, so importing them by default works.

### Changes

- Code that compiled only because those types were `any` may now report type errors.

## 1.7.1

_2026-11-16_

### Fixes

- **A field named like one of the form controller's methods has its value.** A field named `track`, `commit`, `reset`, `values` or after any other method got the method as its value: a "track" switch stayed on whatever the user did, and a text field showed the method's code. Fields read their values with `getFieldValue()`. `controller[path]` still gives the method for such a name: read values with `getFieldValue(path)`.
- **A field that hides stays out of the form.** A field hidden by its `if` just after the user left it, or while its input had focus, came back to the form: its scheduled check, or the blur the browser fires as a focused input is removed, gave it a state again. `validate()` then checked a field nobody saw and refused the form.
- **Server-rendered forms hydrate.** Field ids were random, so they differed between the server and the browser. A field's id is now the form's id and its path (`signup__address.city`); a form's made-up id is the same on both on Vue 3.5+. Tabs' and collapsibles' ids start with the form's id too.
- **`focusField()` finds an input that has an id of its own.** It looks for the element with the field's id, then the one the field's label names, then the first element in the field that takes focus. `useEnformaField()` takes an `input` option for a field component that knows its input.
- **Errors set by `setErrors()` stay until the field changes.** A server's error went as soon as the field was checked again, when the user left it without changing anything, or when a check that began before the reply ended after it. Errors set by code are now kept apart from the rules' own: they go as the field's value changes, or as the form is submitted again, reset or committed. A check of the rules shows its errors before them, and `validate()` says `false` while they show. `setFieldErrors(path, [])` still clears a field's errors.

### Changes

- Field ids are `<form id>__<path>` instead of `field_<path>_<random>`. A field made on a path whose id another field took (a row moved there) gets `-2`, `-3`… after it.

## 1.7.0 ⚠️

_2026-11-16_

Most forms need no change. The [migration guide](https://github.com/encolajs/encolajs-enforma/blob/master/MIGRATION.md) says what may.

### Breaking changes

- **A refused submit goes to the first field with errors.** It opens the tabs and collapsibles holding the field, scrolls it to the middle of the view and focuses its input. It used to leave the page as it was. To keep it that way, set `behavior.focusFirstError: false` in the plugin's options or in a form's `config`. See [Going to the first field with errors](/core-concepts/validation#going-to-the-first-field-with-errors).
- **Root sections are ordered with the root fields by `position`**, as a section's fields and sub-sections are since 1.6.4. A section whose `section` is left out, `null` or empty used to be rendered before every root field; give it a lower `position` than theirs to keep it first. A field with `section: null` is now rendered at the root (it was rendered nowhere), and root sections are rendered inside the root's element.
- **`<EnformaField>` takes no `rules` or `messages`**, and `fieldRulesCollectorKey` is no longer exported. They were read after the form had made its validator, so they were never checked: give the rules to the form (a validator, `<Enforma>`'s `rules` and `messages`, or the schema's). A schema field keeps its `rules` and `messages`.

### New

- **Tabs and collapsible sections.** A section with `component: 'tabs'` draws its sub-sections as tabs, horizontal or vertical (`props.orientation`), opening on `props.active`. A section with `component: 'collapsible'` opens and closes with its title, closed at first with `props.open: false`. Each shows how many errors it holds. Every preset draws them with its UI library's widgets; the Nuxt UI preset does when given `UTabs`, `UCollapsible`, `UButton` and `UBadge`. See [Tabs and Collapsibles](/schema-forms/tabs-and-collapsibles).
- **`focusField(path)` and `focusFirstError()`**, on the form controller and on a ref to `<Enforma>`: go to a field, opening the panels around it. Call `focusFirstError()` after `setErrors()` to go to errors from the server. A `field_focus_requested` listener can answer the request itself by setting `handled`.
- **Panels of your own.** In a form written by hand, wrap the content of your own tabs and collapsibles in `<EnformaPanel :panel="useEnformaPanel({ reveal })">`: a refused submit opens them, and `panel.errorCount` counts their errors. See [Tabs and Collapsibles in forms with fields](/field-forms/tabs-and-collapsibles).
- **`validation_fail` and `onValidationFail` give the failing fields' paths**, in the order they are on the page. `useForm()` and `HeadlessForm` take a `fieldOrder`.
- **Sections drawn by your own components.** A section names its component with `component`: a name in the form's config, a component registered in the Vue app, or a component. Sections gain `description`, `props` and `columns`, and any entry `span`. A section's title is optional, and is drawn only with a `titleComponent`, so a section can just group fields. See [Section components](/schema-forms/schema-reference#section-components).
- **`useEnformaSection()` and `<EnformaSectionItems>`**, for a section component of your own: the section's items in render order, the paths of its fields, and how many of them have errors. `useEnformaTabs()`, `useEnformaCollapsible()` and `<EnformaErrorBadge>` give tabs and collapsibles of your own what Enforma's use. See [Custom Section Components](/extensibility/custom-components#custom-section-components).
- **Content entries.** An entry with `type: 'content'` renders a component among its section's items, by `position`, while its `if` holds. Its props may be expressions, and pass through the new `content_props` transformers. See [Content Schema](/schema-forms/schema-reference#content-schema).
- **`commit(values?)` and `$isChanged`.** `commit()` makes the current values, or those given, the saved ones that `reset()` returns to: Discard after a save no longer brings back what was there before it. `$isChanged` says whether the values differ from the saved ones, and turns false again when a change is undone. Expressions read it as `form.$isChanged`.
- **Buttons outside the form.** Each form has an id (the `id` prop, `useForm({ id })`, or one made up), given as `$formId` and in `$formAttrs`. `<EnformaSubmitButton :form>` and `<EnformaResetButton :form>` act on a form they are outside of, given a ref to the `<Enforma>` or a controller: Save in a modal's footer, or beside a page's title. See [Buttons Outside the Form](/recipes/form-in-modal).
- **Pending work.** `track(promise, path?)` and `beginPending(path?)` make the form wait for work such as an upload. While it runs, `$isPending` (and `form['path.$isPending']` for a field) is true, the submit is refused and the submit button is disabled. Work for a field is dropped as the field leaves its path, and all of it on `reset()`. `useField()` gives `isPending`, `beginPending()` and `track()`. See [Pending Work](/core-concepts/pending-work).
- New exports: `EnformaSectionItems`, `EnformaPanel`, `EnformaTabs`, `EnformaCollapsible`, `EnformaErrorBadge`, `useEnformaSection`, `fieldsInRenderOrder`, `useEnformaPanel`, `useEnformaTabs`, `useEnformaCollapsible`, `errorCountText`, `visuallyHidden`, and the types that go with them, `PendingHandle`, `FocusTarget` and `ContentSchema`.

### Changes

- The presets import their UI library from your app instead of bundling a copy of their own, which your app's config, theme and plugin didn't reach: `presets/primevue.js` goes from 545 KB to 65 KB, `presets/quasar.js` from 728 KB to 66 KB. The schema builder, in the main entry, still brings its own PrimeVue.

### Fixes

- An untouched field drawn by the form's `field(x)` slot is checked. A required one let the submit through.
- A ref to `<Enforma>` or `<HeadlessForm>` reads the form's state as it changes. `$isSubmitting` and `$isDirty` read `undefined`, and `$formAttrs` stayed as it was on mount.
- A field's custom `inputComponent` stays mounted as the field's value changes. It was mounted afresh on every change and lost its state, such as a file input's file.
- Quasar preset: the field's id reaches `QInput`'s native input, so its label points at it and it can be focused.
- The schema builder accepts a section without a title.

### Documentation

- [Tabs and Collapsibles](/schema-forms/tabs-and-collapsibles) pages for schema forms and [forms with fields](/field-forms/tabs-and-collapsibles), and a larger [example](/examples/tabs-and-collapsibles).
- A [Pending Work](/core-concepts/pending-work) page and a [File Upload](/recipes/file-upload) recipe.
- The "Form in Modal" recipe becomes [Buttons Outside the Form](/recipes/form-in-modal).
- The encola validator's custom messages are keyed `path:rule`, and the examples use rules it has (`min_length`, not `min`).
- The outdated `EnformaSchema` page is removed: render a schema with `<Enforma :schema>`.
- This changelog.

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

Existing forms keep working, with deprecation warnings in development.

### New

- **Validators other than `@encolajs/validator`**: Zod, Yup and Valibot, each through its own entry point (`@encolajs/enforma/validators/zod`…), so only those you use are bundled.
- A `:validator` prop on `HeadlessForm` and the other form components, and a validator as `useForm()`'s second argument.
- The `FormValidator` interface, to write a validator of your own.
- The validation libraries are optional peer dependencies: install the ones you use.

### Deprecated

- Passing a rules object to `useForm()`, and the `:rules` and `:customMessages` props of `HeadlessForm`. Give a validator instead (`createEncolaValidator(rules, messages)` keeps `@encolajs/validator`'s rules).
