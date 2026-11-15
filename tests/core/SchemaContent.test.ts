// Content entries (`type: 'content'`): items of a section that aren't fields, such as a line
// restating the form, drawn by the component they name, with props worked out from the form's
// values. They have no value and no rules.
import { describe, it, expect, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import Enforma from '@/core/Enforma.vue'
import { mountTestComponent } from '../utils/testSetup'
import type { FormSchema } from '@/types'

const Note = defineComponent({
  props: { text: String, tone: String },
  setup(props) {
    return () => h('p', { class: 'note', 'data-tone': props.tone }, props.text)
  },
})

const schema = {
  price: {
    type: 'field',
    label: 'Price',
    inputComponent: 'input',
    position: 1,
    rules: 'required',
  },
  profit: {
    type: 'content',
    component: 'note',
    position: 2,
    // An expression, the whole string: `~` joins text in the expression language
    props: { text: '${"Profit: " ~ (form.price - form.cost)}' },
  },
  cost: { type: 'field', label: 'Cost', inputComponent: 'input', position: 3 },
  large: {
    type: 'content',
    component: 'note',
    position: 4,
    props: { text: 'A large price' },
    if: '${form.price > 1000}',
  },
} as FormSchema

const mountForm = (config: Record<string, any> = {}) =>
  mountTestComponent(Enforma, {
    data: { price: 100, cost: 40 },
    schema,
    config: {
      components: { note: Note },
      transformers: {
        content_props: [(props: any) => ({ ...props, tone: 'muted' })],
      },
      ...config,
    },
  })

/** The fields' names and the notes' texts, in the order they're drawn */
const drawn = (wrapper: ReturnType<typeof mountForm>) =>
  wrapper
    .findAll('.enforma-input, .note')
    .map((el) => (el.classes('note') ? el.text() : el.attributes('name')))

describe('content entries', () => {
  it('render between the fields by position, with props worked out from the values, through content_props', async () => {
    const wrapper = mountForm()
    await flushPromises()

    expect(drawn(wrapper)).toEqual(['price', 'Profit: 60', 'cost'])
    expect(wrapper.find('.note').attributes('data-tone')).toBe('muted')
  })

  it('follow the values, and show while their if holds', async () => {
    const wrapper = mountForm()
    await flushPromises()

    // @ts-expect-error vm is a form
    await wrapper.vm.setFieldValue('price', 1500)
    await flushPromises()

    expect(drawn(wrapper)).toEqual([
      'price',
      'Profit: 1460',
      'cost',
      'A large price',
    ])
  })

  it('never appear in the values or the errors', async () => {
    const wrapper = mountForm()
    await flushPromises()

    // @ts-expect-error vm is a form
    await wrapper.vm.setFieldValue('price', null)
    // @ts-expect-error vm is a form
    expect(await wrapper.vm.submit()).toBe(false)
    await flushPromises()

    // @ts-expect-error vm is a form
    expect(Object.keys(wrapper.vm.values())).toEqual(['price', 'cost'])
    // @ts-expect-error vm is a form
    const errors = wrapper.vm.errors()
    expect(errors.price.length).toBeGreaterThan(0)
    expect(Object.keys(errors)).not.toContain('profit')
    expect(Object.keys(errors)).not.toContain('large')
  })

  it('are left out, with a warning, when nothing has the component they name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mountForm({ components: {} })
    await flushPromises()

    expect(wrapper.findAll('.note').length).toBe(0)
    expect(drawn(wrapper)).toEqual(['price', 'cost'])
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('names the component "note"')
    )
    warn.mockRestore()
  })
})
