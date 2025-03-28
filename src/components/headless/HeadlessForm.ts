import { defineComponent, provide, h, PropType } from 'vue'
import { useFormState } from '../../composables/useFormState'
import { DataSourceInterface } from '@encolajs/validator'
import { formStateKey } from '../../constants/symbols'

export default defineComponent({
  name: 'HeadlessForm',

  props: {
    data: {
      type: Object,
      required: true,
    },
    rules: {
      type: Object,
      default: () => ({}),
    },
    customMessages: {
      type: Object,
      default: () => ({}),
    },
    submitHandler: {
      type: Function,
      default: null,
    },
    validateOn: {
      type: String as PropType<'input' | 'change' | 'blur' | 'submit'>,
      default: 'blur',
      validator: (value: string) =>
        ['input', 'change', 'blur', 'submit'].includes(value),
    },
  },

  emits: ['submit', 'submit-error', 'validation-error', 'reset'],

  setup(props, ctx) {
    const formState = useFormState(
      props.data as DataSourceInterface,
      props.rules,
      {
        customMessages: props.customMessages,
        validateOn: props.validateOn,
        submitHandler: async (data) => {
          if (props.submitHandler) {
            try {
              await props.submitHandler(data)
              ctx.emit('submit', data)
            } catch (error) {
              ctx.emit('submit-error', error)
              throw error
            }
          } else {
            ctx.emit('submit', data)
          }
        },
      }
    )

    provide(formStateKey, formState)

    ctx.expose({
      reset: formState.reset,
      submit: formState.submit,
      validate: formState.validate,
      validateField: formState.validateField,
      setFieldValue: formState.setFieldValue,
      getField: formState.getField,
      getData: formState.getData,
    })

    return () =>
      h(
        'form',
        {
          onSubmit: (e: Event) => {
            e.preventDefault()
            return formState.submit()
          },
          novalidate: true,
        },
        ctx.slots.default?.(formState)
      )
  },
})
