# Repeatable Component

<!-- 
This page should provide:
1. Overview of Repeatable component purpose and functionality
2. Props, events, and slots reference
3. Basic usage examples for array handling
4. Array operations (add, remove, move)
5. Validation within repeatable fields
6. Custom item rendering
7. Common patterns and best practices
8. Advanced usage examples
-->

## Overview

The Repeatable component provides a way to handle array-like data structures in forms. It allows users to add, remove, and reorder items in a list.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `name` | `String` | Yes | - | Array field name/path |
| `type` | `String` | Yes | - | Must be "repeatable" |
| `label` | `String` | No | - | Field label text |
| `subfields` | `Object` | Yes | - | Definition of repeatable fields |
| `min` | `Number` | No | 0 | Minimum number of items |
| `max` | `Number` | No | - | Maximum number of items |
| `item` | `Object` | No | - | Template for new items |
| `addButtonText` | `String` | No | - | Text for add button |
| `removeButtonText` | `String` | No | - | Text for remove button |
| `addButton` | `Component` | No | - | Custom add button component |
| `removeButton` | `Component` | No | - | Custom remove button component |
| `moveUpButton` | `Component` | No | - | Custom move up button component |
| `moveDownButton` | `Component` | No | - | Custom move down button component |
| `showDeleteButton` | `Boolean` | No | `true` | Whether to show the delete button |
| `showMoveButtons` | `Boolean` | No | `true` | Whether to show the move up/down buttons |

## Examples

### Basic Usage

```vue
<EnformaRepeatable
  name="items"
  type="repeatable"
  :subfields="{
    name: { type: 'text' },
    quantity: { type: 'number' }
  }"
/>
```

### Custom Button Components

```vue
<EnformaRepeatable
  name="items"
  type="repeatable"
  :subfields="{
    name: { type: 'text' }
  }"
  :addButton="CustomAddButton"
  :removeButton="CustomRemoveButton"
  :moveUpButton="CustomMoveUpButton"
  :moveDownButton="CustomMoveDownButton"
/>
```

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ items, index, ... }` | Custom item rendering |
| `add-button` | `{ add, canAdd, ... }` | Custom add button |
| `item-actions` | `{ remove, canRemove, ... }` | Custom item actions |

## Best Practices

1. Always provide a meaningful label for the repeatable field
2. Set appropriate min/max constraints based on your requirements
3. Use custom button components when you need to match your application's design system
4. Consider hiding action buttons when they're not needed (e.g., in read-only mode)
5. Use the slots system for complex customizations