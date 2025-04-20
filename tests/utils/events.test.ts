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
})
