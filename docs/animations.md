# Animations in FormKit Repeatable Components

FormKit supports animations for repeatable field components, making your forms more interactive and providing better visual feedback when items are added, removed, or reordered.

## Basic Usage

Animations are enabled by default for standard repeatable components and disabled for table repeatable components. You can explicitly control this behavior with the `animations` prop:

```vue
<!-- With animations enabled (default for standard repeatable) -->
<FormKitRepeatable name="items" :animations="true" />

<!-- With animations disabled -->
<FormKitRepeatable name="items" :animations="false" />

<!-- Table repeatable (animations disabled by default) -->
<FormKitRepeatableTable name="items" />

<!-- Table repeatable with animations explicitly enabled -->
<FormKitRepeatableTable name="items" :animations="true" />
```

## Animation Configuration

For more control over animations, you can pass an object with configuration options:

```vue
<FormKitRepeatable 
  name="items"
  :animations="{
    enabled: true,      // Master toggle
    duration: 500,      // Duration in milliseconds (default: 300)
    easing: 'ease-out', // CSS easing function (default: 'ease')
    add: true,          // Enable add animations
    remove: true,       // Enable remove animations
    move: true          // Enable move animations
  }"
/>
```

## Animation Effects

The following animations are applied:

1. **Add**: New items fade in and slide from above
2. **Remove**: Items fade out and collapse smoothly
3. **Move**: Items animate smoothly to their new positions when reordering

## Styling

Animation styles are applied using CSS variables that you can override in your own stylesheets:

```css
.repeatable-item {
  --repeatable-animation-duration: 300ms;
  --repeatable-animation-easing: ease;
}
```

## Table Components and Animations

Due to browser limitations on animating table rows (`<tr>` elements), animations are disabled by default for `FormKitRepeatableTable`. While you can enable them, please note that:

1. Only opacity and transform animations will work reliably
2. Height animations on table rows can cause layout issues
3. For the best animation experience, consider using the standard `FormKitRepeatable` instead

If you do enable animations for table components, you may need additional CSS to handle browser-specific issues.

## Accessibility Considerations

Animations can be problematic for users with vestibular disorders or motion sensitivity. Consider:

1. Respecting user preferences with the `prefers-reduced-motion` media query
2. Keeping animations subtle and brief
3. Providing a way for users to disable animations

```css
@media (prefers-reduced-motion: reduce) {
  .repeatable-item {
    --repeatable-animation-duration: 0ms !important;
  }
}
```