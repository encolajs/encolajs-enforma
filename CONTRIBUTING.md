# Contributing to @encolajs/validator

First off, thank you for considering contributing to @encolajs/validator! We're excited to have you join our community. This document provides guidelines and information about contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Contributions](#making-contributions)
- [Development Guidelines](#development-guidelines)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
```bash
git clone https://github.com/your-username/encolajs-validator.git
cd encolajs-validator
```
3. Install dependencies
```bash
npm install
```
4. Create a branch for your changes
```bash
git checkout -b feature/your-feature-name
```

## Development Setup

The project uses several tools to ensure code quality:

- TypeScript for type checking
- Vitest for testing
- ESLint for code linting
- Prettier for code formatting

Run the development environment:
```bash
# Run tests in watch mode
npm run test:watch

# Run type checking in watch mode
npm run type-check:watch

# Format code
npm run format
```

## Project Structure

```
src/
├── rule/              # Validation rules
├── datasource/        # Data source implementations
├── util/              # Utility functions
├── ValidationRule.ts  # Base validation rule class
├── Validator.ts       # Main validator class
├── RuleRegistry.ts    # Rule registry
└── index.ts           # Public API
```

## Making Contributions

### Types of Contributions

1. **Bug Fixes**
    - Fix issues in existing functionality
    - Add missing test cases
    - Improve error messages

2. **New Features**
    - Add new validation rules
    - Enhance existing functionality
    - Improve performance

3. **Documentation**
    - Improve documentation
    - Add examples
    - Fix typos

4. **Tests**
    - Add missing test cases
    - Improve test coverage
    - Add edge case testing

### Adding a New Validation Rule

Validation rules that are to be added to the library have to be of general purpose and reusable. 

1. Create a new file in `src/rule/`
```typescript
import { ValidationRule } from '../ValidationRule'
import { DataSourceInterface } from '../datasource/DataSourceInterface'

export class NewRule extends ValidationRule {
  validate(
    value: any,
    path: string,
    datasource: DataSourceInterface
  ): boolean {
    // Implementation
  }
}
```

2. Add tests in `tests/rule/`
3. Register the rule in `ValidatorFactory.ts`
4. Update documentation in `docs/validation-rules.md`

## Development Guidelines

1. **Code Style**
    - Follow TypeScript best practices
    - Use meaningful variable and function names
    - Add comments for complex logic
    - Follow existing code style

2. **Testing**
    - Write unit tests for new features
    - Ensure all tests pass
    - Maintain or improve test coverage
    - Test edge cases

3. **Documentation**
    - Update documentation for changes
    - Add JSDoc comments to public APIs
    - Include examples for new features

4. **Commits**
    - Use clear commit messages
    - One feature/fix per commit
    - Reference issues in commits

## Pull Request Process

1. **Before Creating a PR**
    - Ensure all tests pass
    - Update documentation
    - Run code formatting `npm run format`
    - Check type definitions

2. **PR Description**
    - Describe the changes
    - Reference related issues
    - Provide examples if applicable
    - List breaking changes

3. **Review Process**
    - Maintainers will review your PR
    - Address review comments
    - Keep the PR updated

4. **After Merge**
    - Delete your branch
    - Help review related PRs
    - Watch for issues

## Release Process

1. **Version Updates**
    - Follow semantic versioning
    - Update CHANGELOG.md
    - Update version in package.json

2. **Pre-release Checks**
    - Run full test suite
    - Check documentation
    - Verify examples

3. **Release**
    - Create release notes
    - Tag the release
    - Publish to npm

## Questions?

Feel free to create an issue or reach out to the maintainers if you have any questions about contributing.

Thank you for helping make @encolajs/validator better! 🎉