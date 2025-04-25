# Architecture Overview

Enforma is built with a modular architecture that allows for flexibility and extensibility. This document provides an overview of how Enforma's components and systems work together.

## Core Architecture

Enforma follows a layered architecture:

1. **Core Form Components** - Low-level components that handle state management, validation, and UI coordination
2. **Schema System** - Components and utilities for processing JSON schema-based form definitions
3. **Headless Components** - Provide behavior and state without enforcing visual design
4. **UI Integration Layer** - Presets and components that connect Enforma with UI libraries

## Key Architectural Principles

- **Separation of Concerns** - Form state/behavior is separate from UI rendering
- **Progressive Enhancement** - Simple forms with minimal configuration, scaling to complex use cases
- **Extensibility** - All levels of the system can be extended and customized
- **Performance** - Optimized rendering to handle complex forms efficiently
- **Transformation Pipeline** - Using transformer functions to modify forms at runtime

## Component Hierarchy

```
Enforma
├── EnformaField
├── EnformaRepeatable
│   └── EnformaField
├── EnformaRepeatableTable
│   └── EnformaField
├── EnformaSection
│   └── EnformaField/Repeatable/Section
└── EnformaSchema
    └── (Any of the above, generated from schema)
```

## State Management

Enforma uses Vue's reactivity system to maintain form state. The form state includes:

- Field values
- Validation state
- Error messages
- Dirty/touched state
- Form submission state

## Rendering Strategy

Enforma supports multiple rendering strategies:

- **Field-based rendering** - Explicit field declarations
- **Schema-based rendering** - JSON-driven form generation
- **Headless-based rendering** - Using the headless components to access the form' state
- **Mixed rendering** - Combining all approaches for flexibility

This architecture gives you the freedom to choose the approach that best fits your application's needs.

## Transformation System

Enforma includes a powerful transformation system that allows you to modify form elements at runtime:

1. **Schema Transformers** - Modify the form schema before it's rendered
2. **Context Transformers** - Adjust the form context that's available to expressions and components
3. **Form Config Transformers** - Customize form configuration at runtime
4. **Field Props Transformers** - Adjust field properties during rendering

These transformers follow a pipeline pattern where each transformer receives input, modifies it, and passes the result to the next transformer. This system enables dynamic form behavior without complex component logic.

Learn more in the [Transformers guide](/extensibility/using-transformers).