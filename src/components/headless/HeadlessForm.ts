import { defineComponent, provide, h, PropType } from 'vue'
import { useForm } from '../../composables/useForm'
import { formStateKey } from '../../constants/symbols'
import { FormProxy } from '../../types'

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
      type: Function as PropType<(data: any) => Promise<void>>,
      default: () => {
        return Promise.resolve(true)
      },
    },
    validateOn: {
      type: String as PropType<'input' | 'change' | 'blur' | 'submit'>,
      default: 'change',
      validator: (value: string) =>
        ['input', 'change', 'blur', 'submit'].includes(value),
    },
  },

  emits: ['submit-success', 'submit-error', 'validation-error', 'reset'],

  setup(props, ctx) {
    // Create form using useForm
    const form: FormProxy = useForm(props.data, props.rules, {
      customMessages: props.customMessages,
      submitHandler: props.submitHandler,
    })

    // Provide form to child components
    provide(formStateKey, form)

    // Handle form submission
    const handleSubmit = async (e: Event) => {
      e.preventDefault()
      try {
        // First validate the form
        const isValid = await form.validate()

        if (!isValid) {
          ctx.emit('validation-error', form)
          return
        }

        // If valid, then submit
        await form.submit(props.submitHandler)
        ctx.emit('submit-success', form.values())
      } catch (error) {
        ctx.emit('submit-error', error)
      }
    }

    // Handle form reset
    const handleReset = () => {
      form.reset()
      ctx.emit('reset', true)
    }

    // Expose form methods to parent component
    ctx.expose({
      reset: form.reset,
      submit: () => form.submit(props.submitHandler),
      validate: form.validate,
      validateField: form.validateField,
      setFieldValue: form.setFieldValue,
      getField: form.getField,
      values: form.values,
    })

    return () =>
      h(
        'form',
        {
          onSubmit: handleSubmit,
          onReset: handleReset,
          novalidate: true,
        },
        ctx.slots.default?.(form)
      )
  },
})
