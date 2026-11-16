// A field that hides (its `if`) stays out of the form, even when it hides just after the
// user leaves it (its check was scheduled) or while its input has focus (the browser blurs
// the input as it's removed)
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, reactive, ref } from 'vue'
import Enforma from '@/core/Enforma.vue'
import { createEncolaValidator } from '@/validators/encolaValidator'
import { DEFAULT_CONFIG } from '@/constants/defaults'
import { setGlobalConfig } from '@/utils/useConfig'
import useDefaultPreset from '@/presets/default'
import type { FormController } from '@/types'

beforeEach(() => {
  setGlobalConfig(DEFAULT_CONFIG)
  useDefaultPreset()
  Element.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  document.body.innerHTML = ''
  delete (Element.prototype as any).scrollIntoView
})

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** A form whose Customs reference, required, shows only for Switzerland */
async function mountCustomsForm() {
  const form = ref<FormController | null>(null)
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(Enforma, {
          ref: form,
          data: reactive({ country: 'CH', customs: '' }),
          schema: {
            country: { label: 'Country' },
            customs: { label: 'Customs reference', if: '${form.country == "CH"}' },
          },
          validator: createEncolaValidator({ customs: 'required' }),
          submitHandler: () => Promise.resolve(true),
        }),
    }),
    { attachTo: document.body }
  )
  await flushPromises()

  // A refused submit: every field touched and dirty, Customs focused
  expect(await form.value!.submit()).toBe(false)
  await flushPromises()
  await wait(50)
  const customs = wrapper.find('input[name="customs"]').element as HTMLInputElement
  expect(document.activeElement).toBe(customs)

  return { wrapper, form: form.value!, customs }
}

/** Another country: Customs hides */
async function chooseGermany(form: FormController) {
  await form.setFieldValue('country', 'DE')
  await flushPromises()
}

describe('a field that hides stays out of the form', () => {
  it('when hidden within its check\'s delay after the user leaves it', async () => {
    const { wrapper, form, customs } = await mountCustomsForm()

    customs.dispatchEvent(new FocusEvent('blur'))
    await chooseGermany(form)
    expect(wrapper.find('input[name="customs"]').exists()).toBe(false)

    expect(await form.validate()).toBe(true)
    await wait(300)
    expect(form.hasField('customs')).toBe(false)
    expect(await form.validate()).toBe(true)

    wrapper.unmount()
  })

  it('when hidden while its input has focus, the browser blurring it as it goes', async () => {
    const { wrapper, form, customs } = await mountCustomsForm()

    await chooseGermany(form)
    // Chrome fires blur on a focused input as it's removed
    customs.dispatchEvent(new FocusEvent('blur'))
    customs.dispatchEvent(new FocusEvent('focus'))

    expect(form.hasField('customs')).toBe(false)
    expect(await form.validate()).toBe(true)
    await wait(300)
    expect(await form.validate()).toBe(true)

    wrapper.unmount()
  })
})
