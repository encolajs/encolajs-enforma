# `<EnformaRequiredIndicator/>` API

The `EnformaRequiredIndicator` component renders the required field indicator (typically an asterisk "*") with full customization support.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `String` | `'*'` | Text or HTML content for the indicator (supports translation keys) |
| `as` | `String\|Component` | `'span'` | Component to render as (e.g., 'span', 'strong', or a custom component) |

## Usage

### Basic Usage

```vue
<template>
  <label>
    Email
    <EnformaRequiredIndicator />
  </label>
</template>
```

### Custom Content

```vue
<template>
  <label>
    Name
    <EnformaRequiredIndicator content="(required)" />
  </label>
</template>
```

### Custom Component

```vue
<template>
  <label>
    Phone
    <EnformaRequiredIndicator 
      content="●" 
      as="strong"
      class="text-red-500"
    />
  </label>
</template>
```

### HTML Content

```vue
<template>
  <label>
    Address
    <EnformaRequiredIndicator 
      content='<i class="fas fa-asterisk"></i>' 
    />
  </label>
</template>
```

## Configuration

The component can be globally configured through pass-through configuration:

```js
const config = {
  pt: {
    required: {
      content: '●',           // Global content override
      as: 'strong',           // Global component override
      class: 'text-red-500',  // Global styling
      'aria-label': 'Required field'
    }
  }
}
```

## Translation Support

The `content` prop supports translation keys:

```vue
<EnformaRequiredIndicator content="labels.required" />
```

The content will be automatically translated using your application's translation system.

## Styling

The component uses the following configuration:

- `pt.required` - Props passed to the component wrapper
- `pt.required.content` - Override the default content
- `pt.required.as` - Override the default component type