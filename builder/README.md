# Enforma Schema Builder - Standalone App

A standalone Vue 3 application for testing and playing with the Enforma SchemaBuilder component. This app provides a clean environment to experiment with schema building features without the complexity of embedding within documentation.

## Features

- **Full Vue 3 + TypeScript Setup**: Complete development environment with type checking
- **Side-by-Side Preview**: Schema builder on the left, live form preview on the right
- **PrimeVue Integration**: Complete PrimeVue setup with Aura theme
- **Real-time Updates**: Changes in the schema builder instantly reflect in the form preview
- **Sample Data**: Pre-populated sample data for testing form behavior
- **Import/Export**: Copy schema to clipboard or import from clipboard
- **Sample Schema**: Load a pre-built sample schema for quick testing
- **Responsive Design**: Works on desktop and tablet screens

## Quick Start

1. **Install Dependencies**:
   ```bash
   cd builder
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:3001`

3. **Build for Production**:
   ```bash
   npm run build
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint with auto-fix
- `npm run lint:check` - Run ESLint without auto-fix

## How to Use

### Getting Started
1. **Load Sample Schema**: Click "Load Sample Schema" to see a complete example
2. **Create Fields**: Use the "Field", "Section", "Repeatable", and "Table" buttons
3. **Configure Properties**: Click on any schema item to expand and edit its properties
4. **See Live Preview**: Watch the form update in real-time on the right panel

### Features to Test

#### Visual Mode
- Add different field types (text, number, select, checkbox, etc.)
- Create sections to organize fields
- Build repeatable field groups
- Configure field properties (labels, placeholders, validation)

#### JSON Mode
- Switch to JSON mode to see the raw schema
- Copy/paste schemas between projects
- Import complex schemas that might be hard to build visually
- Format and validate JSON

#### Form Preview
- See exactly how your schema renders as a form
- Test form behavior with sample data
- Watch form data updates in real-time
- Reset form data to test different scenarios

### Quick Actions
- **Load Sample Schema**: Get a complete example with sections, fields, and repeatables
- **Clear Schema**: Start fresh with an empty schema
- **Export Schema**: Copy current schema to clipboard
- **Import Schema**: Paste schema from clipboard

## Technical Stack

- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Vite** for fast development and building
- **PrimeVue** for UI components with Aura theme
- **Tailwind CSS** for utility-first styling
- **ESLint** for code quality

## Development Tips

### Adding New Features
The app structure is simple and extensible:

```
src/
├── App.vue          # Main application component
├── main.ts          # App setup and configuration
├── style.css        # Global styles and Tailwind imports
└── components/      # Additional components (currently empty)
```

### Customizing the Setup
1. **PrimeVue Theme**: Modify theme settings in `src/main.ts`
2. **Tailwind Config**: Customize design system in `tailwind.config.js`
3. **TypeScript**: Adjust compiler options in `tsconfig.json`
4. **Build Config**: Modify Vite settings in `vite.config.ts`

### Testing New Schema Features
This environment is perfect for:
- Testing new SchemaBuilder features
- Prototyping complex form schemas
- Debugging schema-related issues
- Demonstrating SchemaBuilder capabilities

## Troubleshooting

### Common Issues

1. **Port Already in Use**: Change port in `vite.config.ts` or use `npm run dev -- --port 3002`

2. **Import Errors**: Make sure you're using the correct import paths:
   ```ts
   import { SchemaBuilder } from '@enforma/schema-builder'
   import { Enforma } from '@enforma'
   ```

3. **PrimeVue Components Not Found**: Ensure all required components are registered in `src/main.ts`

### Getting Help
- Check the main Enforma documentation
- Look at the SchemaBuilder source code in `../src/schema-builder/`
- Test schema behavior in this standalone environment

## Integration with Main Project

This builder app references the main Enforma library through path aliases:
- `@enforma` → `../src` (main library)
- `@enforma/schema-builder` → `../src/schema-builder`
- `@enforma/types` → `../src/types`

Any changes to the main library will be immediately available in the builder app during development.