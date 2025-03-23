import {
  defineComponent,
  inject,
  SetupContext,
  onBeforeUnmount,
  watch,
  ref,
} from 'vue'
import { useField } from '../../composables/useField'
import { FieldOptions, FormStateReturn } from '../../types'

export default defineComponent({
  name: 'HeadlessField',

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

  setup(props, { slots }: SetupContext) {
    const formState = inject<FormStateReturn>('encolaForm')

    if (!formState) {
      console.error(
        `HeadlessField '${props.name}' must be used within an EncolaForm component`
      )
      return () => null // Return null instead of trying to render
    }
    // Create a trigger ref to force re-rendering when the repeatable data changes
    const renderTrigger = ref(0)

    const field = useField(props.name, formState, {
      validateOn: props.validateOn,
    } as FieldOptions)

    watch(
      () => field.value,
      () => {
        renderTrigger.value++
      },
      { deep: true }
    )

    onBeforeUnmount(() => {
      formState.unregisterField(props.name)
    })

    return () => {
      // Include renderTrigger in the render function to ensure it re-evaluates
      const currentTrigger = renderTrigger.value
      return slots.default?.(field.value)
    }
  },
})
