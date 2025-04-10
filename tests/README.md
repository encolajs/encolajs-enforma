# Testing Components in Isolation

This directory contains tests for the FormKit components. When testing components in isolation, we need to provide the necessary configuration that would normally be provided by the parent `FormKit` component.

## Test Utility

We've created a test utility to help with testing components in isolation. The utility provides the necessary configuration to the components being tested.

### Usage

```typescript
import { mountTestComponent } from '../utils/testSetup'
import YourComponent from '@/core/YourComponent.vue'

describe('YourComponent', () => {
  it('renders correctly', () => {
    const wrapper = mountTestComponent(YourComponent, {
      // Props to pass to the component
      prop1: 'value1',
      prop2: 'value2'
    })
    
    // Your assertions here
    expect(wrapper.find('.some-class').exists()).toBe(true)
  })
})
```

### Custom Configuration

You can also provide custom configuration to override the default configuration:

```typescript
import { mountTestComponent } from '../utils/testSetup'
import YourComponent from '@/core/YourComponent.vue'

describe('YourComponent', () => {
  it('renders with custom configuration', () => {
    const wrapper = mountTestComponent(
      YourComponent,
      {
        // Props to pass to the component
        prop1: 'value1'
      },
      {
        // Custom configuration
        classes: {
          field: {
            field: 'custom-field-class'
          }
        }
      }
    )
    
    // Your assertions here
    expect(wrapper.find('.custom-field-class').exists()).toBe(true)
  })
})
```

## Testing Components with Slots

When testing components that use slots, you can provide slot content using the `slots` option:

```typescript
import { mountTestComponent } from '../utils/testSetup'
import YourComponent from '@/core/YourComponent.vue'

describe('YourComponent', () => {
  it('renders with slot content', () => {
    const wrapper = mountTestComponent(
      YourComponent,
      {
        // Props to pass to the component
        prop1: 'value1'
      },
      {},
      {
        // Slot content
        default: '<div>Default slot content</div>',
        header: '<div>Header slot content</div>'
      }
    )
    
    // Your assertions here
    expect(wrapper.text()).toContain('Default slot content')
    expect(wrapper.text()).toContain('Header slot content')
  })
})
```

## Testing Components with Events

When testing components that emit events, you can listen for events using the `emits` option:

```typescript
import { mountTestComponent } from '../utils/testSetup'
import YourComponent from '@/core/YourComponent.vue'

describe('YourComponent', () => {
  it('emits events correctly', async () => {
    const wrapper = mountTestComponent(YourComponent, {
      // Props to pass to the component
      prop1: 'value1'
    })
    
    // Trigger an event
    await wrapper.find('button').trigger('click')
    
    // Check that the event was emitted
    expect(wrapper.emitted('click')).toBeTruthy()
  })
}) 