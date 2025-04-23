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
