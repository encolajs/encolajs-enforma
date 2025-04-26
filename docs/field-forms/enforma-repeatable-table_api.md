# EnformaRepeatableTable

<TabNav :items="[
{ label: 'Usage', link: '/field-forms/enforma-repeatable-table' },
{ label: 'API', link: '/field-forms/enforma-repeatable-table_api' },
]" />

The [schema for repeatable table components](/schema-forms/schema-reference.md#repeatable-table-schema) is almost identical to the component's props.

## Props

| Prop | Type | Description |
|------|------|-------------|
| `name` | `String` | The field name for the array (required) |
| `subfields` | `Object` | Record of field definitions to render as table columns |
| `min` | `Number` | Minimum number of items (default: 0) |
| `max` | `Number` | Maximum number of items (default: Infinity) |
| `defaultValue` | `Any` | Default value for new items when added |
| `validateOnAdd` | `Boolean` | Whether to validate when adding a new item (default: true) |
| `validateOnRemove` | `Boolean` | Whether to validate when removing an item (default: false) |
| `addButton` | `Component` | Custom add button component |
| `removeButton` | `Component` | Custom remove button component |
| `moveUpButton` | `Component` | Custom move up button component |
| `moveDownButton` | `Component` | Custom move down button component |
| `allowAdd` | `Boolean` | Whether to allow adding new items (default: true) |
| `allowRemove` | `Boolean` | Whether to allow removing items (default: true) |
| `allowSort` | `Boolean` | Whether to allow sorting items (default: true) |

### Subfields Definition

Each field in the `subfields` object should be a valid field configuration that includes at minimum:

```js
{
  inputComponent: 'text',
  label: 'Product Name', // The column header
  // ...other field props as needed
}
```

All properties that can be passed to `EnformaField` can be used in these subfield definitions.

## Slots

The component only exposes the `#default` slot which you can use to organize the layout of the component if the `subfields` props is not enough or you don't want to use it.

## Styling

The component uses the following props from the configuration:

- `pt.repeatable_table.wrapper` - The outer wrapper div
- `pt.repeatable_table.table` - The table element
- `pt.repeatable_table.th` - The table header cells
- `pt.repeatable_table.td` - The table data cells
- `pt.repeatable_table.actionsTd` - The cell containing action buttons
- `pt.repeatable_table.itemActions` - The container for item action buttons
- `pt.repeatable_table.actions` - The container for the add button