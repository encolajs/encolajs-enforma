import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { computed, defineComponent, h, reactive, ref } from 'vue'
import Enforma from '@/core/Enforma.vue'
import EnformaField from '@/core/EnformaField.vue'
import HeadlessForm from '@/headless/HeadlessForm'
import { DEFAULT_CONFIG } from '@/constants/defaults'
import { setGlobalConfig } from '@/utils/useConfig'
import useDefaultPreset from '@/presets/default'

/** A submit handler that stays pending until `resolve()` is called. */
function pendingHandler(): {
  handler: () => Promise<void>
  resolve: () => void
} {
  let resolve = () => {}
  const handler = () =>
    new Promise<void>((r) => {
      resolve = () => r()
    })
  return { handler, resolve: () => resolve() }
}

/** A parent holding a ref to `form` (Enforma or HeadlessForm) and showing its state. */
function mountParent(
  form: any,
  props: Record<string, any>,
  child = () => h(EnformaField, { name: 'name', label: 'Name' })
) {
  const formRef = ref<any>(null)
  const Parent = defineComponent({
    setup() {
      const submitting = computed(() => String(formRef.value?.$isSubmitting))
      const changed = computed(() => String(formRef.value?.$isChanged))
      return () =>
        h('div', [
          h(form, { ref: formRef, ...props }, child),
          h('span', { class: 'submitting' }, submitting.value),
          h('span', { class: 'changed' }, changed.value),
        ])
    },
  })
  const wrapper = mount(Parent, { attachTo: document.body })
  return { wrapper, formRef }
}

describe('a ref to <Enforma>', () => {
  beforeEach(() => {
    setGlobalConfig(DEFAULT_CONFIG)
    useDefaultPreset()
  })

  it('reads $isSubmitting as it changes, and re-renders what shows it', async () => {
    const { handler, resolve } = pendingHandler()
    const { wrapper, formRef } = mountParent(Enforma, {
      data: reactive({ name: 'a' }),
      submitHandler: handler,
      showSubmitButton: false,
    })
    await flushPromises()

    expect(formRef.value.$isSubmitting).toBe(false)

    const submitted = formRef.value.submit()
    await flushPromises()
    expect(formRef.value.$isSubmitting).toBe(true)
    expect(wrapper.find('.submitting').text()).toBe('true')

    resolve()
    expect(await submitted).toBe(true)
    await flushPromises()
    expect(formRef.value.$isSubmitting).toBe(false)
    expect(wrapper.find('.submitting').text()).toBe('false')

    wrapper.unmount()
  })

  it('reads $isChanged and $isDirty as the values change', async () => {
    const { wrapper, formRef } = mountParent(Enforma, {
      data: reactive({ name: 'a' }),
      showSubmitButton: false,
    })
    await flushPromises()

    expect(formRef.value.$isChanged).toBe(false)
    expect(formRef.value.$isDirty).toBe(false)

    await formRef.value.setFieldValue('name', 'b', false, { $isDirty: true })
    await flushPromises()

    expect(formRef.value.$isChanged).toBe(true)
    expect(formRef.value.$isDirty).toBe(true)
    expect(wrapper.find('.changed').text()).toBe('true')

    wrapper.unmount()
  })

  it('reads $formAttrs as the form submits', async () => {
    const { handler, resolve } = pendingHandler()
    const { wrapper, formRef } = mountParent(Enforma, {
      data: reactive({ name: 'a' }),
      submitHandler: handler,
      showSubmitButton: false,
    })
    await flushPromises()

    const submitted = formRef.value.submit()
    await flushPromises()
    expect(formRef.value.$formAttrs['aria-busy']).toBe('true')

    resolve()
    await submitted
    expect(formRef.value.$formAttrs['aria-busy']).toBeUndefined()

    wrapper.unmount()
  })

  it('gives nothing, rather than throwing, before the form has mounted', () => {
    const Probe = defineComponent({
      setup() {
        const formRef = ref<any>(null)
        const seen: any[] = []
        return () => {
          // Read on the first render, before the ref is set
          seen.push(formRef.value?.$isSubmitting)
          return h(Enforma, { ref: formRef, data: { name: 'a' } })
        }
      },
    })
    expect(() => mount(Probe).unmount()).not.toThrow()
  })
})

describe('a ref to <HeadlessForm>', () => {
  beforeEach(() => {
    setGlobalConfig(DEFAULT_CONFIG)
    useDefaultPreset()
  })

  it('reads $isSubmitting as it changes', async () => {
    const { handler, resolve } = pendingHandler()
    const { wrapper, formRef } = mountParent(
      HeadlessForm,
      { data: reactive({ name: 'a' }), submitHandler: handler },
      () => h('input', { name: 'name' })
    )
    await flushPromises()

    const submitted = formRef.value.submit()
    await flushPromises()
    expect(formRef.value.$isSubmitting).toBe(true)
    expect(wrapper.find('.submitting').text()).toBe('true')

    resolve()
    await submitted
    expect(formRef.value.$isSubmitting).toBe(false)

    wrapper.unmount()
  })
})
