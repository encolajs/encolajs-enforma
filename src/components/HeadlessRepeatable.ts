import { defineComponent, h, inject } from 'vue'
import { useRepeatable } from '../composables/useRepeatable'
import type { FormStateReturn } from '../types'

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
    const formState = inject<FormStateReturn>('encolaForm')

    if (!formState) {
      console.error('HeadlessRepeatable must be used within an EncolaForm')
      return () => null
    }

    const repeatable = useRepeatable(props.name, formState, {
      min: props.min,
      max: props.max,
      validateOnAdd: props.validateOnAdd,
      validateOnRemove: props.validateOnRemove,
    })

    // Clean up field states on unmount
    ctx.expose({
      cleanup: repeatable.cleanup,
    })

    return () => h('div', {}, [ctx.slots.default?.(repeatable)])
  },
})
