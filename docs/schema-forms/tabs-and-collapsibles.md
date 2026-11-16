<script setup>
import TabsAndCollapsiblesExample from '../examples/features/TabsAndCollapsiblesExample.vue'
</script>

# Tabs and Collapsibles

A long form reads better split into tabs, with the parts few people fill in folded away in collapsible sections. Both are sections of the schema: a section names how it is drawn with `component`, and every preset draws `tabs` and `collapsible` with its UI library's own widgets.

The form keeps track of the errors inside them. Each tab and collapsible shows how many of its fields have errors, and a refused submit opens the tab and the collapsible holding the first field with errors before it scrolls to that field and focuses it.

## Live Example

The form opens on the Preferences tab. Press **Submit** with the form empty: it switches to the Profile tab and focuses Name, and each tab shows how many errors it holds. Fill in the Profile tab and the IBAN, then submit again: the form opens the Billing tab, then the closed Company details section, and focuses the VAT number.

<ClientOnly>
    <LiveDemo :component="TabsAndCollapsiblesExample"></LiveDemo>
</ClientOnly>

::: code-group
<<< @/examples/features/TabsAndCollapsiblesExample.vue
:::

## Tabs

A section with `component: 'tabs'` draws its sub-sections as tabs. Each tab is labelled with its sub-section's `title` (its name without one), and its panel starts with the sub-section's `description`. Fields and content placed in the tabs section itself are drawn above the tabs.

```js
const schema = {
  account: {
    type: 'section',
    component: 'tabs',
    props: { active: 'billing', orientation: 'vertical' },
  },
  profile: { type: 'section', section: 'account', title: 'Profile' },
  name: { section: 'profile', label: 'Name' },
  billing: { type: 'section', section: 'account', title: 'Billing' },
  iban: { section: 'billing', label: 'IBAN' },
}
```

`props.active` names the tab open at first (the first tab without it), and `props.orientation` lays the tabs out `horizontal` (by default) or `vertical`, beside their panels. A sub-section hidden by its `if` loses its tab; when the open tab hides, the first one opens.

## Collapsible Sections

A section with `component: 'collapsible'` opens and closes with its title. It starts open, unless `props.open` is `false`. Its `description` is shown under its title, so it can be read while the section is closed.

```js
const schema = {
  company: {
    type: 'section',
    component: 'collapsible',
    title: 'Company details',
    description: 'For invoices made out to a company',
    props: { open: false },
  },
  vat: { section: 'company', label: 'VAT number' },
}
```

A collapsible can sit inside a tab, as in the example, and tabs inside a collapsible.

## Errors

The count of errors in a tab or a collapsible appears as its fields are checked (on blur, by default, and on submit) and goes away as they are fixed. Screen readers hear it as "2 errors", through the form's translation function (`'1 error'` and `'{count} errors'`).

When a submit is refused, the form goes to the first field with errors on the page, opening the tabs and collapsibles that hold it, the outermost first. Errors from the server don't move the page: call `focusFirstError()` after `setErrors()`. To leave the page as it is on a refused submit, set `behavior.focusFirstError: false`. See [Going to the first field with errors](/core-concepts/validation#going-to-the-first-field-with-errors).

Every panel is drawn, and the closed ones are only hidden, so the fields of a tab never opened are checked too. Keep it that way in a tabs component of your own (see [Which fields are checked](/core-concepts/validation#which-fields-are-checked)).

## In Each UI Library

| Preset | Tabs | Collapsible | Count of errors |
|--------|------|-------------|-----------------|
| Default | Enforma's own, unstyled | Enforma's own, unstyled | `span` |
| [Nuxt UI](/ui-library-integration/nuxtui-preset#tabs-and-collapsible-sections) | `UTabs` | `UCollapsible` with a `UButton` | `UBadge` |
| [PrimeVue](/ui-library-integration/primevue-preset#tabs-and-collapsible-sections) | `Tabs` | toggleable `Panel` | `Badge` |
| [Vuetify](/ui-library-integration/vuetify-preset#tabs-and-collapsible-sections) | `VTabs` and `VTabsWindow` | `VExpansionPanels` | `VChip` |
| [Quasar](/ui-library-integration/quasar-preset#tabs-and-collapsible-sections) | `QTabs` | `QExpansionItem` | `QBadge` |
| [Reka UI](/ui-library-integration/rekaui-preset#tabs-and-collapsible-sections) | `TabsRoot` and its parts | `CollapsibleRoot` and its parts | `span` |

Each preset's page says what it needs: the Nuxt UI preset, for one, uses Nuxt UI's tabs only when the app passes `UTabs`, `UCollapsible` and `UBadge` to it.

## Your Own

- To draw `tabs` and `collapsible` sections with other widgets, register components of your own under those names: `useEnformaTabs()` and `useEnformaCollapsible()` give them what they need. See [Tabs and collapsibles of your own](/extensibility/custom-components#tabs-and-collapsibles-of-your-own).
- In a form written by hand, wrap the content of your own tabs and panels in `<EnformaPanel>`: a refused submit opens them, and they count their errors. See [Panels of your own](/extensibility/custom-components#panels-of-your-own).
