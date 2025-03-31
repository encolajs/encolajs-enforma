import { defineComponent, inject, ref, watch } from 'vue'
import { useRepeatable } from '../../composables/useRepeatable'
import type { FormStateReturn } from '../../types'
import { formStateKey } from '../../constants/symbols'

export default defineComponent({
  name: 'HeadlessRepeatable',

  props: {
    name: {
      type: String,
      required: true,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: undefined,
    },
    defaultValue: {
      type: null,
      default: null,
    },
    validateOnAdd: {
      type: Boolean,
      default: true,
    },
    validateOnRemove: {
      type: Boolean,
      default: true,
    },
  },

  setup(props, ctx) {
    const formState = inject<FormStateReturn>(formStateKey)

    if (!formState) {
      console.error('HeadlessRepeatable must be used within an EncolaForm')
      return () => null
    }

    // Create a trigger ref to force re-rendering when the repeatable data changes
    const renderTrigger = ref(0)

    const repeatable = useRepeatable(props.name, formState, {
      min: props.min,
      max: props.max,
      validateOnAdd: props.validateOnAdd,
      validateOnRemove: props.validateOnRemove,
    })

    watch(
      () => repeatable.value,
      () => {
        renderTrigger.value++
      },
      { deep: true }
    )

    return () => {
      // Include renderTrigger in the render function to ensure it re-evaluates
      const currentTrigger = renderTrigger.value
      return ctx.slots.default?.(repeatable.value)
    }
  },
})
