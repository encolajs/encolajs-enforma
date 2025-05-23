# CLAUDE.md

## Project Overview
VueJS form library that renders forms from JSON schemas. Uses external validation library.

## Development Principles
- Implement only what's requested (minimal viable interpretation)
- Break complex tasks into reviewable chunks
- Ask permission before modifying unspecified components
- Provide testable increments with usage examples

## Commands
**Test:** `npm test` | `npx vitest path/to/test.test.ts` | `npm run test:watch`
**Lint:** `npm run lint` | `npm run lint:fix`
**Format:** `npm run format` | `npm run type-check`

## Code Style
- Vue 3 Composition API, TypeScript with explicit return types
- Single quotes, no semicolons, 2-space indentation
- camelCase variables/functions, PascalCase components/interfaces
- Group imports: Vue, local modules, types
- Prefix composables with "use"