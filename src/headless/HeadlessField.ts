import {
  defineComponent,
  inject,
  onBeforeUnmount,
  watch,
  ref,
  computed,
  ComputedRef, onMounted,
} from 'vue'
import { useField } from './useField'
import { FieldController, FieldOptions, FormController } from '@/types'
import { formStateKey } from '@/constants/symbols'

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
    const form = inject<FormController>(formStateKey)

    if (!form) {
      console.error(
        `HeadlessField '${props.name}' must be used within an EncolaForm component`
      )
      return () => null // Return null instead of trying to render
    }
    
    // Create a trigger ref to force re-rendering when the data changes
    const renderTrigger = ref(0)
    const unwatchers: Function[] = []

    onBeforeUnmount(() => {
      form.removeField(props.name)
      unwatchers.forEach((unwatch) => unwatch())
    })

    const fieldCtrl: ComputedRef<FieldController> = useField(props.name, form, {
      validateOn: props.validateOn,
    } as FieldOptions)

    onMounted(fieldCtrl.value.initField)

    unwatchers.push(
      watch(
        () => fieldCtrl.value,
        () => {
          renderTrigger.value++
        },
        { deep: true }
      )
    )

    return () => {
      // Include renderTrigger in the render function to ensure it re-evaluates
      const currentTrigger = renderTrigger.value
      return slots.default?.(fieldCtrl.value)
    }
  },
})
