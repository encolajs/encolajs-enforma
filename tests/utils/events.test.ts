import { describe, test, expect, vi } from 'vitest'
import { createFormEmitter, globalFormEmitter } from '@/utils/events'

describe('Form Events', () => {
  test('createFormEmitter should create a new event emitter', () => {
    const emitter = createFormEmitter()
    expect(emitter).toBeDefined()
    expect(typeof emitter.on).toBe('function')
    expect(typeof emitter.off).toBe('function')
    expect(typeof emitter.emit).toBe('function')
  })

  test('globalFormEmitter should be a singleton', () => {
    expect(globalFormEmitter).toBeDefined()
    expect(typeof globalFormEmitter.on).toBe('function')
    expect(typeof globalFormEmitter.off).toBe('function')
    expect(typeof globalFormEmitter.emit).toBe('function')
  })

  test('events should be triggered and listened to', () => {
    const emitter = createFormEmitter()
    const handler = vi.fn()
    const formData = { formController: { id: 'test' } }

    emitter.on('submit_success', handler)
    emitter.emit('submit_success', formData)

    expect(handler).toHaveBeenCalledWith(formData)
  })

  test('events should be unregistered with off', () => {
    const emitter = createFormEmitter()
    const handler = vi.fn()
    const formData = { formController: { id: 'test' } }

    emitter.on('submit_success', handler)
    emitter.off('submit_success', handler)
    emitter.emit('submit_success', formData)

    expect(handler).not.toHaveBeenCalled()
  })

  test('multiple handlers should work for the same event', () => {
    const emitter = createFormEmitter()
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    const formData = { formController: { id: 'test' } }

    emitter.on('submit_success', handler1)
    emitter.on('submit_success', handler2)
    emitter.emit('submit_success', formData)

    expect(handler1).toHaveBeenCalledWith(formData)
    expect(handler2).toHaveBeenCalledWith(formData)
  })

  test('different events should not trigger each other', () => {
    const emitter = createFormEmitter()
    const successHandler = vi.fn()
    const errorHandler = vi.fn()
    const formData = { formController: { id: 'test' } }
    const errorData = {
      error: new Error('test'),
      formController: { id: 'test' },
    }

    emitter.on('submit_success', successHandler)
    emitter.on('submit_error', errorHandler)

    emitter.emit('submit_success', formData)

    expect(successHandler).toHaveBeenCalledWith(formData)
    expect(errorHandler).not.toHaveBeenCalled()

    emitter.emit('submit_error', errorData)

    expect(errorHandler).toHaveBeenCalledWith(errorData)
    expect(successHandler).toHaveBeenCalledTimes(1)
  })

  test("'*' handlers hear every event, after the event's own handlers", () => {
    const emitter = createFormEmitter()
    const calls: string[] = []
    const wildcard = vi.fn(() => calls.push('*'))
    const formData = { formController: { id: 'test' } }

    emitter.on('*', wildcard)
    emitter.on('submit_success', () => calls.push('submit_success'))
    emitter.emit('submit_success', formData)
    emitter.emit('form_reset', formData)

    expect(wildcard).toHaveBeenNthCalledWith(1, 'submit_success', formData)
    expect(wildcard).toHaveBeenNthCalledWith(2, 'form_reset', formData)
    expect(calls).toEqual(['submit_success', '*', '*'])

    emitter.off('*', wildcard)
    emitter.emit('form_reset', formData)
    expect(wildcard).toHaveBeenCalledTimes(2)
  })

  test('off without a handler removes all the handlers of that event', () => {
    const emitter = createFormEmitter()
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    const other = vi.fn()
    const formData = { formController: { id: 'test' } }

    emitter.on('submit_success', handler1)
    emitter.on('submit_success', handler2)
    emitter.on('form_reset', other)
    emitter.off('submit_success')
    emitter.emit('submit_success', formData)
    emitter.emit('form_reset', formData)

    expect(handler1).not.toHaveBeenCalled()
    expect(handler2).not.toHaveBeenCalled()
    expect(other).toHaveBeenCalledTimes(1)
  })

  test('off with a handler that was never added removes nothing', () => {
    const emitter = createFormEmitter()
    const handler = vi.fn()
    const formData = { formController: { id: 'test' } }

    emitter.off('submit_success', vi.fn())
    emitter.on('submit_success', handler)
    emitter.off('submit_success', vi.fn())
    emitter.emit('submit_success', formData)

    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('a handler removing itself while the event runs does not skip the next one', () => {
    const emitter = createFormEmitter()
    const once = vi.fn(() => emitter.off('submit_success', once))
    const next = vi.fn()
    const formData = { formController: { id: 'test' } }

    emitter.on('submit_success', once)
    emitter.on('submit_success', next)
    emitter.emit('submit_success', formData)
    emitter.emit('submit_success', formData)

    expect(once).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledTimes(2)
  })

  test('all holds the handlers by event type', () => {
    const emitter = createFormEmitter()
    const handler = vi.fn()

    emitter.on('submit_success', handler)

    expect(emitter.all.get('submit_success')).toEqual([handler])
    expect(emitter.all.get('submit_error')).toBeUndefined()
  })
})
