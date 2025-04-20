# EnformaRepeatableTable

`EnformaRepeatableTable` provides a table-based interface for managing repeatable groups of fields. It's perfect for editing collections of data where a tabular layout makes sense, such as order items, contact lists, or any structured data array.

## Basic Usage

```vue
<template>
  <Enforma v-model="formData" @submit="onSubmit">
    <EnformaRepeatableTable 
      name="products" 
      :columns="productColumns"
      add-label="Add Product"
    />
    
    <EnformaSubmitButton>Place Order</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
import { ref } from 'vue';
import { Enforma, EnformaRepeatableTable, EnformaSubmitButton } from 'encolajs-formkit';

const formData = ref({
  products: [
    { name: 'Product 1', quantity: 1, price: 9.99 }
  ]
});

const productColumns = [
  {
    header: 'Product Name',
    field: 'name',
    component: 'text',
    validators: ['required']
  },
  {
    header: 'Quantity',
    field: 'quantity',
    component: 'number',
    validators: ['required', 'min:1'],
    props: { min: 1 }
  },
  {
    header: 'Price',
    field: 'price',
    component: 'number',
    validators: ['required', 'min:0'],
    props: { min: 0, step: 0.01 }
  },
  {
    header: 'Total',
    field: 'total',
    render: (item) => (item.quantity * item.price).toFixed(2),
    class: 'text-right'
  }
];

function onSubmit(data) {
  console.log('Form submitted:', data);
}
</script>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `name` | `String` | The field name for the array (required) |
| `columns` | `Array` | Column definitions for the table |
| `min` | `Number` | Minimum number of items (default: 0) |
| `max` | `Number` | Maximum number of items (default: Infinity) |
| `addLabel` | `String` | Label for the add button |
| `removeLabel` | `String` | Label for the remove buttons |
| `addButtonProps` | `Object` | Props for the add button |
| `addItemTemplate` | `Object` | Default values for new items |
| `showRowNumbers` | `Boolean` | Whether to show row numbers |
| `showRemoveButton` | `Boolean` | Whether to show remove buttons |
| `showMoveButtons` | `Boolean` | Whether to show move up/down buttons |
| `tableClass` | `String` | CSS class for the table element |
| `headerClass` | `String` | CSS class for the header row |
| `rowClass` | `String` | CSS class for data rows |
| `cellClass` | `String` | CSS class for table cells |

## Column Definition

Each column in the `columns` array can have these properties:

```js
{
  // Basic properties
  header: 'Column Title',    // Column header text
  field: 'fieldName',        // The data field (within each array item)
  
  // Field rendering (choose one)
  component: 'text',         // Form component to use for editing
  render: (item) => item.fieldName.toUpperCase(),  // Function for read-only rendering
  
  // Validation
  validators: ['required'],  // Validation rules
  
  // Component configuration (when using component)
  props: {                   // Props to pass to the component
    placeholder: 'Enter value',
    min: 0,
    max: 100,
    // etc.
  },
  
  // Styling
  width: '150px',            // Column width
  class: 'text-center',      // CSS class for this column's cells
  headerClass: 'bg-primary', // CSS class for this column's header
  
  // Behavior
  sortable: true,            // Enable column sorting (if supported by preset)
  hidden: false              // Hide this column
}
```

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `header` | `{ columns }` | Custom table header |
| `column-header-[field]` | `{ column }` | Custom header for a specific column |
| `cell-[field]` | `{ column, item, index, rowIndex }` | Custom cell for a specific column |
| `add-button` | `{ add, canAdd }` | Custom add button |
| `remove-button` | `{ remove, canRemove, index }` | Custom remove button |
| `move-up-button` | `{ moveUp, canMoveUp, index }` | Custom move up button |
| `move-down-button` | `{ moveDown, canMoveDown, index }` | Custom move down button |
| `empty` | None | Content to display when there are no items |

## Custom Cell Rendering

Use slots to customize cell rendering:

```vue
<template>
  <Enforma v-model="formData">
    <EnformaRepeatableTable name="users" :columns="userColumns">
      <!-- Custom rendering for the actions column -->
      <template #cell-actions="{ item, index }">
        <button @click="viewUserDetails(item)">View</button>
        <button @click="editUser(index)">Edit</button>
      </template>
      
      <!-- Custom rendering for the status column -->
      <template #cell-status="{ item }">
        <span :class="statusClass(item.status)">
          {{ item.status }}
        </span>
      </template>
    </EnformaRepeatableTable>
  </Enforma>
