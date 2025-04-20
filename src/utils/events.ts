import mitt, { Emitter } from 'mitt'
import { FormController, FieldState } from '@/types'

/**
 * Form events types
 */
export type FormEventType =
  | 'submit_success'
  | 'submit_error'
  | 'validation_error'
  | 'field_changed'
  | 'field_focused'
  | 'field_blurred'
  | 'form_reset'
  | 'form_initialized'

/**
 * Form events payload types
 */
export type FormEvents = {
  submit_success: {
    formController: FormController
  }
  submit_error: {
    error: any
    formController: FormController
  }
  validation_error: {
    formController: FormController
  }
  field_changed: {
    path: string
    value: any
    fieldState: FieldState
    formController: FormController
  }
  field_focused: {
    path: string
    fieldState: FieldState
    formController: FormController
  }
  field_blurred: {
    path: string
    fieldState: FieldState
    formController: FormController
  }
  form_reset: {
    formController: FormController
  }
  form_initialized: {
    formController: FormController
  }
}

/**
 * Create a new event emitter
 */
export function createFormEmitter(): Emitter<FormEvents> {
  return mitt<FormEvents>()
}

// Export singleton event emitter for global events
export const globalFormEmitter = createFormEmitter()
