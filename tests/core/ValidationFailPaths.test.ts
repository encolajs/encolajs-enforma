// A refused submit says which fields failed, in the order they render (sections and positions
// applied), and focusField(path) focuses one, so a kit opens the tab holding the first and
// focuses it.
import { describe, it, expect } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import Enforma from '@/core/Enforma.vue'
import { useForm } from '@/headless/useForm'
import { fieldsInRenderOrder } from '@/core/useEnformaSection'
import { createEncolaValidator } from '@/validators/encolaValidator'
import { mountTestComponent } from '../utils/testSetup'
import type { FormSchema } from '@/types'

// Written out of order: the form renders first, second, third, fourth, fifth
const schema = {
  fifth: { section: 'later', inputComponent: 'input', rules: 'required' },
  later: { type: 'section', title: 'Later', position: 4 },
  second: { inputComponent: 'input', position: 2, rules: 'required' },
  fourth: { section: 'later', inputComponent: 'input', position: 1 },
  first: { inputComponent: 'input', position: 1 },
  third: { inputComponent: 'input', position: 3 },
  note: { type: 'content', component: 'p', position: 4 },
} as FormSchema

describe("a refused submit's failing fields", () => {
  it('are listed in the order the schema renders them, across sections', () => {
    expect(fieldsInRenderOrder(schema)).toEqual([
      'first',
      'second',
      'third',
      'fourth',
      'fifth',
    ])
  })

  it('come with validation_fail, in that order', async () => {
    const wrapper = mountTestComponent(Enforma, {
      data: { first: 'a', second: '', third: 'c', fourth: 'd', fifth: '' },
      schema,
    })
    await flushPromises()

    // @ts-expect-error vm is a form
    expect(await wrapper.vm.submit()).toBe(false)
    await flushPromises()

    const [[formController, paths]] = wrapper.emitted('validation_fail') as [
      [unknown, string[]]
    ]
    expect(formController).toBeDefined()
    expect(paths).toEqual(['second', 'fifth'])
  })

  it("follow useForm()'s fieldOrder, a repeatable's items where it is, in onValidationFail and the event", async () => {
    const failed: string[][] = []
    const heard: string[][] = []
    const form = useForm(
      { email: '', jobs: [{ title: '' }], name: '' },
      createEncolaValidator({
        email: 'required',
        'jobs.*.title': 'required',
        name: 'required',
      }),
      {
        fieldOrder: () => ['name', 'jobs', 'email'],
        onValidationFail: (_, paths) => failed.push(paths),
      }
    )
    form.on('validation_fail', ({ paths }: { paths: string[] }) =>
      heard.push(paths)
    )
    // The form gets its fields out of order
    form.getField('email')
    form.getField('jobs.0.title')
    form.getField('name')

    expect(await form.submit()).toBe(false)

    expect(failed).toEqual([['name', 'jobs.0.title', 'email']])
    expect(heard).toEqual(failed)
  })

  it('without a fieldOrder, are in the order the form got them', async () => {
    const failed: string[][] = []
    const form = useForm(
      { b: '', a: '' },
      createEncolaValidator({ a: 'required', b: 'required' }),
      { onValidationFail: (_, paths) => failed.push(paths) }
    )
    form.getField('b')
    form.getField('a')

    await form.submit()

    expect(failed).toEqual([['b', 'a']])
  })
})

describe('focusField()', () => {
  it("focuses the field's input", async () => {
    const wrapper = mountTestComponent(Enforma, {
      data: { first: 'a', second: '', third: 'c', fourth: 'd', fifth: '' },
      schema,
    })
    document.body.appendChild(wrapper.element)
    await flushPromises()

    // @ts-expect-error vm is a form
    wrapper.vm.focusField('fifth')

    expect(document.activeElement?.getAttribute('name')).toBe('fifth')
    wrapper.unmount()
  })
})
