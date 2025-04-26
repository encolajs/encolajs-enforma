# EnformaRepeatable

<TabNav :items="[
{ label: 'Usage', link: '/field-forms/enforma-repeatable' },
{ label: 'API', link: '/field-forms/enforma-repeatable_api' },
]" />

The [schema for repeatable components](/schema-forms/schema-reference.md#repeatable-schema) is almost identical to the component's props

## Props

| Prop | Type | Description                                                           |
|------|------|-----------------------------------------------------------------------|
| `name` | `String` | The field name for the array (required)                               |
| `min` | `Number` | Minimum number of items (default: 0)                                  |
| `max` | `Number` | Maximum number of items (default: Infinity)                           |
| `subfields` | `Object` | Record of field schemas to use within each repeatable item (optional) |
| `defaultValue` | `Any` | Default value for new items when added                                |
| `validateOnAdd` | `Boolean` | Whether to validate when adding a new item (default: true)            |
| `validateOnRemove` | `Boolean` | Whether to validate when removing an item (default: true)             |
| `addButton` | `Component` | Custom add button component                                           |
| `removeButton` | `Component` | Custom remove button component                                        |
| `moveUpButton` | `Component` | Custom move up button component                                       |
| `moveDownButton` | `Component` | Custom move down button component                                     |
| `allowAdd` | `Boolean` | Whether to allow adding new items (default: true)                     |
| `allowRemove` | `Boolean` | Whether to allow removing items (default: true)                       |
| `allowSort` | `Boolean` | Whether to allow sorting items (default: true)                        |

## Slots

The component only exposes the `#default` slot which you can use to organize the layout of the component if the `subfields` props is not enough or you don't want to use it.