/**
 * Symbol definitions for the form kit for use with provide/inject
 */

import type { FormController } from '@/types'
import { FormKitConfig } from '@/utils/useConfig'

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
  [formStateKey]: FormController
  [formContextKey]: Record<string, any>
  [formSchemaKey]: Record<string, any>
}
