/**
 * Symbol definitions for the form kit for use with Vue's provide/inject
 */

import type { FormKitConfig } from '../types/config'
import type { FormStateReturn } from '../types'

/**
 * Symbol for providing/injecting the form kit configuration
 */
export const formConfigKey = Symbol()

/**
 * Symbol for providing/injecting the form state
 */
export const formStateKey = Symbol()

/**
 * Symbol for providing/injecting the form context
 */
export const formContextKey = Symbol()

/**
 * Symbol for providing/injecting the form context
 */
export const formSchemaKey = Symbol()

/**
 * Type definitions for injectable values
 */
export interface InjectableValues {
  [formConfigKey]: FormKitConfig
  [formStateKey]: FormStateReturn
  [formContextKey]: Record<string, any>
  [formSchemaKey]: Record<string, any>
}
