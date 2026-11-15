<script setup>
import ModalForm from './form-in-modal/ModalForm.vue'
import PageHeaderForm from './form-in-modal/PageHeaderForm.vue'
</script>

# Buttons Outside the Form

Some designs put a form's buttons outside the form:

- a modal or a drawer has Save in its footer, below the body that holds the form;
- a page has Save on the same row as its title, above the form.

Hide the form's own buttons with `:show-submit-button="false"`, take a ref to the `<Enforma>`, and give it to `<EnformaSubmitButton>` (and `<EnformaResetButton>`) through their `form` prop:

```vue
<template>
  <Enforma ref="form" :schema="schema" :data="data" :show-submit-button="false" />

  <!-- somewhere else in the same component: a footer, a page header -->
  <EnformaSubmitButton :form="form" />
</template>

<script setup>
import { ref } from 'vue'

const form = ref(null)
</script>
```

The submit button names the form by its id (`<button type="submit" form="…">`), so the browser treats it as the form's own:

- clicking it submits the form, and so does pressing Enter in a field;
- it's disabled, and shows it's submitting, while the form submits;
- it's disabled until the form has mounted (the ref is `null` until then).

The reset button resets the form's values. Neither needs anything from the schema: this works the same for a schema form and a form of `<EnformaField>`s.

The form gets an id of its own. Give it one with `<Enforma id="…">` if you need to know it.

## In a Modal

The Save button is in the modal's footer. The modal closes on `submit_success`, so it stays open while the form shows errors, those of the validator and those your API sends back (`formController.setErrors()` in the submit handler).

<ClientOnly>
    <LiveDemo :component="ModalForm"></LiveDemo>
</ClientOnly>

## Beside the Page Title

Save and Discard are on the title's row. After a save, the submit handler calls `formController.commit()`, so Discard goes back to what was saved.

<ClientOnly>
    <LiveDemo :component="PageHeaderForm"></LiveDemo>
</ClientOnly>

## Source code

::: code-group
<<< @/recipes/form-in-modal/ModalForm.vue [Modal]
<<< @/recipes/form-in-modal/PageHeaderForm.vue [Page header]
:::

## When Another Component Has the Spot

Sometimes the spot for the button belongs to another component, like a header that your layout renders around the page. Move the button there with Vue's `<Teleport>`, and still give it the form:

```vue
<template>
  <Enforma ref="form" :schema="schema" :data="data" :show-submit-button="false" />

  <!-- the layout renders <div id="page-actions"> -->
  <Teleport defer to="#page-actions">
    <EnformaSubmitButton :form="form" />
  </Teleport>
</template>
```

`defer` (Vue 3.5+) waits for the target to render, when it renders at the same time as the page.

## A Form of Your Own

A component that makes its own controller with `useForm()` and renders its own `<form>` ([see `provideEnformaForm()`](/extensibility/custom-components#rendering-a-schema-under-your-own-form-controller)) gives the controller to the button, and binds `$formAttrs` to its `<form>`, as that's where the form's id is:

```vue
<template>
  <form v-bind="controller.$formAttrs" novalidate @submit.prevent="controller.submit()">
    <EnformaSchema :schema="schema" />
  </form>

  <EnformaSubmitButton :form="controller" />
</template>
```

## Your Own Button Component

The submit button renders the component in `pt.submit.as` (your UI library's button, in a preset). That component must pass the `form` and `type` attributes on to its `<button>`, which the buttons of PrimeVue, Vuetify, Quasar and Nuxt UI do. A button rendered as a link (given `href` or `to`) can't submit a form.

In development, a click on a submit button that no `<form>` owns logs a warning.
