# Headless Components Overview

EncolaJS provides a powerful set of headless components that give you complete control over your form's UI while maintaining robust state management and validation capabilities. This guide will help you understand when and how to use these components effectively.

## Introduction to Headless Components

Headless components are UI-agnostic components that provide all the functionality and state management of a form system without any styling or markup. This approach offers several key benefits:

- **Complete UI Freedom**: Build your forms exactly how you want them, with your own styling and markup. 
- **Reduced Bundle Size**: No UI code included by default
- **Framework Agnostic**: Works with any UI framework or styling solution

Of course, the downside is that you can't use schema-based forms and the code will be more verbose. The last issue can be mitigated by creating your own [wrapper fields](wrapper-components.md)

## Available Headless Components

EncolaJS provides three main headless components:

1. **`<HeadlessForm>`**: The core form component that manages form state, validation, and submission
2. **`<HeadlessField>`**: Individual field component for managing field state and validation
3. **`<HeadlessRepeatable>`**: Component for managing arrays of fields (like dynamic form sections)