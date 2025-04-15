import { defineComponent, provide, h, PropType } from 'vue'
import { useForm } from './useForm'
import { formStateKey } from '@/constants/symbols'
import { FormController } from '@/types'

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
  },

  emits: ['submit-success', 'submit-error', 'validation-error', 'reset'],

  setup(props, ctx) {
    // Create form using useForm with callbacks for events
    const form: FormController = useForm(props.data, props.rules, {
      customMessages: props.customMessages,
      submitHandler: props.submitHandler,
      onValidationError: (form) => {
        ctx.emit('validation-error', form)
      },
      onSubmitSuccess: (data) => {
        ctx.emit('submit-success', data)
      },
      onSubmitError: (error) => {
        ctx.emit('submit-error', error)
      },
    })

    // Provide form to child components
    provide(formStateKey, form)

    // Handle form submission
    const handleSubmit = async (e: Event) => {
      e.preventDefault()
      try {
        await form.submit()
      } catch (error) {
        console.error('Error submitting form', error)
        // Error already emitted via callback, but we catch it here to prevent it from propagating
      }
    }

    // Handle form reset
    const handleReset = () => {
      form.reset()
      ctx.emit('reset', true)
    }

    // Expose form methods to parent component
    ctx.expose({ ...form })

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
