// A section's fields and how many of them have errors (useEnformaSection()), for tabs that
// count their errors.
import { describe, it, expect } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import Enforma from '@/core/Enforma.vue'
import EnformaSectionItems from '@/core/EnformaSectionItems.vue'
import { useEnformaSection } from '@/core/useEnformaSection'
import { mountTestComponent } from '../utils/testSetup'
import type { FormSchema } from '@/types'

// A section showing its fields and its count of errors, around its items
const Counted = defineComponent({
  props: { name: { type: String, required: true } },
  setup(props) {
    const { fields, errorCount } = useEnformaSection(() => props.name)
    return () =>
      h(
        'div',
        {
          class: 'counted',
          'data-fields': fields.value.join(','),
          'data-errors': String(errorCount.value),
        },
        [h(EnformaSectionItems, { name: props.name })]
      )
  },
})

const schema = {
  details: { type: 'section', component: 'counted' },
  person: { type: 'section', section: 'details', title: 'Person' },
  first_name: {
    type: 'field',
    section: 'person',
    inputComponent: 'input',
    rules: 'required',
  },
  nickname: { type: 'field', section: 'person', inputComponent: 'input' },
  contact: { type: 'section', section: 'details', title: 'Contact' },
  email: {
    type: 'field',
    section: 'contact',
    inputComponent: 'input',
    rules: 'required',
  },
  hidden: {
    type: 'field',
    section: 'contact',
    inputComponent: 'input',
    rules: 'required',
    if: false,
  },
  note: { type: 'content', component: 'p', section: 'contact' },
  elsewhere: { type: 'field', inputComponent: 'input', rules: 'required' },
} as FormSchema

describe("a section's errors", () => {
  it('counts the failing fields of its sub-sections, falling as they are fixed, and 0 after reset()', async () => {
    const wrapper = mountTestComponent(Enforma, {
      data: { first_name: '', nickname: '', email: '', elsewhere: '' },
      schema,
      config: { components: { counted: Counted } },
    })
    await flushPromises()
    const section = () => wrapper.find('.counted')

    // Its fields at any depth, but the hidden one, the content and the fields outside it
    expect(section().attributes('data-fields')).toBe(
      'first_name,nickname,email'
    )
    expect(section().attributes('data-errors')).toBe('0')

    // @ts-expect-error vm is a form
    await wrapper.vm.submit()
    await flushPromises()
    expect(section().attributes('data-errors')).toBe('2')

    // @ts-expect-error vm is a form
    await wrapper.vm.setFieldValue('first_name', 'Ana')
    await flushPromises()
    expect(section().attributes('data-errors')).toBe('1')

    // @ts-expect-error vm is a form
    wrapper.vm.reset()
    await flushPromises()
    expect(section().attributes('data-errors')).toBe('0')
  })

  it("counts each failing field of a repeatable's items, and an error on the list itself", async () => {
    const wrapper = mountTestComponent(Enforma, {
      data: { jobs: [{ title: '' }, { title: 'Cook' }, { title: '' }] },
      schema: {
        work: { type: 'section', component: 'counted' },
        jobs: {
          type: 'repeatable',
          section: 'work',
          subfields: {
            title: { inputComponent: 'input', rules: 'required' },
          },
        },
      } as FormSchema,
      config: { components: { counted: Counted } },
    })
    await flushPromises()
    const section = () => wrapper.find('.counted')

    // @ts-expect-error vm is a form
    await wrapper.vm.submit()
    await flushPromises()
    expect(section().attributes('data-errors')).toBe('2')

    // @ts-expect-error vm is a form
    wrapper.vm.setFieldErrors('jobs', ['Add at most two jobs'])
    await flushPromises()
    expect(section().attributes('data-errors')).toBe('3')
  })
})
