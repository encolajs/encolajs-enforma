# Repeatable Table Component

<!-- 
This page should provide:
1. Overview of Repeatable Table component purpose and functionality
2. Props, events, and slots reference
3. Basic usage examples for tabular data
4. Configuring columns and headers
5. Row operations (add, remove, reorder)
6. Validation within table cells
7. Custom cell rendering
8. Comparison with standard Repeatable component
9. Common patterns and best practices
10. Advanced usage examples
-->

## Overview

The Repeatable Table component provides a tabular interface for handling array-like data structures in forms. It allows users to add, remove, and reorder rows in a table format.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `name` | `String` | Yes | - | Array field name/path |
| `type` | `String` | Yes | - | Must be "repeatable_table" |
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
<EnformaRepeatableTable
  name="items"
  type="repeatable_table"
  :subfields="{
    name: { type: 'text' },
    quantity: { type: 'number' },
    price: { type: 'number' }
  }"
/>
```

### Custom Button Components

```vue
<EnformaRepeatableTable
  name="items"
  type="repeatable_table"
  :subfields="{
    name: { type: 'text' },
    quantity: { type: 'number' }
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
| `header` | `{ headers }` | Custom table header |
| `row` | `{ item, index, ... }` | Custom row rendering |
| `cell` | `{ item, field, ... }` | Custom cell rendering |
| `actions` | `{ item, index, ... }` | Custom row actions |

## Best Practices

1. Always provide meaningful column headers
2. Set appropriate min/max constraints based on your requirements
3. Use custom button components when you need to match your application's design system
4. Consider hiding action buttons when they're not needed (e.g., in read-only mode)
5. Use the slots system for complex customizations
6. Keep the number of columns reasonable to maintain readability
7. Consider using appropriate input types for different data (e.g., number inputs for quantities)