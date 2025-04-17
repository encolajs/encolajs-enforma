import { defineComponent, inject, ref, watch, onBeforeUnmount } from 'vue'
import { useRepeatable } from './useRepeatable'
import { formStateKey } from '@/constants/symbols'

import { FormController } from '@/types'

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
    const formState = inject<FormController>(formStateKey)

    if (!formState) {
      console.error('HeadlessRepeatable must be used within an EncolaForm')
      return () => null
    }

    // Create a trigger ref to force re-rendering when the repeatable data changes
    const renderTrigger = ref(0)

    const repeatableCtrl = useRepeatable(props.name, formState, {
      min: props.min,
      max: props.max,
      validateOnAdd: props.validateOnAdd,
      validateOnRemove: props.validateOnRemove,
    })

    watch(
      () => repeatableCtrl.value,
      () => {
        renderTrigger.value++
      },
      { deep: true }
    )

    // Clean up when component is unmounted
    onBeforeUnmount(() => {
      formState.removeField(props.name)
    })

    return () => {
      // Include renderTrigger in the render function to ensure it re-evaluates
      const currentTrigger = renderTrigger.value
      return ctx.slots.default?.(repeatableCtrl.value)
    }
  },
})
