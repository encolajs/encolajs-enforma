import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, reactive, ref } from 'vue'
import Enforma from '@/core/Enforma.vue'
import EnformaField from '@/core/EnformaField.vue'
import EnformaSubmitButton from '@/core/EnformaSubmitButton.vue'
import { DEFAULT_CONFIG } from '@/constants/defaults'
import { setGlobalConfig } from '@/utils/useConfig'
import useDefaultPreset from '@/presets/default'

const schema = { name: { label: 'Name' } }

/** A schema form with its own submit button, and a ref to it */
function mountForm(submitHandler = vi.fn()) {
  const form = ref<any>(null)
  const Page = defineComponent({
    setup() {
      const data = reactive({ name: 'Ana', avatar: null })
      return () => h(Enforma, { ref: form, data, schema, submitHandler })
    },
  })
  const wrapper = mount(Page, { attachTo: document.body })
  return { wrapper, form }
}

/** A schema form with its submit button outside it, in a footer, given the form by a ref */
function mountWithFooter(submitHandler = vi.fn()) {
  const form = ref<any>(null)
  const Page = defineComponent({
    setup() {
      const data = reactive({ name: 'Ana', avatar: null })
      return () =>
        h('div', [
          h(Enforma, {
            ref: form,
            data,
            schema,
            submitHandler,
            showSubmitButton: false,
          }),
          h('footer', [h(EnformaSubmitButton, { form: form.value })]),
        ])
    },
  })
  const wrapper = mount(Page, { attachTo: document.body })
  return { wrapper, form }
}

describe('pending work in <Enforma>', () => {
  beforeEach(() => {
    setGlobalConfig(DEFAULT_CONFIG)
    useDefaultPreset()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('disables the submit button while work is pending, without showing it submitting', async () => {
    const { wrapper, form } = mountForm()
    await flushPromises()
    const button = () => wrapper.find('button[type="submit"]')

    const { done } = form.value.beginPending('avatar')
    await nextTick()
    expect(button().attributes('disabled')).toBeDefined()
    expect(button().text()).toBe('Submit')

    done()
    await nextTick()
    expect(button().attributes('disabled')).toBeUndefined()
    wrapper.unmount()
  })

  it('disables a submit button outside the form while the form it is given has work pending', async () => {
    const { wrapper, form } = mountWithFooter()
    await flushPromises()
    const button = () => wrapper.find('footer button')

    const { done } = form.value.beginPending('avatar')
    await nextTick()
    expect(button().attributes('disabled')).toBeDefined()
    expect(button().text()).toBe('Submit')

    done()
    await nextTick()
    expect(button().attributes('disabled')).toBeUndefined()
    wrapper.unmount()
  })

  it("doesn't submit on the <form>'s submit event (Enter in a field) while work is pending", async () => {
    const submitHandler = vi.fn()
    const { wrapper, form } = mountForm(submitHandler)
    await flushPromises()
    form.value.beginPending('avatar')

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(submitHandler).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('marks the <form> busy while work is pending', async () => {
    const { wrapper, form } = mountForm()
    await flushPromises()

    const { done } = form.value.beginPending('avatar')
    await nextTick()
    expect(wrapper.find('form').attributes('aria-busy')).toBe('true')

    done()
    await nextTick()
    expect(wrapper.find('form').attributes('aria-busy')).toBeUndefined()
    wrapper.unmount()
  })

  it("drops a field's work as the <EnformaField> unmounts, hidden by its v-if", async () => {
    const shown = ref(true)
    const form = ref<any>(null)
    const Page = defineComponent({
      setup() {
        const data = reactive({ avatar: null })
        return () =>
          h(
            Enforma,
            { ref: form, data, showSubmitButton: false },
            {
              default: () =>
                shown.value ? h(EnformaField, { name: 'avatar' }) : null,
            }
          )
      },
    })
    const wrapper = mount(Page)
    await flushPromises()
    const work = form.value.beginPending('avatar')

    shown.value = false
    await nextTick()

    expect(work.signal.aborted).toBe(true)
    expect(form.value.$isPending).toBe(false)
    wrapper.unmount()
  })
})
