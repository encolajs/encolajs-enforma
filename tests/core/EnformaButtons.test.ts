import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import Enforma from '@/core/Enforma.vue'
import EnformaRepeatableAddButton from '@/core/EnformaRepeatableAddButton.vue'
import EnformaRepeatableRemoveButton from '@/core/EnformaRepeatableRemoveButton.vue'
import EnformaRepeatableMoveUpButton from '@/core/EnformaRepeatableMoveUpButton.vue'
import EnformaRepeatableMoveDownButton from '@/core/EnformaRepeatableMoveDownButton.vue'
import { DEFAULT_CONFIG } from '@/constants/defaults'
import { getGlobalConfig, setGlobalConfig } from '@/utils/useConfig'
import useDefaultPreset from '@/presets/default'

/**
 * A button that, like Nuxt UI's UButton or PrimeVue's Button,
 * has an `as` prop of its own. If Enforma forwarded `pt.*.as` to it,
 * `as` would be a component instead of the default 'button'.
 */
const ButtonWithAsProp = defineComponent({
  name: 'ButtonWithAsProp',
  props: {
    as: { type: null, default: 'button' },
    type: { type: String, default: 'button' },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'button',
        {
          type: props.type,
          'data-as': typeof props.as === 'string' ? props.as : 'component',
        },
        slots.default?.()
      )
  },
})

function applyButtonConfig(): void {
  setGlobalConfig(DEFAULT_CONFIG)
  useDefaultPreset()
  const config = getGlobalConfig()
  setGlobalConfig({
    ...config,
    pt: {
      ...config.pt,
      submit: { ...config.pt?.submit, as: ButtonWithAsProp, class: 'submit' },
      reset: { ...config.pt?.reset, as: ButtonWithAsProp, class: 'reset' },
      repeatable: {
        ...config.pt?.repeatable,
        add: { as: ButtonWithAsProp, class: 'add' },
        remove: { as: ButtonWithAsProp, class: 'remove' },
        moveUp: { as: ButtonWithAsProp, class: 'move-up' },
        moveDown: { as: ButtonWithAsProp, class: 'move-down' },
      },
    },
  })
}

describe('Enforma buttons with a custom `as` component', () => {
  beforeEach(() => {
    applyButtonConfig()
  })

  it('does not forward `as` to the submit and reset buttons', async () => {
    const submitHandler = vi.fn().mockResolvedValue(true)
    // attached to the document so clicking a submit button submits the form
    const wrapper = mount(Enforma, {
      props: { data: { name: 'John' }, submitHandler },
      attachTo: document.body,
    })
    await flushPromises()

    const submit = wrapper.find('button.submit')
    const reset = wrapper.find('button.reset')

    expect(submit.attributes('data-as')).toBe('button')
    expect(submit.attributes('type')).toBe('submit')
    expect(reset.attributes('data-as')).toBe('button')
    expect(reset.attributes('type')).toBe('reset')

    await submit.trigger('click')
    await flushPromises()
    expect(submitHandler).toHaveBeenCalled()

    wrapper.unmount()
  })

  it.each([
    ['add', EnformaRepeatableAddButton],
    ['remove', EnformaRepeatableRemoveButton],
    ['move-up', EnformaRepeatableMoveUpButton],
    ['move-down', EnformaRepeatableMoveDownButton],
  ])('does not forward `as` to the repeatable %s button', (cls, component) => {
    const wrapper = mount(component)
    const button = wrapper.find(`button.${cls}`)

    expect(button.exists()).toBe(true)
    expect(button.attributes('data-as')).toBe('button')
  })
})