</template>

<script setup>
const userColumns = [
  { header: 'Name', field: 'name', component: 'text' },
  { header: 'Email', field: 'email', component: 'email' },
  { header: 'Status', field: 'status', component: 'select', props: { 
    options: ['Active', 'Inactive', 'Pending'] 
  }},
  { header: 'Actions', field: 'actions' }  // This column will use the slot
];

function statusClass(status) {
  return {
    'status-active': status === 'Active',
    'status-inactive': status === 'Inactive',
    'status-pending': status === 'Pending'
  };
}
</script>
```

## Read-Only Columns

Use the `render` function for read-only columns:

```js
const invoiceColumns = [
  { header: 'Product', field: 'product', component: 'text' },
  { header: 'Quantity', field: 'quantity', component: 'number' },
  { header: 'Price', field: 'price', component: 'number' },
  { 
    header: 'Subtotal', 
    field: 'subtotal',
    render: (item) => `$${(item.quantity * item.price).toFixed(2)}`
  },
  { 
    header: 'Tax', 
    field: 'tax',
    render: (item) => `$${(item.quantity * item.price * 0.08).toFixed(2)}`
  },
  { 
    header: 'Total', 
    field: 'total',
    render: (item) => {
      const subtotal = item.quantity * item.price;
      const tax = subtotal * 0.08;
      return `$${(subtotal + tax).toFixed(2)}`;
    }
  }
];
```

## Computed Properties

You can use Computed properties with repeatable tables:

```vue
<script setup>
import { computed } from 'vue';

const formData = ref({
  products: [
    { product: 'Widget', quantity: 2, price: 9.99 }
  ]
});

const orderTotal = computed(() => {
  return formData.value.products.reduce((sum, item) => {
    return sum + (item.quantity * item.price);
  }, 0);
});
</script>

<template>
  <Enforma v-model="formData">
    <EnformaRepeatableTable name="products" :columns="productColumns" />
    
    <div class="order-summary">
      <h3>Order Summary</h3>
      <div class="total">
        <strong>Total:</strong> ${{ orderTotal.toFixed(2) }}
      </div>
    </div>
  </Enforma>
</template>
```

## Validation

Add validation to table columns:

```js
const productColumns = [
  {
    header: 'Product',
    field: 'product',
    component: 'text',
    validators: ['required']
  },
  {
    header: 'Quantity',
    field: 'quantity',
    component: 'number',
    validators: ['required', 'min:1'],
    props: { min: 1 }
  },
  {
    header: 'Price',
    field: 'price',
    component: 'number',
    validators: ['required', 'min:0'],
    props: { min: 0, step: 0.01 }
  }
];
```

You can also use the form-level validators:

```js
const validators = {
  'products[*].product': ['required'],
  'products[*].quantity': ['required', 'min:1'],
  'products[*].price': ['required', 'min:0']
};
```

## Custom Add Button

Customize the add button with a slot:

```vue
<template>
  <EnformaRepeatableTable name="lineItems" :columns="lineItemColumns">
    <template #add-button="{ add, canAdd }">
      <div class="add-item-section">
        <button 
          class="add-item-button" 
          @click="add" 
          :disabled="!canAdd"
        >
          <i class="plus-icon"></i> Add New Line Item
        </button>
        <span class="items-count">
          {{ formData.lineItems.length }} items
        </span>
      </div>
    </template>
  </EnformaRepeatableTable>
</template>
```

## Best Practices

- Keep column definitions clean and focused
- Use read-only columns for calculated values
- Provide appropriate validation for editable columns
- Consider using custom cell rendering for complex inputs
- Set appropriate column widths for better table layout
- Add helpful empty state content for when there are no items
- Use the `addItemTemplate` to provide sensible defaults for new items