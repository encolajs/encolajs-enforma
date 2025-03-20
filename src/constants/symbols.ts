/**
 * Symbol definitions for the form kit for use with Vue's provide/inject
 */

import type { FormKitConfig } from '../types/config'
import type { FormStateReturn } from '../types'

/**
 * Symbol for providing/injecting the form kit configuration
 */
export const FORM_KIT_CONFIG = Symbol('form-kit-config')

/**
 * Symbol for providing/injecting the form state
 */
export const FORM_STATE = Symbol('form-state')

/**
 * Symbol for providing/injecting the form context
 */
export const FORM_CONTEXT = Symbol('form-context')

/**
 * Symbol for providing/injecting the field registry
 */
export const FIELD_REGISTRY = Symbol('field-registry')

/**
 * Type definitions for injectable values
 */
export interface InjectableValues {
  [FORM_KIT_CONFIG]: FormKitConfig
  [FORM_STATE]: FormStateReturn
  [FORM_CONTEXT]: Record<string, any>
  [FIELD_REGISTRY]: Record<string, any>
}
