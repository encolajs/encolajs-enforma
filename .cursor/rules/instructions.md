# CLAUDE.md

## General principles
This project is VueJS based formkit which renders forms based on a schema (a JSON object describing the the structure of the form). Validation be performed using a different library for which documentation is attached to the project.

Implementation Principles
1. Progressive Development
- Implement solutions in logical stages rather than all at once
- Pause after completing each meaningful component to check user requirements
- Confirm scope understanding before beginning implementation
2. Scope Management
- Implement only what is explicitly requested
- When requirements are ambiguous, choose the minimal viable interpretation
- Identify when a request might require changes to multiple components or systems
- Always ask permission before modifying components not specifically mentioned
3. Communication Protocol
- After implementing each component, briefly summarize what you've completed
- Classify proposed changes by impact level: Small (minor changes), Medium (moderate rework), or Large (significant restructuring)
- For Large changes, outline your implementation plan before proceeding
- Explicitly note which features are completed and which remain to be implemented
4. Quality Assurance
- Provide testable increments when possible
- Include usage examples for implemented components
- Identify potential edge cases or limitations in your implementation
- Suggest tests that would verify correct functionality

5. Balancing Efficiency with Control
- For straightforward, low-risk tasks, you may implement the complete solution
- For complex tasks, break implementation into logical chunks with review points
- When uncertain about scope, pause and ask clarifying questions
- Be responsive to user feedback about process - some users may prefer more or less granular control

## Build & Development Commands
- Build: `npm run build`
- Development: `npm run dev`
- Playground: `npm run play`
- Type check: `npm run type-check`

## Test Commands
- Run all tests: `npm test`
- Run single test: `npx vitest path/to/test.test.ts`
- Watch tests: `npm run test:watch`
- Test coverage: `npm run test:coverage`

## Lint & Format Commands
- Lint: `npm run lint`
- Fix lint issues: `npm run lint:fix`
- Format: `npm run format`
- Check formatting: `npm run format:check`

## Code Style Guidelines
- **Imports**: Group imports by source type (Vue, local modules, types)
- **Formatting**: Single quotes, no semicolons, 2-space indentation
- **Naming**: camelCase for variables/functions, PascalCase for components/interfaces
- **Components**: Use Vue 3 Composition API style
- **TypeScript**: Explicit return types, interfaces for complex objects
- **Error Handling**: Try/catch blocks with descriptive messages and graceful fallbacks
- **Composables**: Prefix with "use" (e.g., useField, useFormState)
- **Tests**: Write comprehensive tests for all functionality