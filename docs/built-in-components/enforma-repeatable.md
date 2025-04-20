# EnformaRepeatable

`EnformaRepeatable` provides a way to create repeatable groups of fields. This is ideal for handling arrays of objects in your form data, such as multiple addresses, contact details, or any list of similar items.

## Basic Usage

```vue
<template>
  <Enforma v-model="formData" @submit="onSubmit">
    <EnformaRepeatable name="contacts" add-label="Add Contact">
      <template #default="{ index }">
        <div class="contact-item">
          <h4>Contact {{ index + 1 }}</h4>
          <EnformaField :name="`contacts[${index}].name`" label="Name" />
          <EnformaField :name="`contacts[${index}].email`" type="email" label="Email" />
          <EnformaField :name="`contacts[${index}].phone`" label="Phone" />
        </div>
      </template>
    </EnformaRepeatable>
    
    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
import { ref } from 'vue';
import { Enforma, EnformaRepeatable, EnformaField, EnformaSubmitButton } from 'encolajs-formkit';

const formData = ref({
  contacts: [
    { name: '', email: '', phone: '' }
  ]
});

function onSubmit(data) {
  console.log('Form submitted:', data);
}
</script>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `name` | `String` | The field name for the array (required) |
| `min` | `Number` | Minimum number of items (default: 0) |
| `max` | `Number` | Maximum number of items (default: Infinity) |
| `addLabel` | `String` | Label for the add button |
| `removeLabel` | `String` | Label for the remove buttons |
| `addButtonProps` | `Object` | Props for the add button |
| `removeButtonProps` | `Object` | Props for the remove buttons |
| `moveUpButtonProps` | `Object` | Props for the move up buttons |
| `moveDownButtonProps` | `Object` | Props for the move down buttons |
| `itemClass` | `String` | CSS class for each repeatable item |
| `showMoveButtons` | `Boolean` | Whether to show move up/down buttons |
| `showRemoveButton` | `Boolean` | Whether to show remove buttons |
| `showAddButton` | `Boolean` | Whether to show the add button |
| `addItemTemplate` | `Object` | Default values for new items |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ index, moveUp, moveDown, remove }` | Content for each repeatable item |
| `add-button` | `{ add, canAdd }` | Custom add button |
| `remove-button` | `{ remove, canRemove, index }` | Custom remove button |
| `move-up-button` | `{ moveUp, canMoveUp, index }` | Custom move up button |
| `move-down-button` | `{ moveDown, canMoveDown, index }` | Custom move down button |
| `empty` | None | Content to display when there are no items |

## Array Notation

The repeatable component uses array notation for field names. The general pattern is:

```
arrayName[index].fieldName
```

For example:
- `contacts[0].name`
- `addresses[2].street`
- `products[1].quantity`

## Adding Controls

By default, `EnformaRepeatable` provides add, remove, and move buttons, but you can customize them:

```vue
<template>
  <Enforma v-model="formData">
    <EnformaRepeatable 
      name="skills" 
      add-label="Add Another Skill" 
      :min="1" 
      :max="5"
    >
      <template #default="{ index, remove }">
        <div class="skill-row">
          <EnformaField :name="`skills[${index}].name`" label="Skill Name" />
          <EnformaField 
            :name="`skills[${index}].level`" 
            type="select" 
            label="Skill Level" 
            :options="['Beginner', 'Intermediate', 'Advanced', 'Expert']" 
          />
          <button 
            type="button" 
            class="remove-btn" 
            @click="remove"
          >
            Remove
          </button>
        </div>
      </template>
      
      <!-- Custom add button -->
      <template #add-button="{ add, canAdd }">
        <button 
          type="button" 
          class="custom-add-btn" 
          @click="add" 
          :disabled="!canAdd"
        >
          <i class="plus-icon"></i> Add New Skill
        </button>
      </template>
    </EnformaRepeatable>
  </Enforma>
</template>
```

## Default Values for New Items

Specify default values for new items with the `addItemTemplate` prop:

```vue
<template>
  <Enforma v-model="formData">
    <EnformaRepeatable 
      name="addresses" 
      :addItemTemplate="addressTemplate"
    >
      <template #default="{ index }">
        <EnformaField :name="`addresses[${index}].street`" label="Street" />
        <EnformaField :name="`addresses[${index}].city`" label="City" />
        <EnformaField :name="`addresses[${index}].country`" label="Country" />
        <EnformaField :name="`addresses[${index}].isPrimary`" type="checkbox" label="Primary Address" />
      </template>
    </EnformaRepeatable>
  </Enforma>
</template>

<script setup>
const addressTemplate = {
  street: '',
  city: '',
  country: 'United States',
  isPrimary: false
};
</script>
```

## Nested Repeatables

You can nest repeatable components for complex data structures:

```vue
<template>
  <Enforma v-model="formData">
    <EnformaRepeatable name="departments" add-label="Add Department">
      <template #default="{ index: deptIndex }">
        <div class="department">
          <EnformaField 
            :name="`departments[${deptIndex}].name`" 
            label="Department Name" 
          />
          
          <h4>Employees</h4>
          <EnformaRepeatable 
            :name="`departments[${deptIndex}].employees`" 
            add-label="Add Employee"
          >
            <template #default="{ index: empIndex }">
              <div class="employee">
                <EnformaField 
                  :name="`departments[${deptIndex}].employees[${empIndex}].name`" 
                  label="Employee Name" 
                />
                <EnformaField 
                  :name="`departments[${deptIndex}].employees[${empIndex}].position`" 
                  label="Position" 
                />
              </div>
            </template>
          </EnformaRepeatable>
        </div>
      </template>
    </EnformaRepeatable>
  </Enforma>
</template>
```

## Validation

You can validate repeatable items:

```vue
<template>
  <Enforma v-model="formData" :validators="validators">
    <EnformaRepeatable name="contacts">
      <template #default="{ index }">
        <EnformaField 
          :name="`contacts[${index}].name`" 
          label="Name" 
        />
        <EnformaField 
          :name="`contacts[${index}].email`" 
          type="email" 
          label="Email" 
        />
      </template>
    </EnformaRepeatable>
  </Enforma>
</template>

<script setup>
// Validators for repeatable items use array notation
const validators = {
  'contacts[*].name': ['required'],
  'contacts[*].email': ['required', 'email']
};
</script>
```

## Conditional Rendering within Repeatables

You can conditionally show fields within repeatable items:

```vue
<template>
  <Enforma v-model="formData">
    <EnformaRepeatable name="experiences">
      <template #default="{ index }">
        <EnformaField 
          :name="`experiences[${index}].company`" 
          label="Company" 
        />
        <EnformaField 
          :name="`experiences[${index}].position`" 
          label="Position" 
        />
        <EnformaField 
          :name="`experiences[${index}].currentlyWorking`" 
          type="checkbox" 
          label="I currently work here" 
        />
        
        <!-- Only show end date if not currently working -->
        <EnformaField 
          :name="`experiences[${index}].endDate`" 
          type="date" 
          label="End Date" 
          :if="!$form.experiences[index]?.currentlyWorking"
        />
      </template>
    </EnformaRepeatable>
  </Enforma>
</template>
```

## Best Practices

- Always set a `min` value if you require at least one item
- Use `max` to prevent too many items from being added
- Provide clear `addLabel` and `removeLabel` text
- Use the `addItemTemplate` to pre-fill common values
- Group related form controls with appropriate styling
- For complex use cases, consider using `EnformaRepeatableTable` instead