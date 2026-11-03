import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import Enforma from '@/core/Enforma.vue'
import { DEFAULT_CONFIG } from '@/constants/defaults'
import { setGlobalConfig } from '@/utils/useConfig'
import useDefaultPreset from '@/presets/default'
import useNuxtUIPreset from '@/presets/nuxtui'

// Stand-in for Nuxt UI's UInput: only the props the preset sets on error
const StubInput = defineComponent({
  name: 'StubInput',
  props: {
    modelValue: { type: null, default: null },
    highlight: { type: Boolean, default: false },
    color: { type: String, default: '' },
  },
  setup(props) {
    return () =>
      h('input', {
        'data-highlight': String(props.highlight),
        'data-color': props.color,
      })
  },
})

describe('Nuxt UI preset', () => {
  beforeEach(() => {
    setGlobalConfig(DEFAULT_CONFIG)
    useDefaultPreset()
    useNuxtUIPreset({ input: StubInput })
  })

  it('puts inputs with validation errors in the error state', async () => {
    const wrapper = mount(Enforma, {
      props: {
        data: { name: '' },
        schema: { name: { type: 'field', label: 'Name', rules: 'required' } },
        submitHandler: () => Promise.resolve(true),
      },
    })
    await flushPromises()

    const input = (): ReturnType<typeof wrapper.find> => wrapper.find('input')
    expect(input().attributes('data-highlight')).toBe('false')
    expect(input().attributes('data-color')).toBe('')

    // @ts-expect-error vm is a form
    await wrapper.vm.submit()
    await flushPromises()

    expect(input().attributes('data-highlight')).toBe('true')
    expect(input().attributes('data-color')).toBe('error')
  })

  it('passes disabled and placeholder from inputProps to the input', async () => {
    const wrapper = mount(Enforma, {
      props: {
        data: { name: '' },
        schema: {
          name: {
            type: 'field',
            label: 'Name',
            inputProps: { disabled: true, placeholder: 'Your name' },
          },
        },
        submitHandler: () => Promise.resolve(true),
      },
    })
    await flushPromises()

    const input = wrapper.find('input')
    expect(input.attributes('disabled')).toBeDefined()
    expect(input.attributes('placeholder')).toBe('Your name')
  })
})
