import {
  defineComponent,
  inject,
  SetupContext,
  onBeforeUnmount,
  watch,
  ref,
  computed,
} from 'vue'
import { useField } from '../../composables/useField'
import { FieldOptions, FormStateReturn } from '../../types'
import { formStateKey } from '../../constants/symbols'

export default defineComponent({
  name: 'HeadlessField',

  props: {
    name: {
      type: String,
      required: false,
    },
    names: {
      type: Object,
      required: false,
    },
    validateOn: {
      type: String,
      default: null,
      validator: (value: string) =>
        !value || ['input', 'change', 'blur', 'submit'].includes(value),
    },
  },

  setup(props, { slots }: SetupContext) {
    const formState = inject<FormStateReturn>(formStateKey)

    if (!formState) {
      console.error(
        `HeadlessField '${props.name}' must be used within an EncolaForm component`
      )
      return () => null // Return null instead of trying to render
    }
    // Create a trigger ref to force re-rendering when the repeatable data changes
    const renderTrigger = ref(0)

    // Handle single field case (backwards compatibility)
    if (props.name && !props.names) {
      const field = useField(props.name, formState, {
        validateOn: props.validateOn,
      } as FieldOptions)

      const unwatch = watch(
        () => field.value,
        () => {
          renderTrigger.value++
        },
        { deep: true }
      )

      onBeforeUnmount(() => {
        formState.unregisterField(props.name)
        unwatch()
      })

      return () => {
        // Include renderTrigger in the render function to ensure it re-evaluates
        const currentTrigger = renderTrigger.value
        return slots.default?.(field.value)
      }
    }

    // Handle multiple fields case
    if (props.names) {
      const unwatchers: Record<string, Function> = {}
      const fields = computed(() =>
        Object.entries(props.names || {}).reduce((acc, [key, fieldName]) => {
          acc[key] = useField(fieldName, formState, {
            validateOn: props.validateOn,
          } as FieldOptions).value

          unwatchers[key] = watch(
            () => acc[key].value,
            () => {
              renderTrigger.value++
            },
            { deep: true }
          )

          return acc
        }, {} as Record<string, any>)
      )

      // Cleanup on unmount
      onBeforeUnmount(() => {
        Object.values(props.names as Array<string>).forEach((fieldName) => {
          formState.unregisterField(fieldName)
          unwatchers[fieldName]()
        })
      })

      // Return slot with fields object
      return () => slots.default?.(fields.value)
    }

    console.error('HeadlessField requires either name or names prop')
    return () => null
  },
})
