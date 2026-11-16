<script setup>
import FieldsTabsExample from '../examples/enforma/FieldsTabsExample.vue'
</script>

# Tabs and Collapsibles

In a form with fields you draw the tabs and the collapsibles yourself, with your UI library's components. Enforma doesn't know which of your fields they hide until you tell it: wrap the content of each tab and collapsible in an `<EnformaPanel>`, giving it a panel made with `useEnformaPanel()`.

Then a refused submit opens the tab and the collapsible holding the first field with errors, before it scrolls to that field and focuses it. `focusField()` and `focusFirstError()` do the same, and each panel counts the errors of the fields inside it, for its tab or its header to show.

A form drawn from a schema needs none of this: its `tabs` and `collapsible` sections are wired already (see [Tabs and Collapsibles](/schema-forms/tabs-and-collapsibles) in schema forms).

## Live Example

The form opens on the Billing tab. Press **Submit** with the form empty: it switches to the Profile tab and focuses Name. Fill in the Profile tab and the IBAN, then submit again: the form opens the Billing tab, then the closed Company details, and focuses the VAT number.

<ClientOnly>
    <LiveDemo :component="FieldsTabsExample"></LiveDemo>
</ClientOnly>

::: code-group
<<< @/examples/enforma/FieldsTabsExample.vue
:::

## Keep the Panels Mounted

A form checks the fields whose component is mounted (see [Which fields are checked](/core-concepts/validation#which-fields-are-checked)). A tab never opened, or a collapsed panel, whose content isn't mounted has fields nobody checks: the form can't go to them. Keep the content mounted and hidden, which most UI libraries do with a prop:

| UI library | Tabs | Collapsibles and accordions |
|------------|------|-----------------------------|
| Nuxt UI | `<UTabs :unmount-on-hide="false">` | `<UCollapsible>`, `<UAccordion>` with `:unmount-on-hide="false"` |
| Reka UI | `<TabsRoot :unmount-on-hide="false">` | `<CollapsibleRoot>`, `<AccordionRoot>` with `:unmount-on-hide="false"` |
| PrimeVue | `<Tabs>`, leaving `lazy` off | `<Accordion>`, leaving `lazy` off, or a toggleable `<Panel>` |
| Vuetify | `eager` on each `<VTabsWindowItem>` | `<VExpansionPanels eager>` |
| Quasar | `<QTabPanels>` draws the open panel only: draw the panels yourself, with `v-show`, under `<QTabs>` | `<QExpansionItem>` |
| Your own | `v-show`, the `hidden` attribute | `v-show`, the `hidden` attribute |

## A Panel for Each Tab and Collapsible

`useEnformaPanel({ reveal })` makes a panel. `reveal` opens it: it makes its tab the open one, or opens its collapsible, through the state your components already use.

```js
const tab = ref('profile')
const companyOpen = ref(false)

const panels = {
  profile: useEnformaPanel({ reveal: () => { tab.value = 'profile' } }),
  billing: useEnformaPanel({ reveal: () => { tab.value = 'billing' } }),
}
const company = useEnformaPanel({ reveal: () => { companyOpen.value = true } })
```

The component drawing the tabs makes the panels: a tab's header sits outside the tab's content, and both need its panel.

## Wrap the Content in EnformaPanel

`<EnformaPanel :panel>` draws its content, and nothing of its own. The fields inside it, at any depth, belong to its panel.

```vue
<template #billing>
  <EnformaPanel :panel="panels.billing">
    <EnformaField name="iban" label="IBAN" />
  </EnformaPanel>
</template>
```

Give an `<EnformaPanel>` the same panel for as long as it is drawn.

## Show the Count of Errors

A panel's `errorCount` is the number of fields inside it that have errors. It follows each check, each fix and `reset()`. `<EnformaErrorBadge :count>` shows it, and nothing while there are none; screen readers hear it as "2 errors". Give it your UI library's badge with `as`, and the badge's props:

```vue
<template #trailing="{ item }">
  <EnformaErrorBadge :as="UBadge" color="error" size="sm" :count="panels[item.value].errorCount" />
</template>
```

## Panels Inside Panels

A collapsible inside a tab, or tabs inside a collapsible, is an `<EnformaPanel>` inside another. A field inside both counts in both, and the form opens the outer one first, then the inner one. In the example, the VAT number counts in the Billing tab and in Company details.

## Panels Made in a Loop

`useEnformaPanel()` needs no `setup()`: make the panels as you make the tabs, keeping one for each tab.

```js
const tabs = computed(() => sections.value.map((section) => section.name))
const panels = new Map()
function panelFor(name) {
  if (!panels.has(name)) {
    panels.set(name, useEnformaPanel({ reveal: () => { tab.value = name } }))
  }
  return panels.get(name)
}
```

## Errors from the Server

Errors your code sets, such as the server's, don't move the page. Go to the first of them with `focusFirstError()`, which opens their tab and collapsible as a refused submit does:

```js
formController.setErrors(response.errors)
formController.focusFirstError()
```

To leave the page as it is on a refused submit, set `behavior.focusFirstError: false` (see [Going to the first field with errors](/core-concepts/validation#going-to-the-first-field-with-errors)).
