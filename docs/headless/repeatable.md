# `<HeadlessRepeatable>` component

<!-- 
This page should provide:
1. Overview of useRepeatable composable and HeadlessRepeatable component
2. API reference for returned properties and methods
3. Basic implementation examples for array handling
4. Array operations (add, remove, move)
5. Validation within repeatable fields
6. Integration with parent form
7. Common patterns and best practices
8. Advanced usage examples
-->

<TabNav :items="[
{ label: 'Usage', link: '/headless/repeatable' },
{ label: 'API', link: '/headless/repeatable_api' },
]" />

The `<HeadlessRepeatable>` component provides a way to handle repeatable form fields (arrays) with no built-in UI. It manages the state and logic for array operations while allowing complete control over the presentation.

##### :notebook_with_decorative_cover: For a fully working example check out the [Headless components example](/examples/headless-components)

> [!IMPORTANT]
> The component must be used within an `EncolaForm` or `HeadlessForm` component

## Basic Usage

Here's a simple example of using `<HeadlessRepeatable>` to manage a list of skills:

```html
<HeadlessRepeatable name="skills" :min="0" :max="5">
  <template #default="{ value, add, remove, canAdd, canRemove, moveUp, moveDown, count }">
    <div v-for="(skill, index) in value" :key="index">
      <HeadlessField :name="`skills.${index}.name`">
        <template #default="{ attrs, events, id }">
          <input
            :id="id"
            v-bind="attrs"
            v-on="events"
          />
        </template>
      </HeadlessField>
      
      <button v-if="canRemove" @click="remove(index)">Remove</button>
      <button v-if="index > 0" @click="moveUp(index)">Move Up</button>
      <button v-if="index < count - 1" @click="moveDown(index)">Move Down</button>
    </div>
    
    <button v-if="canAdd" @click="add()">Add Skill</button>
  </template>
</HeadlessRepeatable>
```

## Table Layout Example

For less complex data structures, you might want to use a table layout:

```html
<HeadlessRepeatable name="skills" :min="0" :max="5">
  <template #default="{ value, add, remove, canAdd, moveUp, moveDown, count }">
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Level</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(skill, index) in value" :key="index">
          <td>
            <HeadlessField :name="`skills.${index}.name`">
              <template #default="{ attrs, events, id }">
                <input :id="id" v-bind="attrs" v-on="events" />
              </template>
            </HeadlessField>
          </td>
          <td>
            <HeadlessField :name="`skills.${index}.level`">
              <template #default="{ attrs, events, id }">
                <select :id="id" v-bind="attrs" v-on="events">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </template>
            </HeadlessField>
          </td>
          <td>
            <button v-if="canRemove" @click="remove(index)">Remove</button>
            <button v-if="index > 0" @click="moveUp(index)">↑</button>
            <button v-if="index < count - 1" @click="moveDown(index)">↓</button>
          </td>
        </tr>
      </tbody>
    </table>
    <button v-if="canAdd" @click="add()">Add Skill</button>
  </template>
</HeadlessRepeatable>
```

## Validation

The component supports validation through the parent form. You can validate on add or remove operations.

> [!IMPORTANT]
> The validation refers to the array, not individual fields/items. For example if you want to have between 3 and 5 skills and you set up validation rules for this, you can use this props to validate the skills on add/remove/both/none

```html
<HeadlessRepeatable 
  name="skills" 
  :min="1" 
  :max="5"
  :validate-on-add="true"
  :validate-on-remove="true"
>
  <!-- ... template content ... -->
</HeadlessRepeatable>
```

## Default Values

You can provide default values for new items:

```html
<HeadlessRepeatable 
  name="skills" 
  :default-value="{ name: '', level: 'beginner' }"
>
  <!-- ... template content ... -->
</HeadlessRepeatable>
```

## Best Practices

1. Always provide a `:key` binding when iterating over items using `v-for`
2. Use appropriate min/max values to prevent invalid states
3. Consider using validation to ensure data integrity
4. Implement proper error handling and user feedback
5. Use semantic HTML elements for better accessibility
6. Consider mobile responsiveness when designing the layout

## Common Patterns

### Grid Layout

For complex forms with multiple fields per item:

```html
<HeadlessRepeatable name="experience" :min="0" :max="10">
  <template #default="{ value, add, remove, canAdd, moveUp, moveDown, count }">
    <div v-for="(exp, index) in value" :key="index" class="grid grid-cols-2 gap-4">
      <HeadlessField :name="`experience.${index}.company`" label="Company">
        <template #default="{ attrs, events, id }">
          <input :id="id" v-bind="attrs" v-on="events" />
        </template>
      </HeadlessField>
      
      <HeadlessField :name="`experience.${index}.position`" label="Position">
        <template #default="{ attrs, events, id }">
          <input :id="id" v-bind="attrs" v-on="events" />
        </template>
      </HeadlessField>
      
      <!-- Action buttons -->
      <div class="col-span-2">
        <button v-if="canRemove" @click="remove(index)">Remove</button>
        <button v-if="index > 0" @click="moveUp(index)">Move Up</button>
        <button v-if="index < count - 1" @click="moveDown(index)">Move Down</button>
      </div>
    </div>
    
    <button v-if="canAdd" @click="add()">Add Experience</button>
  </template>
</HeadlessRepeatable>
```

### Nested Repeatables

For complex nested data structures:

```html
<HeadlessRepeatable name="sections" :min="1">
  <template #default="{ value, add, remove, canAdd, moveUp, moveDown, count }">
    <div v-for="(section, index) in value" :key="index">
      <HeadlessField :name="`sections.${index}.title`">
        <template #default="{ attrs, events, id }">
          <input :id="id" v-bind="attrs" v-on="events" />
        </template>
      </HeadlessField>
      
      <HeadlessRepeatable :name="`sections.${index}.items`" :min="1">
        <template #default="{ value: items, add: addItem, remove: removeItem }">
          <div v-for="(item, itemIndex) in items" :key="itemIndex">
            <HeadlessField :name="`sections.${index}.items.${itemIndex}.content`">
              <template #default="{ attrs, events, id }">
                <input :id="id" v-bind="attrs" v-on="events" />
              </template>
            </HeadlessField>
            <button @click="removeItem(itemIndex)">Remove Item</button>
          </div>
          <button @click="addItem()">Add Item</button>
        </template>
      </HeadlessRepeatable>
      
      <button v-if="canRemove" @click="remove(index)">Remove Section</button>
    </div>
    <button v-if="canAdd" @click="add()">Add Section</button>
  </template>
</HeadlessRepeatable>
```