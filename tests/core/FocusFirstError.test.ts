// A refused submit goes to the first field with errors, in the order the fields are on the
// page: it opens the panels (tabs, collapsibles) holding it, scrolls it into view and focuses
// its input. focusField() and focusFirstError() do the same when asked.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import {
  defineComponent,
  h,
  reactive,
  ref,
  vShow,
  withDirectives,
  type VNode,
} from 'vue'
import Enforma from '@/core/Enforma.vue'
import EnformaField from '@/core/EnformaField.vue'
import EnformaPanel from '@/core/EnformaPanel'
import { useEnformaPanel, type EnformaPanelState } from '@/core/useEnformaPanel'
import { provideEnformaForm } from '@/core/provideEnformaForm'
import { useForm } from '@/headless/useForm'
import { createEncolaValidator } from '@/validators/encolaValidator'
import { DEFAULT_CONFIG } from '@/constants/defaults'
import { setGlobalConfig } from '@/utils/useConfig'
import useDefaultPreset from '@/presets/default'
import type { FormController } from '@/types'

// jsdom has no scrollIntoView: record what was scrolled to, and how
let scrolls: Array<{ element: Element; options: any }>

beforeEach(() => {
  setGlobalConfig(DEFAULT_CONFIG)
  useDefaultPreset()
  scrolls = []
  Element.prototype.scrollIntoView = vi.fn(function (
    this: Element,
    options?: any
  ) {
    scrolls.push({ element: this, options })
  })
})

afterEach(() => {
  document.body.innerHTML = ''
  delete (Element.prototype as any).scrollIntoView
  delete (window as any).matchMedia
})

const focusedName = () =>
  document.activeElement?.getAttribute('name') ?? undefined

/** A form with its schema, in the page, and a ref to it */
function mountSchemaForm(
  schema: Record<string, any>,
  data: Record<string, any>,
  extra: Record<string, any> = {}
) {
  const form = ref<FormController | null>(null)
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(Enforma, { ref: form, data: reactive(data), schema, ...extra }),
    }),
    { attachTo: document.body }
  )
  return { wrapper, form }
}

/**
 * A form drawing what `content` gives in its default slot, with its rules, in the page, and a
 * ref to it
 */
function mountWithContent(
  data: Record<string, any>,
  rules: Record<string, string>,
  content: () => Array<VNode | null>
) {
  const form = ref<FormController | null>(null)
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          Enforma,
          { ref: form, data: reactive(data), rules },
          { default: content }
        ),
    }),
    { attachTo: document.body }
  )
  return { wrapper, form }
}

/** Content shown by `shown`, hidden with `v-show` otherwise, as a tab's panel is */
const shownWhen = (shown: boolean, attrs: Record<string, any>, children: any) =>
  withDirectives(h('div', attrs, children), [[vShow, shown]])

const isShown = (element: Element | null) =>
  !!element && (element as HTMLElement).style.display !== 'none'

