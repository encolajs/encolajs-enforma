// A field may be named like one of the controller's methods (track, commit, reset, values…):
// it still has its value, which the controller's proxy gives as the method
import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, reactive } from 'vue'
import Enforma from '@/core/Enforma.vue'
import { useField } from '@/headless/useField'
import { useForm } from '@/headless/useForm'
import { useRepeatable } from '@/headless/useRepeatable'
import { DEFAULT_CONFIG } from '@/constants/defaults'
import { setGlobalConfig } from '@/utils/useConfig'
import useDefaultPreset from '@/presets/default'

beforeEach(() => {
  setGlobalConfig(DEFAULT_CONFIG)
  useDefaultPreset()
})

// A checkbox giving its value through update:modelValue
const Checkbox = defineComponent({
  props: { modelValue: { type: Boolean, default: false }, name: String },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h('input', {
        type: 'checkbox',
        name: props.name,
        checked: props.modelValue,
        onChange: (e: Event) =>
          emit('update:modelValue', (e.target as HTMLInputElement).checked),
      })
  },
})

describe('a field named like a controller method', () => {
  it('has its value in useField(), which follows setFieldValue()', async () => {
    const form = useForm({ track: true, reset: 'kept' })
    let track: any
    let reset: any
    mount(
      defineComponent({
        setup() {
          track = useField('track', form)
          reset = useField('reset', form)
          return () => h('div')
        },
      })
    )

    expect(track.value.value).toBe(true)
    expect(track.value.model.value).toBe(true)
    expect(reset.value.value).toBe('kept')

    await form.setFieldValue('track', false)
    await flushPromises()
    expect(track.value.value).toBe(false)
    expect(track.value.model.value).toBe(false)
    expect(form.getFieldValue('track')).toBe(false)
  })

  it('has its value in useRepeatable()', () => {
    const form = useForm({ values: [{ name: 'a' }, { name: 'b' }] })
    let list: any
    mount(
      defineComponent({
        setup() {
          list = useRepeatable('values', form)
          return () => h('div')
        },
      })
    )

    expect(list.value.count).toBe(2)
    expect(list.value.value).toEqual([{ name: 'a' }, { name: 'b' }])
  })

  it('shows its value in a schema form, and a click turns it off again', async () => {
    const data = reactive({ track: true, commit: 'abc' })
    const wrapper = mount(Enforma, {
      props: {
        data,
        schema: {
          track: { label: 'Track quantity', inputComponent: Checkbox, useModelValue: true },
          commit: { label: 'Commit message' },
        },
      },
      attachTo: document.body,
    })
    await flushPromises()

    const checkbox = wrapper.find('input[name="track"]')
    expect((checkbox.element as HTMLInputElement).checked).toBe(true)
    expect((wrapper.find('input[name="commit"]').element as HTMLInputElement).value).toBe('abc')

    await checkbox.setValue(false)
    await flushPromises()
    expect((checkbox.element as HTMLInputElement).checked).toBe(false)
    expect((wrapper.vm as any).getFieldValue('track')).toBe(false)

    await checkbox.setValue(true)
    await flushPromises()
    expect((checkbox.element as HTMLInputElement).checked).toBe(true)
    expect((wrapper.vm as any).getFieldValue('track')).toBe(true)

    wrapper.unmount()
  })
})
