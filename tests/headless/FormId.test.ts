import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, ref } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { useForm } from '@/headless/useForm'
import HeadlessForm from '@/headless/HeadlessForm'
import Enforma from '@/core/Enforma.vue'
import { DEFAULT_CONFIG } from '@/constants/defaults'
import { setGlobalConfig } from '@/utils/useConfig'
import useDefaultPreset from '@/presets/default'

describe("a form's id", () => {
  beforeEach(() => {
    setGlobalConfig(DEFAULT_CONFIG)
    useDefaultPreset()
  })

  it('is the one given to useForm()', () => {
    const form = useForm({ name: 'a' }, undefined, { id: 'profile' })

    expect(form.$formId).toBe('profile')
    expect(form.$formAttrs.id).toBe('profile')
  })

  it('is made up when none is given, a different one for each form', () => {
    const first = useForm({ name: 'a' })
    const second = useForm({ name: 'a' })

    expect(first.$formId).toMatch(/^enforma-/)
    expect(second.$formId).toMatch(/^enforma-/)
    expect(first.$formId).not.toBe(second.$formId)
    expect(first.$formAttrs.id).toBe(first.$formId)
  })

  it('is on the <form> of a <HeadlessForm>, given or made up', () => {
    const given = mount(HeadlessForm, { props: { data: {}, id: 'profile' } })
    const madeUp = mount(HeadlessForm, { props: { data: {} } })

    expect(given.find('form').attributes('id')).toBe('profile')
    expect(madeUp.find('form').attributes('id')).toMatch(/^enforma-/)
  })

  it('is on the <form> of an <Enforma> and read through a ref to it', async () => {
    const formRef = ref<any>(null)
    const Parent = defineComponent({
      setup: () => () =>
        h('div', [
          h(Enforma, { ref: formRef, data: {}, id: 'profile' }),
          h(Enforma, { data: {} }),
        ]),
    })
    const wrapper = mount(Parent)
    await flushPromises()

    const [given, madeUp] = wrapper.findAll('form')
    expect(given.attributes('id')).toBe('profile')
    expect(formRef.value.$formId).toBe('profile')
    expect(madeUp.attributes('id')).toMatch(/^enforma-/)
    expect(madeUp.attributes('id')).not.toBe('profile')
  })

  it('stays the one the form was made with', async () => {
    const wrapper = mount(HeadlessForm, { props: { data: {}, id: 'first' } })
    await wrapper.setProps({ id: 'second' })

    expect(wrapper.find('form').attributes('id')).toBe('first')
  })

  it('is made up the same on the server each time, so the browser gets the same', async () => {
    const render = () =>
      renderToString(
        createSSRApp({ render: () => h(HeadlessForm, { data: {} }) })
      )

    const first = await render()
    const second = await render()

    expect(first).toMatch(/id="enforma-/)
    expect(second).toBe(first)
  })
})
