<script setup>
import ApplicationFormExample from './features/ApplicationFormExample.vue'
</script>

# Form with Tabs and Collapsibles

> A job application drawn from a schema, split into tabs, with the parts few people fill in folded away in collapsible sections. A refused submit opens the tab and the collapsible holding the first field with errors, and goes to it.

This example puts together:

1. **A field above the tabs**: Applying as belongs to the tabs section itself, so it is drawn above the tabs
2. **A tab shown on a condition**: choose Company and a Company tab appears, its fields checked only while it shows
3. **A closed collapsible inside a tab**: Address in Applicant, Billing contact in Company
4. **A repeatable inside a tab**: each job's fields count in the Experience tab
5. **Tabs inside a tab**: Preferences holds vertical tabs of its own
6. **Errors from the server**: they open what hides the field, through `focusFirstError()`

Try it:

- Press **Submit** with the form empty. The Applicant tab opens and Name is focused; each tab shows how many errors it holds, the Address collapsible too, since City is required.
- Fill in Name, Email and City, then submit: the Experience tab opens on the first job.
- Fill in the job, then submit: the Preferences tab opens, then its Notifications tab, on Email me.
- Choose Company and submit again: the Company tab counts its errors and opens on Company name.
- Press **Simulate errors from the server**: the Applicant tab and the Address collapsible open on City, with the server's error.

<ClientOnly>
    <LiveDemo :component="ApplicationFormExample"></LiveDemo>
</ClientOnly>

::: code-group
<<< @/examples/features/ApplicationFormExample.vue
:::

See [Tabs and Collapsibles](/schema-forms/tabs-and-collapsibles) for the schema's tabs and collapsible sections, and [Tabs and Collapsibles in forms with fields](/field-forms/tabs-and-collapsibles) to wire tabs of your own.
