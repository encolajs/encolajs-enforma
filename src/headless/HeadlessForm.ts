import { defineComponent, provide, h, PropType } from 'vue'
import { useForm } from './useForm'
import { formControllerKey } from '@/constants/symbols'
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
    'submit_success',
    'submit_error',
    'validation_error',
    'reset',
    'field_change',
    'field_focus',
    'field_blur',
    'form_initialized',
  ],

  setup(props, ctx) {
    // Create form using useForm with callbacks for events and global events option
    const formCtrl: FormController = useForm(props.data, props.rules, {
      customMessages: props.customMessages,
      submitHandler: props.submitHandler,
      useGlobalEvents: true, // Use global event emitter for component integration
      onValidationError: (form) => {
        ctx.emit('validation_error', form)
      },
      onSubmitSuccess: (data) => {
        ctx.emit('submit_success', data)
      },
      onSubmitError: (error, form) => {
        ctx.emit('submit_error', error, form)
      },
    })

    // Set up event handlers to forward events to component emits
    formCtrl.on(
      'submit_success',
      ({ formController }: { formController: FormController }) => {
        ctx.emit('submit_success', formController.values(), formController)
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
        ctx.emit('submit_error', error, formController)
      }
    )

    formCtrl.on(
      'validation_error',
      ({ formController }: { formController: FormController }) => {
        ctx.emit('validation_error', formController)
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
        ctx.emit('field_change', path, value, fieldController, formController)
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
        ctx.emit('field_focus', path, fieldController, formController)
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
        ctx.emit('field_blur', path, fieldController, formController)
      }
    )

    formCtrl.on(
      'form_initialized',
      ({ formController }: { formController: FormController }) => {
        ctx.emit('form_initialized', formController)
      }
    )

    // Provide form to child components
    provide(formControllerKey, formCtrl)

    // Handle form submission
    const handleSubmit = async (e: Event) => {
      e.preventDefault()
      try {
        await formCtrl.submit()
      } catch (error) {
        console.error('[Enforma] Error submitting form', error)
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
    ctx.expose(formCtrl)

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
