import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, reactive, ref } from 'vue'
import Enforma from '@/core/Enforma.vue'
import EnformaSchema from '@/core/EnformaSchema.vue'
import EnformaSubmitButton from '@/core/EnformaSubmitButton.vue'
import EnformaResetButton from '@/core/EnformaResetButton.vue'
import { provideEnformaForm } from '@/core/provideEnformaForm'
import { useForm } from '@/headless/useForm'
import { DEFAULT_CONFIG } from '@/constants/defaults'
import { setGlobalConfig } from '@/utils/useConfig'
import useDefaultPreset from '@/presets/default'

const schema = { name: { label: 'Name' } }

/** A submit handler that stays pending until `resolve()` is called. */
function pendingHandler() {
  let resolve = () => {}
  const handler = vi.fn(
    () =>
      new Promise<void>((r) => {
        resolve = () => r()
      })
  )
  return { handler, resolve: () => resolve() }
}

/**
 * A page like a modal: a schema form in the body, its submit and reset buttons in the
 * footer, outside the <form>, given the form through a ref.
 */
function mountModal(submitHandler: (...args: any[]) => any) {
  const data = reactive({ name: 'a' })
  const Modal = defineComponent({
    setup() {
      const form = ref<any>(null)
      return () =>
        h('div', [
          h('div', { class: 'body' }, [
            h(Enforma, {
              ref: form,
              data,
              schema,
              submitHandler,
              showSubmitButton: false,
            }),
          ]),
          h('div', { class: 'footer' }, [
            h(EnformaSubmitButton, { form: form.value, class: 'save' }),
            h(EnformaResetButton, { form: form.value, class: 'discard' }),
          ]),
        ])
    },
  })
  // attached to the document, so a button names its form by id
  const wrapper = mount(Modal, { attachTo: document.body })
  return { wrapper, data }
}

describe('submit and reset buttons outside the form', () => {
  let warn: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    setGlobalConfig(DEFAULT_CONFIG)
    useDefaultPreset()
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warn.mockRestore()
    document.body.innerHTML = ''
  })

  it('submits the form they are given, which owns the submit button', async () => {
    const submitHandler = vi.fn().mockResolvedValue(true)
    const { wrapper } = mountModal(submitHandler)
    await flushPromises()

    const form = wrapper.find('form')
    const save = wrapper.find('.footer button.save')
    expect(form.attributes('id')).toMatch(/^enforma-/)
    expect(save.attributes('form')).toBe(form.attributes('id'))
    // the form owns it, so the browser presses it on Enter in a field
    expect((save.element as HTMLButtonElement).form).toBe(form.element)

    await save.trigger('click')
    await flushPromises()
    expect(submitHandler).toHaveBeenCalledWith({ name: 'a' }, expect.anything())

    wrapper.unmount()
  })

  it('is disabled and shows it is submitting while the form submits', async () => {
    const { handler, resolve } = pendingHandler()
    const { wrapper } = mountModal(handler)
    await flushPromises()

    const save = () => wrapper.find('.footer button.save')
    expect(save().attributes('disabled')).toBeUndefined()

    await save().trigger('click')
    await flushPromises()
    expect(save().attributes('disabled')).toBeDefined()
    expect(save().text()).toBe('Submitting...')

    resolve()
    await flushPromises()
    expect(save().attributes('disabled')).toBeUndefined()
    expect(save().text()).toBe('Submit')

    wrapper.unmount()
  })

  it('resets the form they are given', async () => {
    const { wrapper, data } = mountModal(vi.fn())
    await flushPromises()

    await wrapper.find('input').setValue('b')
    expect(data.name).toBe('b')

    await wrapper.find('.footer button.discard').trigger('click')
    await flushPromises()
    expect(data.name).toBe('a')

    wrapper.unmount()
  })

  it('is disabled while the form it is given has not mounted', () => {
    const wrapper = mount(EnformaSubmitButton, { props: { form: null } })

    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    expect(warn).not.toHaveBeenCalled()
  })

  it('is disabled, and warns, outside any form and given none', () => {
    const submit = mount(EnformaSubmitButton)
    const reset = mount(EnformaResetButton)

    expect(submit.find('button').attributes('disabled')).toBeDefined()
    expect(reset.find('button').attributes('disabled')).toBeDefined()
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('[Enforma] <EnformaSubmitButton>')
    )
  })

  it("takes a controller from useForm(), for a form of one's own", async () => {
    const { handler, resolve } = pendingHandler()
    const Host = defineComponent({
      setup() {
        const controller = useForm({ name: 'a' }, undefined, {
          submitHandler: handler,
        })
        provideEnformaForm({ controller, schema })
        return () =>
          h('div', [
            h(
              'form',
              {
                ...controller.$formAttrs,
                onSubmit: (e: Event) => {
                  e.preventDefault()
                  controller.submit()
                },
              },
              [h(EnformaSchema, { schema })]
            ),
            h(EnformaSubmitButton, { form: controller, class: 'save' }),
          ])
      },
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await flushPromises()

    const save = () => wrapper.find('button.save')
    await save().trigger('click')
    await flushPromises()
    expect(handler).toHaveBeenCalled()
    expect(save().attributes('disabled')).toBeDefined()

    resolve()
    await flushPromises()
    expect(save().attributes('disabled')).toBeUndefined()

    wrapper.unmount()
  })

  it('warns on a click when no <form> has the id of the form they are given', async () => {
    const Host = defineComponent({
      setup() {
        const controller = useForm({ name: 'a' })
        provideEnformaForm({ controller, schema })
        // the host's <form> leaves out $formAttrs, so it has no id
        return () =>
          h('div', [
            h('form', [h(EnformaSchema, { schema })]),
            h(EnformaSubmitButton, { form: controller, class: 'save' }),
          ])
      },
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await flushPromises()

    await wrapper.find('button.save').trigger('click')
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('no <form> it belongs to')
    )

    wrapper.unmount()
  })
})

describe('submit buttons inside the form', () => {
  beforeEach(() => {
    setGlobalConfig(DEFAULT_CONFIG)
    useDefaultPreset()
  })

  it("leave the form they're in to own them, though it has no id", async () => {
    const submitHandler = vi.fn().mockResolvedValue(true)
    const Host = defineComponent({
      setup() {
        const controller = useForm({ name: 'a' }, undefined, { submitHandler })
        provideEnformaForm({ controller, schema })
        // as the docs show it: a <form> of one's own, with no $formAttrs
        return () =>
          h(
            'form',
            {
              novalidate: true,
              onSubmit: (e: Event) => {
                e.preventDefault()
                controller.submit()
              },
            },
            [h(EnformaSchema, { schema }), h(EnformaSubmitButton)]
          )
      },
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await flushPromises()

    const button = wrapper.find('button[type="submit"]')
    expect(button.attributes('form')).toBeUndefined()

    await button.trigger('click')
    await flushPromises()
    expect(submitHandler).toHaveBeenCalled()

    wrapper.unmount()
  })
})
