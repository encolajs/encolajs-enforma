// Errors set by code (setErrors(), setFieldErrors()), such as a server's, are kept apart from
// the rules' own: a check of the rules keeps them, after the rules' errors. They go when the
// field's value changes, the form is submitted again, reset or committed
import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { useField } from '@/headless/useField'
import { useForm } from '@/headless/useForm'
import { createEncolaValidator } from '@/validators/encolaValidator'
import type { FormValidator } from '@/validators/types'
import { DEFAULT_CONFIG } from '@/constants/defaults'
import { setGlobalConfig } from '@/utils/useConfig'

beforeEach(() => {
  setGlobalConfig(DEFAULT_CONFIG)
})

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** A form whose email is required and must be an email, with a field drawn for it */
async function emailForm(email = 'ana@example.com') {
  const form = useForm(
    { email },
    createEncolaValidator({ email: 'required|email' })
  )
  let field: any
  const wrapper = mount(
    defineComponent({
      setup() {
        field = useField('email', form)
        return () =>
          h('input', {
            name: 'email',
            value: field.value.value,
            onInput: field.value.events.input,
            onBlur: field.value.events.blur,
          })
      },
    }),
    { attachTo: document.body }
  )
  await flushPromises()
  return { form, field, wrapper }
}

describe('errors set by code', () => {
  it('stay as the user leaves the field without changing it', async () => {
    const { form, wrapper } = await emailForm()
    // The form was sent: every field is touched and dirty, so leaving one checks it
    expect(await form.submit()).toBe(true)

    form.setErrors({ email: ['Taken'] })
    await wrapper.find('input').trigger('blur')
    await wait(300)
    await flushPromises()

    expect(form.getFieldErrors('email')).toEqual(['Taken'])
    wrapper.unmount()
  })

  it("stay through a check of the rules, after the rules' own errors", async () => {
    const { form, wrapper } = await emailForm('')
    form.setErrors({ email: ['Taken'] })

    expect(await form.validateField('email')).toBe(false)
    const errors = form.getFieldErrors('email')
    expect(errors).toHaveLength(2)
    expect(errors[1]).toBe('Taken')
    wrapper.unmount()
  })

  it('make validate() say false while they show', async () => {
    const { form, wrapper } = await emailForm()
    form.setErrors({ email: ['Taken'] })

    expect(await form.validate()).toBe(false)
    expect(form.getFieldErrors('email')).toEqual(['Taken'])
    wrapper.unmount()
  })

  it("go as the field's value changes, the rules being checked", async () => {
    const { form, wrapper } = await emailForm()
    expect(await form.submit()).toBe(true)
    form.setErrors({ email: ['Taken'] })

    await wrapper.find('input').setValue('not an email')
    await wait(300)
    await flushPromises()
    const errors = form.getFieldErrors('email')
    expect(errors).toHaveLength(1)
    expect(errors[0]).not.toBe('Taken')

    await wrapper.find('input').setValue('bea@example.com')
    await wait(300)
    await flushPromises()
    expect(form.getFieldErrors('email')).toEqual([])
    wrapper.unmount()
  })

  it('go as the value is set by code', async () => {
    const form = useForm({ email: 'ana@example.com' })
    form.setErrors({ email: ['Taken'] })

    await form.setFieldValue('email', 'ana@example.com', false)
    expect(form.getFieldErrors('email')).toEqual(['Taken'])

    await form.setFieldValue('email', 'bea@example.com', false)
    expect(form.getFieldErrors('email')).toEqual([])
  })

  it('stay when a check that began before them ends after them', async () => {
    // A check that answers 50 ms later, always passing
    let pending = 0
    const slow: FormValidator = {
      validate: async () => true,
      validatePath: async () => {
        pending++
        await wait(50)
        pending--
        return true
      },
      getErrors: () => ({}),
      getErrorsForPath: () => [],
      getDependentFields: () => [],
      clearErrorsForPath: () => {},
      reset: () => {},
    }
    const form = useForm({ email: 'ana@example.com' }, slow)
    form.getField('email')

    const check = form.validateField('email')
    await wait(10)
    expect(pending).toBe(1)
    form.setErrors({ email: ['Taken'] })
    await check

    expect(form.getFieldErrors('email')).toEqual(['Taken'])
  })

  it('on a list go as its rows change', () => {
    const form = useForm({ items: [{ name: 'a' }] })
    form.setErrors({ items: ['Give at least two items'] })

    form.add('items', 1, { name: 'b' })
    expect(form.getFieldErrors('items')).toEqual([])
  })

  it('go as the form is submitted again', async () => {
    const { form, wrapper } = await emailForm()
    form.setErrors({ email: ['Taken'] })

    expect(await form.submit()).toBe(true)
    expect(form.getFieldErrors('email')).toEqual([])
    wrapper.unmount()
  })

  it('go as the form is reset or committed', async () => {
    const form = useForm(
      { email: 'ana@example.com' },
      createEncolaValidator({ email: 'email' })
    )
    form.setErrors({ email: ['Taken'] })
    form.reset()
    expect(form.getFieldErrors('email')).toEqual([])
    expect(await form.validate()).toBe(true)

    form.setErrors({ email: ['Taken'] })
    form.commit()
    expect(form.getFieldErrors('email')).toEqual([])
    expect(await form.validate()).toBe(true)
  })
})
