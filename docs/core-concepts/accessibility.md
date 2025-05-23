# Accessibility & ARIA Support

Enforma includes comprehensive accessibility features to ensure your forms are usable by everyone, including users who rely on assistive technologies like screen readers.

Enforma automatically provides ARIA attributes at multiple levels:

## Field-Level ARIA Attributes

All form fields automatically include:

- `aria-invalid` - Indicates validation state (true when field has errors)
- `aria-required` - Indicates if the field is required (based on validation rules)
- `aria-busy` - Shows when field is being validated asynchronously
- `aria-describedby` - Links to error messages and help text
- `aria-labelledby` - Links to field labels
- `aria-errormessage` - Points to specific error message elements

## Form-Level ARIA Attributes

Forms provide:

- `aria-busy` - Indicates when the form is being submitted
- `aria-invalid` - Shows if the form has validation errors

## Repeatable Arrays ARIA Support

For repeatable fields/arrays:

- `aria-live="polite"` - Announces when items are added/removed
- `aria-setsize` - Total number of items in the array
- `aria-posinset` - Current item position within the array
- `aria-label` - Dynamic labels with current count
- Screen reader announcements for add/remove/move operations