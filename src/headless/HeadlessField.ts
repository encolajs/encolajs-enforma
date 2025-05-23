import {
  defineComponent,
  inject,
  onBeforeUnmount,
  watch,
  ref,
  computed,
  ComputedRef,
  onMounted,
  effectScope,
  watchEffect,
} from 'vue'
import { useField } from './useField'
import {
  FieldController,
  FieldControllerExport,
  FieldOptions,
  FormController,
} from '@/types'
import { formControllerKey } from '@/constants/symbols'

export default defineComponent({
  name: 'HeadlessField',

  // Explicitly declare emitted events to avoid Vue warnings
  emits: ['input', 'change', 'blur', 'focus'],

  props: {
    name: {
      type: String,
      required: true,
    },
    validateOn: {
      type: String,
      default: null,
      validator: (value: string) =>
        !value || ['input', 'change', 'blur', 'submit'].includes(value),
    },
  },

  setup(props, { slots }) {
    const form = inject<FormController>(formControllerKey)

    if (!form) {
      console.error(
        `[Enforma] HeadlessField '${props.name}' must be used within an EncolaForm component`
      )
      return () => null // Return null instead of trying to render
    }

    // Create effectScope for automatic cleanup management
    const componentScope = effectScope()

    let renderTrigger: any
    let fieldCtrl: ComputedRef<FieldControllerExport>

    componentScope.run(() => {
      // Create a trigger ref to force re-rendering when the data changes
      renderTrigger = ref(0)

      fieldCtrl = useField(props.name, form, {
        validateOn: props.validateOn,
      } as FieldOptions)

      // Use watchEffect for selective tracking instead of deep watching
      watchEffect(() => {
        // Only track specific properties that affect rendering
        const value = fieldCtrl.value.value
        const error = fieldCtrl.value.error
        const isDirty = fieldCtrl.value.isDirty
        const isTouched = fieldCtrl.value.isTouched
        const isValidating = fieldCtrl.value.isValidating

        // Trigger re-render when these specific properties change
        renderTrigger.value++
      })
    })

    onMounted(() => fieldCtrl.value.initField?.())

    onBeforeUnmount(() => {
      form.removeField(props.name)
      // Single call cleans up all effects created within the scope
      componentScope.stop()
    })

    return () => {
      // Include renderTrigger in the render function to ensure it re-evaluates
      const currentTrigger = renderTrigger.value
      return slots.default?.(fieldCtrl.value)
    }
  },
})
