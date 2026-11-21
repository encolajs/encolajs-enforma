// What checks an <Enforma> form: the validator it is given, or one made from its schema's
// rules. Neither of them is the deprecated `rules` prop, which alone warns of its deprecation
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Enforma from '@/core/Enforma.vue'
import { EnformaPlugin } from '@/EnformaPlugin'
import { createEncolaValidator } from '@/validators/encolaValidator'
import { mountTestComponent } from '../utils/testSetup'

const submitHandler = vi.fn(() => Promise.resolve())

let warnSpy: ReturnType<typeof vi.spyOn>
const warnings = (text: string): unknown[][] =>
  warnSpy.mock.calls.filter((call: unknown[]) =>
    call.some((arg) => typeof arg === 'string' && arg.includes(text))
  )

describe('Enforma: what checks the form', () => {
  beforeEach(() => {
    submitHandler.mockClear()
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  it('warns of no deprecation when given neither a validator nor rules', async () => {
    const wrapper = mountTestComponent(Enforma, {
      data: { email: '' },
      schema: { email: { type: 'field', label: 'Email' } },
      submitHandler,
    })
    await flushPromises()

    expect(warnings('DEPRECATED')).toHaveLength(0)
    // @ts-expect-error vm is a form
    expect(await wrapper.vm.submit()).toBe(true)
  })

  it("checks the form by its schema's rules, warning of no deprecation", async () => {
    const wrapper = mountTestComponent(Enforma, {
      data: { email: '' },
      schema: { email: { type: 'field', label: 'Email', rules: 'required' } },
      submitHandler,
    })
    await flushPromises()

    // @ts-expect-error vm is a form
    expect(await wrapper.vm.submit()).toBe(false)
    // @ts-expect-error errors() exists on vm
    expect(wrapper.vm.errors().email).toHaveLength(1)
    expect(submitHandler).not.toHaveBeenCalled()
    expect(warnings('DEPRECATED')).toHaveLength(0)
  })

  it("makes the schema's validator with the plugin's createEncolaValidation", async () => {
    const createEncolaValidation = vi.fn(createEncolaValidator)
    const wrapper = mount(Enforma, {
      props: {
        data: { email: '' },
        schema: {
          email: {
            type: 'field',
            label: 'Email',
            rules: 'required',
            messages: { required: 'Enter your email' },
          },
        },
        submitHandler,
      },
      global: {
        plugins: [[EnformaPlugin, { createEncolaValidation }]],
      },
    })
    await flushPromises()

    expect(createEncolaValidation).toHaveBeenCalledWith(
      { email: 'required' },
      { 'email:required': 'Enter your email' }
    )
    // @ts-expect-error vm is a form
    await wrapper.vm.submit()
    // @ts-expect-error errors() exists on vm
    expect(wrapper.vm.errors().email).toEqual(['Enter your email'])
  })

  it("checks the form with its validator, warning that the schema's rules are left out", async () => {
    const wrapper = mountTestComponent(Enforma, {
      data: { name: '', email: '' },
      validator: createEncolaValidator({ name: 'required' }),
      schema: {
        name: { type: 'field', label: 'Name' },
        email: { type: 'field', label: 'Email', rules: 'required' },
      },
      submitHandler,
    })
    await flushPromises()

    // @ts-expect-error vm is a form
    await wrapper.vm.submit()
    // @ts-expect-error errors() exists on vm
    const errors = wrapper.vm.errors()
    expect(errors.name).toHaveLength(1)
    expect(errors.email ?? []).toHaveLength(0)

    const leftOut = warnings("schema's `rules`")
    expect(leftOut).toHaveLength(1)
    expect(leftOut[0][0]).toContain('email')
    expect(warnings('DEPRECATED')).toHaveLength(0)
  })

  it('still warns of the deprecated rules prop, and checks the form by it', async () => {
    const wrapper = mountTestComponent(Enforma, {
      data: { email: '' },
      schema: { email: { type: 'field', label: 'Email' } },
      rules: { email: 'required' },
      submitHandler,
    })
    await flushPromises()

    expect(warnings('DEPRECATED').length).toBeGreaterThan(0)
    // @ts-expect-error vm is a form
    expect(await wrapper.vm.submit()).toBe(false)
    // @ts-expect-error errors() exists on vm
    expect(wrapper.vm.errors().email).toHaveLength(1)
  })
})
