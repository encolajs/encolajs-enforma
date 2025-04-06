/**
 * Symbol definitions for the form kit for use with Vue's provide/inject
 */

import type { FormKitConfig } from '../types/config'
import type { FormProxy, FormStateReturn } from '../types'

/**
 * Symbol for providing/injecting the form kit configuration
 */
export const formConfigKey = Symbol('formConfig')

/**
 * Symbol for providing/injecting the form state
 */
export const formStateKey = Symbol('formState')

/**
 * Symbol for providing/injecting the form context
 */
export const formContextKey = Symbol('formContext')

/**
 * Symbol for providing/injecting the form context
 */
export const formSchemaKey = Symbol('formSchema')

/**
 * Type definitions for injectable values
 */
export interface InjectableValues {
  [formConfigKey]: FormKitConfig
  [formStateKey]: FormProxy
  [formContextKey]: Record<string, any>
  [formSchemaKey]: Record<string, any>
}
