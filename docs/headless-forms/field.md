# `<HeadlessField>` component

<!-- 
This page should provide:
1. Overview of useField composable and HeadlessField component
2. API reference for returned properties and methods
3. Basic implementation examples for different input types
4. Field state management
5. Handling field-level validation
6. Integration with parent form
7. Common patterns and best practices
8. Advanced usage examples
-->

<TabNav :items="[
{ label: 'Usage', link: '/headless-forms/field' },
{ label: 'API', link: '/headless-forms/field_api' },
]" />

This is a field component that provides no UI, just the field state and logic.

##### :notebook_with_decorative_cover: For a fully working example check out the [Headless components example](/examples/headless-components)

> [!IMPORTANT] The component must be used within an `EncolaForm` or `HeadlessForm` component

## Single input example

This is the most common scenario when the `<HeadlessField>` component renders one input field. 

```html
<HeadlessField :name="email">
  <template #default="fieldCtrl">
    <label :for="fieldCtrl.id">Email<sup>*</sup></label>
    <input
     
      :value="fieldCtrl.value"
      :attrs="fieldCtrl.attrs"
      :events="fieldCtrl.events"
      :id="fieldCtrl.id"
      <!-- here you can add your own binding -->
    />
    <div v-if="fieldCtrl.error"
         :id="fieldCtrl.attrs['aria-errormessage']"
         class="text-red-500">
      {{ fieldCtrl.error }}
    </div>
  </template>
</HeadlessField>
```

You can read more about what the "field controller" does in the [`field API`](/headless-forms/field_api.md)  section

## Multiple inputs example

There are situations when you need to render multiple inputs that work together (eg: a range). In this case, you should use multiple HeadlessField components:

```html
<div>
  <label>Salary range<sup>*</sup></label>
  <div class="flex gap-2">
    <HeadlessField name="salary.min">
      <template #default="fieldCtrl">
        <input
          type="text"
          placeholder="min"
          :value="fieldCtrl.value"
          v-bind="fieldCtrl.attrs"
          v-on="fieldCtrl.events"
          :id="fieldCtrl.id"
        />
      </template>
    </HeadlessField>
    
    <HeadlessField name="salary.max">
      <template #default="fieldCtrl">
        <input
          type="text"
          placeholder="max"
          :value="fieldCtrl.value"
          v-bind="fieldCtrl.attrs"
          v-on="fieldCtrl.events"
          :id="fieldCtrl.id"
        />
      </template>
    </HeadlessField>
  </div>
  <div v-if="form['salary.min.$errors']?.length || form['salary.max.$errors']?.length"
       class="text-red-500">
    {{ form['salary.min.$errors']?.[0] || form['salary.max.$errors']?.[0] }}
  </div>
</div>
```

For complex field combinations, you can also create wrapper components that encapsulate multiple fields, as shown in the [Headless components example](/examples/headless-components).
