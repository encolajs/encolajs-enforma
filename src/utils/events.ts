import { FormController, FieldController } from '@/types'

/**
 * A handler for one event: it receives the event's payload
 */
export type Handler<T = unknown> = (event: T) => void

/**
 * A handler for every event ('*'): it receives the event's type and payload
 */
export type WildcardHandler<Events extends Record<string, unknown>> = (
  type: keyof Events,
  event: Events[keyof Events]
) => void

/**
 * An event emitter (the same API as mitt's, which Enforma used before)
 */
export interface Emitter<Events extends Record<string, unknown>> {
  /** The handlers, by event type ('*' holds the ones for every event) */
  all: Map<
    keyof Events | '*',
    Array<Handler<Events[keyof Events]> | WildcardHandler<Events>>
  >
  on<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): void
  on(type: '*', handler: WildcardHandler<Events>): void
  /** Without a handler, removes all the handlers of that event */
  off<Key extends keyof Events>(type: Key, handler?: Handler<Events[Key]>): void
  off(type: '*', handler?: WildcardHandler<Events>): void
  emit<Key extends keyof Events>(type: Key, event: Events[Key]): void
}

/**
 * Form events types
 */
export type FormEventType =
  | 'submit_success'
  | 'submit_error'
  | 'validation_fail'
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
  validation_fail: {
    formController: FormController
  }
  field_changed: {
    path: string
    value: any
    fieldController: FieldController
    formController: FormController
  }
  field_focused: {
    path: string
    fieldController: FieldController
    formController: FormController
  }
  field_blurred: {
    path: string
    fieldController: FieldController
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
  const all: Emitter<FormEvents>['all'] = new Map()

  return {
    all,

    on(type: keyof FormEvents | '*', handler: Function) {
      const handlers = all.get(type)
      if (handlers) {
        handlers.push(handler as any)
      } else {
        all.set(type, [handler as any])
      }
    },

    off(type: keyof FormEvents | '*', handler?: Function) {
      const handlers = all.get(type)
      if (!handlers) {
        return
      }
      if (!handler) {
        all.set(type, [])
        return
      }
      const index = handlers.indexOf(handler as any)
      if (index !== -1) {
        handlers.splice(index, 1)
      }
    },

    emit(type: keyof FormEvents, event: any) {
      // Copies of the lists: a handler that removes itself doesn't make the next one skip
      for (const handler of [...(all.get(type) ?? [])]) {
        ;(handler as Handler)(event)
      }
      for (const handler of [...(all.get('*') ?? [])]) {
        ;(handler as WildcardHandler<FormEvents>)(type, event)
      }
    },
  }
}

// Export singleton event emitter for global events
export const globalFormEmitter = createFormEmitter()
