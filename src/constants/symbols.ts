/**
 * Symbol definitions for the form kit for use with provide/inject
 */

import type { FormController } from '@/types'
import { EnformaConfig } from '@/utils/useConfig'

/**
 * Symbol for providing/injecting the form kit configuration
 */
export const formConfigKey = Symbol('formConfig')

/**
 * Symbol for providing/injecting the form state
 */
export const formControllerKey = Symbol('formController')

/**
 * Symbol for providing/injecting the form context
 */
export const formContextKey = Symbol('formContext')

/**
 * Symbol for providing/injecting the form context
 */
export const formSchemaKey = Symbol('formSchema')

/**
 * Symbol for providing/injecting custom field slots
 */
export const formFieldSlotsKey = Symbol('formFieldSlots')

/**
 * Symbol for providing/injecting the Enforma plugin configuration
 */
export const enformaConfigKey = Symbol('enformaConfig')

/**
 * Key of the form controller's method that returns the controller itself. `<Enforma>` reaches
 * its controller through a ref to its `HeadlessForm`, and a component's ref adds the
 * component's own properties (`$el`, `$props`, `$emit`…) to what the component exposes.
 */
export const formControllerSelfKey = Symbol('formControllerSelf')

/**
 * Key of the form controller's method that registers a focus target: what answers
 * `focusField(path)` for a path, and places the path on the page (an Enforma field)
 */
export const formFocusTargetsKey = Symbol('formFocusTargets')

/**
 * Symbol for providing/injecting the panel (a tab, a collapsible) around a field, with the
 * panels around it
 */
export const enformaPanelScopeKey = Symbol('enformaPanelScope')
