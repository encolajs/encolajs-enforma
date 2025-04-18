# Headless API

<!-- 
This page should provide:
1. Comprehensive API reference for all headless components
2. Parameters, return values, and methods for each composable
3. TypeScript interfaces and types
4. Component relationships and hierarchy
5. Usage patterns and examples
-->

## HeadlessForm


## HeadlessField

Headless component for form fields with no UI.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `name` | `String` | No | Field name/path (required if names not provided) |
| `names` | `Object` | No | Multiple field names mapping (required if name not provided) |
| `validateOnMount` | `Boolean` | No | Whether to validate on mount |
| `validateOn` | `String` | No | When to validate this field |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ field }` or multiple fields | Slot for field content |


