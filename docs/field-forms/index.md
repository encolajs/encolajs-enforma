# Forms Using the Base Components

EncolaJS Enforma provides a set of base components for building forms. These components work together to create flexible forms that use fields, schema or a mix of schema and fields.

## Base Components

- [Enforma](./enforma-form) - Root component for form state and submission
- [EnformaField](./enforma-field) - Renders individual form fields
- [EnformaSection](./enforma-section) - Renders sections (groups of fields and sections). 
- [EnformaRepeatable](./enforma-repeatable) - Handles repeatable field groups
- [EnformaRepeatableTable](./enforma-repeatable-table) - Table-based repeatable fields

## Other Components

Enforma uses a set of components for internal purposes:
- **EnformaSubmitButton** - Default submit button
- **EnformaResetButton** - Default reset button
- **EnformaRepeatableAddButton** - Button for adding new items to repeatable components
- **EnformaRepeatableRemoveButton** - Button for removing items from repeatable components
- **EnformaRepeatableMoveUpButton** and **EnformaRepeatableMoveDownButton** - Buttons for moving items inside from repeatable components

> [!WARNING]
> The first thing to do when installing Enforma is to ensure these components are configured to your preference. 
> The library comes with a set of basic components and the presets also provide them.