<script setup>
import HydratorExample from './other/HydratorExample.vue'
</script>

# Integration with EncolaJS Hydrator

This example demonstrates how to create a schema-based form with a model-based data source built using <a href="//encolajs.com/hydrator" target="_blank">@encolajs/hydrator</a>. It shows how to implement an order form with a repeatable table of items.
Each item has four fields:
1. **Product Name**: Text input for the item name
2. **Quantity**: Numeric input for the quantity
3. **Price**: Numeric input for the unit price
4. **Total**: Calculated field (quantity × price) that updates automatically, courtesy of **@encolajs/hydrator**

The form also includes an order total that sums up all item totals automagically.

<ClientOnly>
    <LiveDemo :component="HydratorExample"></LiveDemo>
</ClientOnly>

## Source code

::: code-group
<<< @/examples/other/HydratorExample.vue
<<< @/examples/other/useHydrator.ts [Model configuration]
:::
