# `<HeadlessRepeatable>` API

<TabNav :items="[
{ label: 'Usage', link: '/headless-forms/repeatable' },
{ label: 'API', link: '/headless-forms/repeatable_api' },
]" />

The `<HeadlessRepeatable>` component provides a way to handle repeatable form fields with no built-in UI. It manages the state and logic for array operations while allowing complete control over the presentation.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `name` | `String` | Yes | - | The field name/path for the repeatable array |
| `min` | `Number` | No | `0` | Minimum number of items allowed in the array |
| `max` | `Number` | No | `undefined` | Maximum number of items allowed in the array |
| `defaultValue` | `Any` | No | `null` | Default value for new items when added |
| `validateOnAdd` | `Boolean` | No | `true` | Whether to validate the array when adding items |
| `validateOnRemove` | `Boolean` | No | `true` | Whether to validate the array when removing items |

## Slot Props

The default slot receives an object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `value` | `Array` | The current array of items |
| `count` | `Number` | The current number of items in the array |
| `canAdd` | `Boolean` | Whether more items can be added (based on max limit) |
| `canRemove` | `Boolean` | Whether items can be removed (based on min limit) |
| `add` | `Function(value?: any, index?: number) => Promise<boolean>` | Function to add a new item. Optionally accepts a value and index |
| `remove` | `Function(index: number) => Promise<boolean>` | Function to remove an item at the specified index |
| `move` | `Function(fromIndex: number, toIndex: number) => Promise<boolean>` | Function to move an item from one index to another |
| `moveUp` | `Function(index: number) => Promise<boolean>` | Function to move an item up one position |
| `moveDown` | `Function(index: number) => Promise<boolean>` | Function to move an item down one position |

## Methods

### add(value?: any, index?: number)

Adds a new item to the array.

- `value`: Optional value to set for the new item. If not provided, uses `defaultValue`
- `index`: Optional index where to insert the new item. If not provided, appends to the end
- Returns: Promise that resolves to `true` if the item was added successfully

### remove(index: number)

Removes an item from the array.

- `index`: Index of the item to remove
- Returns: Promise that resolves to `true` if the item was removed successfully

### move(fromIndex: number, toIndex: number)

Moves an item from one position to another.

- `fromIndex`: Current index of the item
- `toIndex`: Target index for the item
- Returns: Promise that resolves to `true` if the item was moved successfully

### moveUp(index: number)

Moves an item up one position.

- `index`: Index of the item to move up
- Returns: Promise that resolves to `true` if the item was moved successfully

### moveDown(index: number)

Moves an item down one position.

- `index`: Index of the item to move down
- Returns: Promise that resolves to `true` if the item was moved successfully

## Events

The component doesn't emit any events directly. All state changes are handled through the form state and the provided methods.

## Validation

Validation is handled through the parent form component. The following validation rules can be applied:

- Array-level validation using the field name (e.g., `items`)
- Item-level validation using indexed paths (e.g., `items.0.name`)
- Validation can be triggered on add/remove operations using `validateOnAdd` and `validateOnRemove` props

## TypeScript Interface

```typescript
interface RepeatableController {
  value: any[];
  count: number;
  canAdd: boolean;
  canRemove: boolean;
  add: (value?: any, index?: number) => Promise<boolean/>;
  remove: (index: number) => Promise<boolean/>;
  move: (fromIndex: number, toIndex: number) => Promise<boolean/>;
  moveUp: (index: number) => Promise<boolean/>;
  moveDown: (index: number) => Promise<boolean/>;
}
```