describe('a refused submit', () => {
  const schema = {
    first: { inputComponent: 'input' },
    second: { inputComponent: 'input', rules: 'required' },
    third: { inputComponent: 'input', rules: 'required' },
  }

  it('scrolls the first field with errors to the middle of the view and focuses its input', async () => {
    const { form } = mountSchemaForm(schema, {
      first: 'a',
      second: '',
      third: '',
    })
    await flushPromises()

    expect(await form.value!.submit()).toBe(false)
    await flushPromises()

    expect(focusedName()).toBe('second')
    expect(scrolls).toHaveLength(1)
    // The field's wrapper: its label and error scroll into view with the input
    expect(scrolls[0].element.id).toMatch(/^wrapper-/)
    expect(scrolls[0].element.querySelector('[name="second"]')).not.toBeNull()
    expect(scrolls[0].options).toEqual({ block: 'center', behavior: 'smooth' })
  })

  it('scrolls without animating when the user asks for less motion', async () => {
    window.matchMedia = vi.fn((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
    })) as any
    const { form } = mountSchemaForm(schema, {
      first: 'a',
      second: '',
      third: '',
    })
    await flushPromises()

    await form.value!.submit()
    await flushPromises()

    expect(scrolls[0].options).toEqual({ block: 'center', behavior: 'auto' })
  })

  it('goes there after the validation_fail listeners heard of it', async () => {
    const focusedThen: Array<string | null | undefined> = []
    const { form } = mountSchemaForm(
      schema,
      { first: 'a', second: '', third: '' },
      { onValidation_fail: () => focusedThen.push(focusedName()) }
    )
    await flushPromises()

    await form.value!.submit()
    await flushPromises()

    expect(focusedThen).toEqual([undefined])
    expect(focusedName()).toBe('second')
  })

  it("stays where it is when the form's config turns it off", async () => {
    const { form } = mountSchemaForm(
      schema,
      { first: 'a', second: '', third: '' },
      { config: { behavior: { focusFirstError: false } } }
    )
    await flushPromises()

    expect(await form.value!.submit()).toBe(false)
    await flushPromises()

    expect(focusedName()).toBeUndefined()
    expect(scrolls).toHaveLength(0)
  })

  it('goes to the field that is first on the page, though it was drawn later', async () => {
    const showTop = ref(false)
    const failed: string[][] = []
    const form = ref<FormController | null>(null)
    mount(
      defineComponent({
        setup: () => () =>
          h(
            Enforma,
            {
              ref: form,
              data: reactive({ top: '', bottom: '' }),
              rules: { top: 'required', bottom: 'required' },
              onValidation_fail: (_: unknown, paths: string[]) =>
                failed.push(paths),
            },
            {
              default: () => [
                showTop.value ? h(EnformaField, { name: 'top' }) : null,
                h(EnformaField, { name: 'bottom' }),
              ],
            }
          ),
      }),
      { attachTo: document.body }
    )
    await flushPromises()
    showTop.value = true
    await flushPromises()

    await form.value!.submit()
    await flushPromises()

    expect(failed).toEqual([['top', 'bottom']])
    expect(focusedName()).toBe('top')
  })
})

describe('panels', () => {
  /** Two tabs, drawn by hand, each panel's content in an <EnformaPanel> */
  const Tabs = defineComponent({
    setup() {
      const active = ref('one')
      const one = useEnformaPanel({ reveal: () => (active.value = 'one') })
      const two = useEnformaPanel({ reveal: () => (active.value = 'two') })
      return () =>
        h('div', [
          h('span', { 'data-tab': 'one' }, `One ${one.errorCount}`),
          h('span', { 'data-tab': 'two' }, `Two ${two.errorCount}`),
          shownWhen(active.value === 'one', { 'data-panel': 'one' }, [
            h(EnformaPanel, { panel: one }, () => [
              h(EnformaField, { name: 'a' }),
            ]),
          ]),
          shownWhen(active.value === 'two', { 'data-panel': 'two' }, [
            h(EnformaPanel, { panel: two }, () => [
              h(EnformaField, { name: 'b' }),
            ]),
          ]),
        ])
    },
  })

  it('opens the tab holding the first field with errors, then focuses it', async () => {
    const { wrapper, form } = mountWithContent(
      { a: 'x', b: '' },
      { b: 'required' },
      () => [h(Tabs)]
    )
    await flushPromises()
    const panel = (name: string) =>
      wrapper.element.querySelector(`[data-panel="${name}"]`)
    expect(isShown(panel('two'))).toBe(false)

    expect(await form.value!.submit()).toBe(false)
    await flushPromises()

    expect(isShown(panel('two'))).toBe(true)
    expect(isShown(panel('one'))).toBe(false)
    expect(focusedName()).toBe('b')
  })

  it('count the fields inside them that have errors, as errors come and go', async () => {
    const { wrapper, form } = mountWithContent(
      { a: 'x', b: '' },
      { b: 'required' },
      () => [h(Tabs)]
    )
    await flushPromises()
    const header = (name: string) => wrapper.find(`[data-tab="${name}"]`).text()
    expect(header('two')).toBe('Two 0')

    await form.value!.submit()
    await flushPromises()
    expect(header('one')).toBe('One 0')
    expect(header('two')).toBe('Two 1')

    form.value!.setFieldErrors('b', [])
    await flushPromises()
    expect(header('two')).toBe('Two 0')
  })

  it('open the outermost first, and count the fields of the panels inside them', async () => {
    const opened: string[] = []
    let outer: EnformaPanelState
    const Nested = defineComponent({
      setup() {
        const outerOpen = ref(false)
        const innerOpen = ref(false)
        outer = useEnformaPanel({
          reveal: () => {
            opened.push(`outer, inner ${innerOpen.value ? 'open' : 'closed'}`)
            outerOpen.value = true
          },
        })
        const inner = useEnformaPanel({
          reveal: () => {
            opened.push(`inner, outer ${outerOpen.value ? 'open' : 'closed'}`)
            innerOpen.value = true
          },
        })
        return () =>
          shownWhen(outerOpen.value, { 'data-panel': 'outer' }, [
            h(EnformaPanel, { panel: outer }, () => [
              shownWhen(innerOpen.value, { 'data-panel': 'inner' }, [
                h(EnformaPanel, { panel: inner }, () => [
                  h(EnformaField, { name: 'deep' }),
                ]),
              ]),
            ]),
          ])
      },
    })
    const { form } = mountWithContent(
      { deep: '' },
      { deep: 'required' },
      () => [h(Nested)]
    )
    await flushPromises()

    await form.value!.submit()
    await flushPromises()

    expect(opened).toEqual(['outer, inner closed', 'inner, outer open'])
    expect(outer!.errorCount).toBe(1)
    expect(focusedName()).toBe('deep')
  })
})

