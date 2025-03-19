import {
  defineComponent,
  inject,
  h,
  SetupContext,
  onBeforeUnmount,
  watch,
} from 'vue'
import { useField } from '../composables/useField'
import { FieldOptions, FormStateReturn, FieldReturn } from '../types'

export default defineComponent({
  name: 'HeadlessField',

  template: `
    <div>
      <slot v-bind="field"></slot>
    </div>
  `,

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

    const field = useField(props.name, formState, {
      validateOn: props.validateOn,
    } as FieldOptions)

    // Handle validation based on validateOn prop
    if (props.validateOn === 'blur') {
      watch(
        () => field.isTouched.value,
        (isTouched) => {
          if (isTouched) {
            formState.validateField(props.name)
          }
        }
      )
    } else if (props.validateOn === 'input' || props.validateOn === 'change') {
      watch(
        () => field.value.value,
        () => {
          formState.validateField(props.name)
        }
      )
    }

    onBeforeUnmount(() => {
      formState.unregisterField(props.name)
    })

    return () => slots.default?.(field)
  },
})
