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
import { FieldOptions, FormProxy } from '../../types'
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
    const form = inject<FormProxy>(formStateKey)

    if (!form) {
      console.error(
        `HeadlessField '${props.name}' must be used within an EncolaForm component`
      )
      return () => null // Return null instead of trying to render
    }
    // Create a trigger ref to force re-rendering when the repeatable data changes
    const renderTrigger = ref(0)

    const unwatchers: Function[] = []

    onBeforeUnmount(() => {
      if (props.name) {
        form.removeField(props.name)
      }
      if (props.names) {
        Object.values(props.names).map(form.removeField)
      }
      unwatchers.forEach((unwatch) => unwatch())
    })

    // Handle single field case (backwards compatibility)
    if (props.name && !props.names) {
      const field = useField(props.name, form, {
        validateOn: props.validateOn,
      } as FieldOptions)

      unwatchers.push(watch(
        () => field.value,
        () => {
          renderTrigger.value++
        },
        { deep: true }
      ))

      return () => {
        // Include renderTrigger in the render function to ensure it re-evaluates
        const currentTrigger = renderTrigger.value
        return slots.default?.(field.value)
      }
    }

    // Handle multiple fields case
    if (props.names) {
      const fields = computed(() =>
        Object.entries(props.names || {}).reduce((acc, [key, fieldName]) => {
          acc[key] = useField(fieldName, form, {
            validateOn: props.validateOn,
          } as FieldOptions).value

          unwatchers.push(watch(
            () => acc[key].value,
            () => {
              renderTrigger.value++
            },
            { deep: true }
          ))

          return acc
        }, {} as Record<string, any>)
      )

      // Return slot with fields object
      return () => slots.default?.(fields.value)
    }

    console.error('HeadlessField requires either name or names prop')
    return () => null
  },
})
