# Installation

## Prerequisites

- Vue.js 3.x
- NPM or Yarn package manager
- Optional: A UI framework like PrimeVue if you want to use presets

## Installation

You can install Enforma using npm or yarn:

::: code-group
```shell [npm]
npm i @encolajs/enforma
```

```shell [yarn]
yarn add @encolajs/enforma
```

```shell [pnpm]
pnpm add @encolajs/enforma
```
:::

## Basic Configuration

```js
import { createApp } from 'vue'
import { createEnforma } from '@encolajs/enforma'

const enforma = createEnforma({
  // Global configuration options
  pt: {
    // Pass-through props for styling components
    wrapper: {
      class: 'my-field-wrapper',
    },
    label: {
      class: 'my-field-label',
    },
    input: {
      class: 'my-field-input',
    },
    error: {
      class: 'my-field-error',
    },
  },
})

// Register Enforma with Vue
app.use(enforma)
```

## Adding a Preset

If you're using PrimeVue, Enforma provides a preset that integrates seamlessly with PrimeVue components.

### Install PrimeVue First

```bash
npm install primevue
```

### Configure Enforma with PrimeVue Preset

```js
import { usePrimeVuePreset } from '@encolajs/enforma/presets/primevue'
// initialization of the Enforma plugin goes here
usePrimeVuePreset()
```

### Next Steps

For more detailed information about configuring Enforma:

- See [Configuration](/core-concepts/configuration.md) for a complete reference of all configuration options
- Learn about [UI Presets](/presets/index.md) to integrate with various UI libraries