describe('focusField()', () => {
  it('says whether something on the page answered', async () => {
    const { form } = mountSchemaForm(
      { name: { inputComponent: 'input' } },
      { name: '' }
    )
    await flushPromises()

    expect(form.value!.focusField('nowhere')).toBe(false)
    expect(form.value!.focusField('name')).toBe(true)
    await flushPromises()
    expect(focusedName()).toBe('name')
  })

  it('says a listener answered when it sets handled', () => {
    const form = useForm({ name: '' }, createEncolaValidator({}))
    form.on('field_focus_requested', (request: any) => {
      if (request.path === 'name') request.handled = true
    })

    expect(form.focusField('name')).toBe(true)
    expect(form.focusField('other')).toBe(false)
  })
})

describe('focusFirstError()', () => {
  it('goes to the first field with errors, as after errors from the server', async () => {
    const { form } = mountSchemaForm(
      {
        first: { inputComponent: 'input' },
        second: { inputComponent: 'input' },
      },
      { first: '', second: '' }
    )
    await flushPromises()
    expect(form.value!.focusFirstError()).toBe(false)

    form.value!.setErrors({ second: ['Taken'], first: ['Too short'] })
    expect(focusedName()).toBeUndefined()

    expect(form.value!.focusFirstError()).toBe(true)
    await flushPromises()
    expect(focusedName()).toBe('first')
  })

  it('skips the fields nothing on the page answers for', async () => {
    const requested: string[] = []
    const form = useForm({ ghost: '', name: '' }, createEncolaValidator({}), {
      fieldOrder: () => ['ghost', 'name'],
    })
    form.on('field_focus_requested', (request: any) => {
      requested.push(request.path)
      if (request.path === 'name') request.handled = true
    })
    form.setErrors({ name: ['Required'], ghost: ['Required'] })

    expect(form.focusFirstError()).toBe(true)
    expect(requested).toEqual(['ghost', 'name'])
  })
})

describe('a form whose host made its controller', () => {
  it('goes to the first field with errors after a refused submit', async () => {
    let controller!: FormController
    mount(
      defineComponent({
        setup() {
          controller = useForm(
            { name: '' },
            createEncolaValidator({ name: 'required' })
          )
          provideEnformaForm({ controller })
          return () => h('form', [h(EnformaField, { name: 'name' })])
        },
      }),
      { attachTo: document.body }
    )
    await flushPromises()

    expect(await controller.submit()).toBe(false)
    await flushPromises()

    expect(focusedName()).toBe('name')
  })
})
