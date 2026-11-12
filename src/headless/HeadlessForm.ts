import {
  defineComponent,
  provide,
  h,
  PropType,
  inject,
  onBeforeUnmount,
} from 'vue'
import { useForm } from './useForm'
import { formControllerKey, enformaConfigKey } from '@/constants/symbols'
import { FormController } from '@/types'
import { FieldController } from './useForm'
import type { FormValidator } from '@/validators/types'
import { warnRulesDeprecation } from '@/utils/deprecationWarnings'

export default defineComponent({
  name: 'HeadlessForm',

  props: {
    data: {
      type: Object,
      required: true,
    },
    // Old API (deprecated)
    rules: {
      type: Object,
      default: undefined,
    },
    customMessages: {
      type: Object,
      default: () => ({}),
    },
    // New API (recommended)
    validator: {
      type: Object as PropType<FormValidator>,
      default: undefined,
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
    'validation_fail',
    'reset',
    'field_changed',
    'field_focus',
    'field_blur',
    'form_initialized',
  ],

  setup(props, ctx) {
    const enformaConfig = inject(enformaConfigKey, null) as any

    // Determine validator to use
    let validatorOrRules: FormValidator | Record<string, string> | undefined

    if (props.validator) {
      // New API: validator prop provided
      validatorOrRules = props.validator
    } else if (props.rules) {
      // Old API: rules prop provided (deprecated)
      warnRulesDeprecation('HeadlessForm')
      validatorOrRules = props.rules
    }

    // Create form using useForm with callbacks for events. Its events go through its own
    // emitter, which this form alone hears.
    const formCtrl: FormController = useForm(props.data, validatorOrRules, {
      customMessages: props.customMessages,
      submitHandler: props.submitHandler,
    })

    // The handlers registered below, removed as the form unmounts, with the form's controller.
    const handlers: [string, Function][] = []
    const on = (event: string, handler: Function) => {
      handlers.push([event, handler])
      formCtrl.on(event as any, handler)
    }
    onBeforeUnmount(() => {
      for (const [event, handler] of handlers)
        formCtrl.off(event as any, handler)
      formCtrl.destroy()
    })

    // Set up event handlers to forward events to component emits
    on(
      'submit_success',
      ({ formController }: { formController: FormController }) => {
        ctx.emit('submit_success', formController.values(), formController)
      }
    )

    on(
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

    on(
      'validation_fail',
      ({ formController }: { formController: FormController }) => {
        ctx.emit('validation_fail', formController)
      }
    )

    on(
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
        ctx.emit('field_changed', path, value, fieldController, formController)
      }
    )

    on(
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

    on(
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

    on(
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
    on(
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
          ...formCtrl.$formAttrs,
          onSubmit: handleSubmit,
          onReset: handleReset,
          novalidate: true,
        },
        ctx.slots.default?.(formCtrl)
      )
  },
})
