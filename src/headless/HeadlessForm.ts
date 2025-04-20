import { defineComponent, provide, h, PropType } from 'vue'
import { useForm } from './useForm'
import { formStateKey } from '@/constants/symbols'
import { FormController } from '@/types'
import { FieldController } from './useForm'

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

  emits: [
    'submit-success',
    'submit-error',
    'validation-error',
    'reset',
    'field-changed',
    'field-focused',
    'field-blurred',
    'form-initialized',
  ],

  setup(props, ctx) {
    // Create form using useForm with callbacks for events and global events option
    const formCtrl: FormController = useForm(props.data, props.rules, {
      customMessages: props.customMessages,
      submitHandler: props.submitHandler,
      useGlobalEvents: true, // Use global event emitter for component integration
      onValidationError: (form) => {
        ctx.emit('validation-error', form)
      },
      onSubmitSuccess: (data) => {
        ctx.emit('submit-success', data)
      },
      onSubmitError: (error, form) => {
        ctx.emit('submit-error', error, form)
      },
    })

    // Set up event handlers to forward events to component emits
    formCtrl.on(
      'submit_success',
      ({ formController }: { formController: FormController }) => {
        ctx.emit('submit-success', formController.values(), formController)
      }
    )

    formCtrl.on(
      'submit_error',
      ({
        error,
        formController,
      }: {
        error: any
        formController: FormController
      }) => {
        ctx.emit('submit-error', error, formController)
      }
    )

    formCtrl.on(
      'validation_error',
      ({ formController }: { formController: FormController }) => {
        ctx.emit('validation-error', formController)
      }
    )

    formCtrl.on(
      'field_changed',
      ({
        path,
        value,
        fieldController,
        formController,
      }: {
        path: string
        value: any
        fieldController: FieldController
        formController: FormController
      }) => {
        ctx.emit('field-changed', path, value, fieldController, formController)
      }
    )

    formCtrl.on(
      'field_focused',
      ({
        path,
        fieldController,
        formController,
      }: {
        path: string
        fieldController: FieldController
        formController: FormController
      }) => {
        ctx.emit('field-focused', path, fieldController, formController)
      }
    )

    formCtrl.on(
      'field_blurred',
      ({
        path,
        fieldController,
        formController,
      }: {
        path: string
        fieldController: FieldController
        formController: FormController
      }) => {
        ctx.emit('field-blurred', path, fieldController, formController)
      }
    )

    formCtrl.on(
      'form_initialized',
      ({ formController }: { formController: FormController }) => {
        ctx.emit('form-initialized', formController)
      }
    )

    // Provide form to child components
    provide(formStateKey, formCtrl)

    // Handle form submission
    const handleSubmit = async (e: Event) => {
      e.preventDefault()
      try {
        await formCtrl.submit()
      } catch (error) {
        console.error('Error submitting form', error)
        // Error already emitted via callback, but we catch it here to prevent it from propagating
      }
    }

    // Handle form reset
    const handleReset = () => {
      formCtrl.reset()
      ctx.emit('reset', formCtrl)
    }

    // Also listen for form_reset event
    formCtrl.on(
      'form_reset',
      ({ formController }: { formController: FormController }) => {
        ctx.emit('reset', formController)
      }
    )

    // Expose form methods to parent component
    ctx.expose({ ...formCtrl })

    return () =>
      h(
        'form',
        {
          onSubmit: handleSubmit,
          onReset: handleReset,
          novalidate: true,
        },
        ctx.slots.default?.(formCtrl)
      )
  },
})
