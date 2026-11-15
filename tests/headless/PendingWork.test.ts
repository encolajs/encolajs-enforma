import { describe, test, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, provide, ref } from 'vue'
import { useForm } from '../../src'
import HeadlessField from '@/headless/HeadlessField'
import { formControllerKey } from '@/constants/symbols'
import type { FormValidator } from '@/validators/types'
import { formReader } from '@/utils/formReader'
import { useField } from '@/headless/useField'

/** A validator that holds every check until `release()` is called; every value passes */
function heldValidator(): { validator: FormValidator; release: () => void } {
  let release = () => {}
  const held = new Promise<void>((r) => (release = () => r()))
  return {
    validator: {
      validate: async () => true,
      validatePath: async () => {
        await held
        return true
      },
      getErrors: () => ({}),
      getErrorsForPath: () => [],
      getDependentFields: () => [],
      clearErrorsForPath: () => {},
      reset: () => {},
    },
    release: () => release(),
  }
}

describe('pending work', () => {
  test('beginPending() marks the field and the form pending until done() is called', () => {
    const form = useForm({ avatar: null })

    const { done } = form.beginPending('avatar')

    expect(form.$isPending.value).toBe(true)
    expect(form['avatar.$isPending'].value).toBe(true)

    done()

    expect(form.$isPending.value).toBe(false)
    expect(form['avatar.$isPending'].value).toBe(false)
  })

  test('a field stays pending until all its work is done, however many calls end it', () => {
    const form = useForm({ attachments: [] })

    const first = form.beginPending('attachments')
    const second = form.beginPending('attachments')

    first.done()
    first.done()
    expect(form['attachments.$isPending'].value).toBe(true)
    expect(form.$isPending.value).toBe(true)

    second.done()
    expect(form['attachments.$isPending'].value).toBe(false)
    expect(form.$isPending.value).toBe(false)
  })

  test('work without a path makes only the form pending', () => {
    const form = useForm({ slug: 'hello' })

    const { done } = form.beginPending()

    expect(form.$isPending.value).toBe(true)
    expect(form['slug.$isPending'].value).toBe(false)

    done()
    expect(form.$isPending.value).toBe(false)
  })

  test('track() keeps the field pending until the promise settles, and gives its result', async () => {
    const form = useForm({ avatar: null })
    let resolve!: (value: { id: string }) => void
    const upload = new Promise<{ id: string }>((r) => (resolve = r))

    const tracked = form.track(upload, 'avatar')
    expect(form['avatar.$isPending'].value).toBe(true)

    resolve({ id: 'f-1' })

    await expect(tracked).resolves.toEqual({ id: 'f-1' })
    expect(form['avatar.$isPending'].value).toBe(false)
    expect(form.$isPending.value).toBe(false)
  })

  test('track() releases the field when the promise fails, and passes the failure on', async () => {
    const form = useForm({ avatar: null })
    const failure = new Error('413 Payload Too Large')

    const tracked = form.track(Promise.reject(failure), 'avatar')

    await expect(tracked).rejects.toBe(failure)
    expect(form['avatar.$isPending'].value).toBe(false)
  })

  test('track() given a function calls it with the signal of the work', async () => {
    const form = useForm({ avatar: null })
    let received: AbortSignal | undefined

    await form.track(async (signal) => {
      received = signal
      return 'f-1'
    }, 'avatar')

    expect(received).toBeInstanceOf(AbortSignal)
    expect(received!.aborted).toBe(false)
  })

  test('track() releases the field when the function throws before giving a promise', async () => {
    const form = useForm({ avatar: null })
    const failure = new Error('no file')

    const tracked = form.track(() => {
      throw failure
    }, 'avatar')

    await expect(tracked).rejects.toBe(failure)
    expect(form['avatar.$isPending'].value).toBe(false)
  })

  describe('dropping work', () => {
    test('reset() drops all work, the form-level work too: the flags clear and the signals abort', () => {
      const form = useForm({ avatar: null })
      const fieldWork = form.beginPending('avatar')
      const formWork = form.beginPending()

      form.reset()

      expect(form.$isPending.value).toBe(false)
      expect(form['avatar.$isPending'].value).toBe(false)
      expect(fieldWork.signal.aborted).toBe(true)
      expect(formWork.signal.aborted).toBe(true)
    })

    test('track() rejects with an AbortError as soon as its work is dropped', async () => {
      const form = useForm({ avatar: null })
      const neverSettles = new Promise(() => {})

      const tracked = form.track(neverSettles, 'avatar')
      form.reset()

      await expect(tracked).rejects.toMatchObject({ name: 'AbortError' })
    })

    test('done() after a drop, or the dropped promise settling, changes no count', async () => {
      const form = useForm({ avatar: null })
      let resolve!: (value: string) => void
      const stale = form.beginPending('avatar')
      const tracked = form.track(
        new Promise<string>((r) => (resolve = r)),
        'avatar'
      )
      form.reset()
      tracked.catch(() => {})

      const current = form.beginPending('avatar')
      stale.done()
      resolve('f-1')
      await Promise.resolve()

      expect(form['avatar.$isPending'].value).toBe(true)
      expect(form.$isPending.value).toBe(true)

      current.done()
      expect(form.$isPending.value).toBe(false)
    })

    test("removeField() drops the field's work, not other fields' work", () => {
      const form = useForm({ avatar: null, cover: null })
      const avatar = form.beginPending('avatar')
      const cover = form.beginPending('cover')

      form.removeField('avatar')

      expect(avatar.signal.aborted).toBe(true)
      expect(cover.signal.aborted).toBe(false)
      expect(form.$isPending.value).toBe(true)
    })

    describe('in a repeatable', () => {
      const rows = () => ({
        items: [{ file: 'a' }, { file: 'b' }, { file: 'c' }],
      })

      test("remove() drops the removed row's work and the work of the rows after it, whose paths change", () => {
        const form = useForm(rows())
        const first = form.beginPending('items.0.file')
        const second = form.beginPending('items.1.file')
        const third = form.beginPending('items.2.file')

        form.remove('items', 1)

        expect(first.signal.aborted).toBe(false)
        expect(second.signal.aborted).toBe(true)
        expect(third.signal.aborted).toBe(true)
        expect(form['items.0.file.$isPending'].value).toBe(true)
        expect(form['items.1.file.$isPending'].value).toBe(false)
      })

      test('move() drops the work of every row whose path changes', () => {
        const form = useForm(rows())
        const first = form.beginPending('items.0.file')
        const second = form.beginPending('items.1.file')
        const third = form.beginPending('items.2.file')

        form.move('items', 0, 1)

        expect(first.signal.aborted).toBe(true)
        expect(second.signal.aborted).toBe(true)
        expect(third.signal.aborted).toBe(false)
      })

      test('sort() drops the work of every row whose path changes', () => {
        const form = useForm({
          items: [{ file: 'c' }, { file: 'b' }, { file: 'a' }],
        })
        const first = form.beginPending('items.0.file')
        const second = form.beginPending('items.1.file')
        const third = form.beginPending('items.2.file')

        form.sort('items', (x: any, y: any) => x.file.localeCompare(y.file))

        expect(first.signal.aborted).toBe(true)
        expect(second.signal.aborted).toBe(false)
        expect(third.signal.aborted).toBe(true)
      })

      test('add() drops the work of the rows after the new one, and leaves the rows before it', () => {
        const form = useForm(rows())
        const first = form.beginPending('items.0.file')
        const second = form.beginPending('items.1.file')

        form.add('items', 1, { file: 'new' })

        expect(first.signal.aborted).toBe(false)
        expect(second.signal.aborted).toBe(true)
      })

      test('add() at the end drops nothing', () => {
        const form = useForm(rows())
        const last = form.beginPending('items.2.file')

        form.add('items', 3, { file: 'new' })

        expect(last.signal.aborted).toBe(false)
        expect(form['items.2.file.$isPending'].value).toBe(true)
      })
    })

    test("a <HeadlessField> unmounting, hidden by its v-if, drops the field's work", async () => {
      const form = useForm({ avatar: null })
      const shown = ref(true)
      const Page = defineComponent({
        setup() {
          provide(formControllerKey, form)
          return () =>
            shown.value
              ? h(HeadlessField, { name: 'avatar' }, { default: () => null })
              : null
        },
      })
      const wrapper = mount(Page)
      const work = form.beginPending('avatar')

      shown.value = false
      await nextTick()

      expect(work.signal.aborted).toBe(true)
      expect(form.$isPending.value).toBe(false)
      wrapper.unmount()
    })

    test("setFieldValue() and commit() don't drop work", async () => {
      const form = useForm({ avatar: null })
      const work = form.beginPending('avatar')

      await form.setFieldValue('avatar', 'f-1')
      form.commit()

      expect(work.signal.aborted).toBe(false)
      expect(form['avatar.$isPending'].value).toBe(true)
    })
  })

  describe('submitting', () => {
    test('submit() refuses at once while work is pending: no field touched, no validation, no event', async () => {
      const submitHandler = vi.fn()
      const validatePath = vi.fn(async () => true)
      const form = useForm(
        { name: 'Ana', avatar: null },
        { ...heldValidator().validator, validatePath },
        { submitHandler }
      )
      form.getField('name')
      const events = vi.fn()
      form.on('validation_fail', events)
      form.on('submit_success', events)
      form.on('submit_error', events)
      form.beginPending('avatar')

      const submitting = form.submit()
      expect(form.$isSubmitting.value).toBe(false)

      await expect(submitting).resolves.toBe(false)
      expect(submitHandler).not.toHaveBeenCalled()
      expect(validatePath).not.toHaveBeenCalled()
      expect(form['name.$isTouched'].value).toBe(false)
      expect(events).not.toHaveBeenCalled()
    })

    test('submit() refuses when work begins while the form validates, before the submit handler', async () => {
      const submitHandler = vi.fn()
      const { validator, release } = heldValidator()
      const form = useForm({ name: 'Ana', avatar: null }, validator, {
        submitHandler,
      })
      form.getField('name')

      const submitting = form.submit()
      form.beginPending('avatar')
      release()

      await expect(submitting).resolves.toBe(false)
      expect(submitHandler).not.toHaveBeenCalled()
      expect(form.$isSubmitting.value).toBe(false)
    })

    test('submit() goes ahead once the work is done', async () => {
      const submitHandler = vi.fn()
      const form = useForm({ avatar: null }, undefined, { submitHandler })
      const { done } = form.beginPending('avatar')
      done()

      await expect(form.submit()).resolves.toBe(true)
      expect(submitHandler).toHaveBeenCalled()
    })
  })

  test('an expression reads it as form.$isPending', () => {
    const form = useForm({ avatar: null })
    const reader = formReader(form)
    expect(reader.$isPending).toBe(false)

    const { done } = form.beginPending('avatar')
    expect(reader.$isPending).toBe(true)

    done()
    expect(reader.$isPending).toBe(false)
  })

  test("a field's attributes mark it busy while its work is pending", () => {
    const form = useForm({ avatar: null })
    const field = useField('avatar', form)
    expect(field.value.attrs['aria-busy']).toBeUndefined()

    const { done } = form.beginPending('avatar')
    expect(field.value.attrs['aria-busy']).toBe('true')

    done()
    expect(field.value.attrs['aria-busy']).toBeUndefined()
  })

  test("the pending flags can't be written", () => {
    const form = useForm({ avatar: null })
    form.beginPending('avatar')

    form['avatar.$isPending'] = false

    expect(form['avatar.$isPending'].value).toBe(true)
    expect(form.$isPending.value).toBe(true)
  })
})
