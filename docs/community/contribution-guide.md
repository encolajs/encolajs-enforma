# Contribution Guide

Enforma is an open-source project, and we welcome contributions from the community. This guide explains how you can contribute to the project, whether it's through code, documentation, or other forms of support.

## Getting Started

### Setting Up the Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** to your local machine
   ```bash
   git clone https://github.com/YOUR_USERNAME/encolajs-formkit.git
   cd encolajs-formkit
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Start the development server**
   ```bash
   npm run dev
   ```
5. **Run tests** to make sure everything is working
   ```bash
   npm test
   ```

### Code Organization

The project structure follows this organization:

- `/src` - Source code
  - `/core` - Core components
  - `/headless` - Headless components
  - `/presets` - UI library presets
  - `/utils` - Utility functions
- `/tests` - Test files
- `/docs` - Documentation
- `/dist` - Build output (generated)

## How to Contribute

### Reporting Bugs

1. Search existing issues to avoid duplicates
2. Create a new issue using the bug report template
3. Include detailed reproduction steps
4. Specify your environment (Vue version, browser, etc.)
5. If possible, include a minimal reproduction

### Suggesting Features

1. Search existing issues to avoid duplicates
2. Create a new issue using the feature request template
3. Describe the feature and its benefits
4. Consider use cases and implementation details
5. Be open to discussion and refinement

### Making Code Contributions

1. Find an issue to work on, or create one to discuss your idea
2. Comment on the issue to express your interest
3. Create a branch in your fork
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. Implement your changes
5. Write tests for your changes
6. Update documentation if needed
7. Run linting and tests
   ```bash
   npm run lint
   npm test
   ```
8. Commit your changes with a descriptive message
9. Push your branch and create a pull request

### Pull Request Process

1. Fill out the pull request template completely
2. Link the related issue(s)
3. Wait for the CI checks to pass
4. Address any requested changes from reviewers
5. Once approved, maintainers will merge the PR

## Coding Standards

### Code Style

- Follow the existing code style
- Use ESLint and Prettier for formatting
- Run linting before submitting PRs
  ```bash
  npm run lint
  ```

### TypeScript

- Use proper type annotations
- Avoid using `any` when possible
- Export interfaces for public APIs
- Use type guards for type narrowing

### Component Guidelines

- Use Vue 3 Composition API
- Provide descriptive prop names
- Document component props with JSDoc comments
- Use slots for content customization
- Emit meaningful events

### Testing

- Write unit tests for all components and utilities
- Test edge cases and error conditions
- Mock external dependencies
- For visual components, include snapshot tests
- Aim for high test coverage

## Documentation

### Writing Documentation

Our documentation uses Markdown with VitePress:

1. Update relevant documentation when adding or changing features
2. Use clear, concise language
3. Include code examples for key features
4. Follow the existing documentation structure
5. Preview your changes with:
   ```bash
   cd docs
   npm run dev
   ```

### Creating Examples

Good examples are crucial for documentation:

1. Make examples focused on a single concept
2. Keep examples simple and understandable
3. Include comments to explain key points
4. Ensure examples are working and tested

## Community

### Communication Channels

- GitHub Issues: For bug reports and feature requests
- Discord: For real-time discussion
- Pull Requests: For code contributions

### Code of Conduct

All contributors are expected to adhere to our Code of Conduct. This promotes a positive, inclusive environment for everyone.

### Recognition

All contributors will be recognized in the project. Major contributors may be invited to join as maintainers.

## Development Workflow

### Branching Strategy

- `main` - Stable release branch
- `dev` - Development branch for next release
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

### Release Process

1. Features and fixes are merged into `dev`
2. When ready for release, `dev` is merged into `main`
3. Version number is updated following semver
4. Release notes are prepared
5. New npm package is published

## Working with Issues

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or improvement
- `documentation` - Documentation changes
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed

### Issue Workflow

1. Issues are triaged and labeled by maintainers
2. Contributors can claim issues by commenting
3. Once assigned, the issue moves to "In Progress"
4. When a PR is submitted, the issue moves to "In Review"
5. After merging, the issue is closed

## Thank You

Your contributions help make Enforma better for everyone. We appreciate the time and effort you put into improving the project!