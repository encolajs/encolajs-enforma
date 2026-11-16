/**
 * Renders Enforma's schema components under a form controller the host made itself.
 *
 * `<Enforma>` makes its own controller (through `HeadlessForm`) and its own `<form>` element. A
 * host that keeps its own controller, from `useForm()`, with its own validator, its own `<form>`
 * and its own submit handling, calls `provideEnformaForm()` in its `setup()` instead, then renders
 * `<EnformaSchema :schema>` (or `<EnformaField>`s) below it. Everything a field, a section and a
 * repeatable injects is provided here: the controller, the schema, the context and the form's
 * config, which is the global one with `config` on top.
 *
 * The controller is used as it is: its validator holds the rules, so the rules in the schema are
 * left to the host, and nothing here creates, submits or destroys it.
 */
import {
  computed,
  onBeforeUnmount,
  provide,
  toValue,
  type ComputedRef,
  type MaybeRefOrGetter,
} from 'vue'
import {
  formConfigKey,
  formContextKey,
  formControllerKey,
  formFieldSlotsKey,
  formSchemaKey,
} from '@/constants/symbols'
import type { FormController, FormSchema } from '@/types'
import {
  useConfig,
  type DeepPartial,
  type EnformaConfig,
} from '@/utils/useConfig'
import { goToFirstError } from './useFocusTarget'

export interface ProvideEnformaFormOptions {
  /** The form controller, from `useForm()`. */
  controller: FormController
  /** The form's schema, which `<EnformaSchema>` and `<EnformaField name>` read. */
  schema?: MaybeRefOrGetter<FormSchema | null | undefined>
  /** The form's own config, merged over the global one. Its components are taken as they are. */
  config?: MaybeRefOrGetter<DeepPartial<EnformaConfig> | null | undefined>
  /** The context expressions read as `context`. */
  context?: MaybeRefOrGetter<Record<string, any> | null | undefined>
}

/** Provides what Enforma's components inject, for a controller the host made. */
export function provideEnformaForm(options: ProvideEnformaFormOptions): {
  config: ComputedRef<EnformaConfig>
} {
  const config = computed(() => useConfig(toValue(options.config) ?? {}))
  provide(formControllerKey, options.controller)
  provide(
    formSchemaKey,
    computed(() => toValue(options.schema) ?? {})
  )
  provide(
    formContextKey,
    computed(() => toValue(options.context) ?? {})
  )
  provide(formConfigKey, config)
  // The slots of an `<Enforma>` further up aren't used for this form's fields
  provide(formFieldSlotsKey, null)
  // A refused submit goes to the first field with errors, as in an `<Enforma>`
  const onValidationFail = () =>
    goToFirstError(options.controller, config.value)
  options.controller.on('validation_fail', onValidationFail)
  onBeforeUnmount(() =>
    options.controller.off('validation_fail', onValidationFail)
  )
  return { config }
}
