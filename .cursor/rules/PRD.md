# Vue FormKit - Product Requirements Document

## Overview
Vue FormKit is a flexible, powerful form creation library for Vue.js applications that provides a dual-mode approach to form creation, robust validation, and extensive customization options.

## Core Features

### 1. Dual-Mode Form Creation
- **Schema-Based Forms**
  - JSON-based field definitions
  - Section organization
  - Dynamic field visibility
  - Nested field structures
  
- **Template-Based Forms**
  - Direct component usage
  - Full template control
  - Access to form state
  - Custom layouts

### 2. Headless Architecture
- **Core Components**
  - `HeadlessForm`: Base form state management
  - `HeadlessField`: Field state handling
  - `HeadlessRepeatable`: Array field management
  
- **UI Components**
  - `FormKit`: Main form component
  - `FormKitField`: Field wrapper
  - `FormKitSection`: Section renderer
  - `FormKitSchema`: Schema interpreter

### 3. Validation System
- **Integration with @encolajs/validator**
  - Custom rule registration
  - Async validation support
  - Field dependency tracking
  
- **Validation Triggers**
  - On input
  - On change
  - On blur
  - On submit
  
- **Error Handling**
  - Custom error messages
  - Message formatting
  - Per-field error states

### 4. Configuration System
- **Multi-Level Configuration**
  - Default configuration
  - Global settings
  - Form-level settings
  - Field-level overrides
  
- **Configurable Aspects**
  - Component mappings
  - Validation behavior
  - UI customization
  - Error display

### 5. Dynamic Expressions
- **Expression Types**
  - Conditional visibility (`if`)
  - Dynamic properties
  - Computed values
  
- **Context Access**
  - Form values
  - External context
  - Validation state

### 6. Field System
- **Field Types**
  - Basic inputs
  - Select fields
  - Repeatable fields
    - Table format (`FormKitRepeatableTable`)
    - List format (`FormKitRepeatable`)
  - Custom components
  
- **Field Features**
  - Labels and help text
  - Error display
  - Required indicators
  - Custom styling

### 7. Repeatable Fields System
- **FormKitRepeatable**
  - Vertical layout of repeatable fields
  - Add/Remove item controls
  - Drag-and-drop reordering
  - Per-item validation
  - Features:
    - Min/max items constraints
    - Custom item templates
    - Item-level error handling
    - Nested field support
    
- **FormKitRepeatableTable**
  - Tabular layout for repeatable fields
  - Column configuration
  - Row actions (add/remove/reorder)
  - Features:
    - Column sorting
    - Custom cell templates
    - Bulk actions
    - Row selection
    - Fixed headers
    - Pagination (optional)

## Technical Requirements

[Previous sections 1-3 remain the same]

### 4. State Management
- Form-level state tracking
- Field-level state management
- Validation state handling
- Submission state control
- Array field state management
  - Item ordering
  - Selection state
  - Pagination state (for table)

### 5. Expression System
[Remains the same]

## Implementation Details

### 1. Component Structure
```typescript
// Core components
FormKit
├── HeadlessForm
├── FormKitSchema
├── FormKitField
│   └── HeadlessField
└── FormKitRepeatable
    ├── FormKitRepeatableTable
    │   └── HeadlessRepeatable
    └── FormKitRepeatable
        └── HeadlessRepeatable
```

### 2. Configuration Format
[Previous format remains the same]

### 3. Field Definition Format
```typescript
// Regular field definition
{
  type: 'text',
  section: 'personal_info',
  if: "form.userType === 'business'",
  props: {},
  label_props: {},
  input_props: {},
  help_props: {},
  error_props: {}
}

// Repeatable Table field definition
{
  type: 'repeatable_table',
  props: {
    min_items: 1,
    max_items: 10,
    columns: [
      {
        field: 'name',
        header: 'Name',
        sortable: true
      },
      {
        field: 'email',
        header: 'Email'
      }
    ],
    subfields: {
      name: {
        type: 'text',
        props: {}
      },
      email: {
        type: 'email',
        props: {}
      }
    }
  }
}

// Regular Repeatable field definition
{
  type: 'repeatable',
  props: {
    min_items: 1,
    max_items: 10,
    subfields: {
      name: {
        type: 'text',
        props: {}
      },
      email: {
        type: 'email',
        props: {}
      }
    }
  }
}
```

## Development Phases

### Phase 1: Core Foundation
- [x] Implement headless components
- [x] Create basic form state management
- [x] Set up configuration system
- [x] Implement basic validation

### Phase 2: Enhanced Features
- [x] Add expression system
- [x] Implement field transformers
- [x] Create schema interpreter
- [x] Add section support

### Phase 3: Repeatable Fields
- [x] Implement HeadlessRepeatable core functionality
- [x] Create FormKitRepeatable component
- [x] Develop FormKitRepeatableTable component

### Phase 4: UI Integration
- [x] Create PrimeVue preset
- [ ] Add more UI framework presets
- [ ] Improve accessibility

## Future Enhancements
1. Additional UI framework presets
2. Enhanced validation features
3. Form state persistence
4. Field type plugins
5. Advanced layout system
6. Performance optimizations

## Non-Functional Requirements

### Performance
- Minimal bundle size impact
- Efficient form rendering
- Optimized validation
- Lazy loading support

### Accessibility
- ARIA attributes support
- Keyboard navigation
- Screen reader compatibility
- Focus management

### Compatibility
- Vue 3.x support
- TypeScript support
- Modern browser compatibility
- SSR support

### Documentation
- API documentation
- Usage examples
- Component reference
- Configuration guide