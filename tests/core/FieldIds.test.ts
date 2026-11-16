// A field's id is the form's id and its path, the same on the server and in the browser, so
// a server-rendered form hydrates. focusField() finds a field's input as a user would: by
// the field's id, by the label naming it, or as the first thing in the field taking focus
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, reactive, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import Enforma from '@/core/Enforma.vue'
import { useEnformaField } from '@/core/useEnformaField'
import { useForm } from '@/headless/useForm'
import { DEFAULT_CONFIG } from '@/constants/defaults'
import { setGlobalConfig } from '@/utils/useConfig'
import useDefaultPreset from '@/presets/default'
import type { FormController } from '@/types'

beforeEach(() => {
  setGlobalConfig(DEFAULT_CONFIG)
  useDefaultPreset()
  Element.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  document.body.innerHTML = ''
  delete (Element.prototype as any).scrollIntoView
})

describe('a field\'s id', () => {
  it('is the form\'s id and its path', async () => {
    const wrapper = mount(Enforma, {
      props: {
        id: 'signup',
        data: reactive({ email: '', address: { city: '' } }),
        schema: { email: { label: 'Email' }, 'address.city': { label: 'City' } },
      },
    })
    await flushPromises()

    const email = wrapper.find('input[name="email"]')
    expect(email.attributes('id')).toBe('signup__email')
    expect(wrapper.find('label[for="signup__email"]').exists()).toBe(true)
    expect(wrapper.find('input[name="address.city"]').attributes('id')).toBe(
      'signup__address.city'
    )
  })

  it('stays unique as rows move: a field made on a taken path gets a number after it', () => {
    const form = useForm({ items: [{ name: 'a' }, { name: 'b' }] }, undefined, { id: 'f' })
    expect(form.getField('items.0.name')._id).toBe('f__items.0.name')
    expect(form.getField('items.1.name')._id).toBe('f__items.1.name')

    // The second row's state moves to the first path; a row added takes the second path
    form.remove('items', 0)
    form.add('items', 1, { name: 'c' })
    const ids = [form.getField('items.0.name')._id, form.getField('items.1.name')._id]
    expect(ids[0]).toBe('f__items.1.name')
    expect(ids[1]).toBe('f__items.1.name-2')
  })

  it('is the same on the server and in the browser, so the form hydrates', async () => {
    const App = defineComponent({
      setup: () => () =>
        h(Enforma, {
          data: reactive({ email: '', iban: '', vat: '', items: [{ name: '' }] }),
          schema: {
            email: { label: 'Email' },
            account: { type: 'section', component: 'tabs' },
            billing: { type: 'section', section: 'account', title: 'Billing' },
            iban: { section: 'billing', label: 'IBAN' },
            company: {
              type: 'section',
              section: 'billing',
              component: 'collapsible',
              title: 'Company',
            },
            vat: { section: 'company', label: 'VAT' },
            other: { type: 'section', section: 'account', title: 'Other' },
            items: {
              type: 'repeatable',
              section: 'other',
              subfields: { name: { label: 'Name' } },
            },
          },
        }),
    })

    const html = await renderToString(createSSRApp(App))
    expect(html).toContain('__email')

    const warnings: string[] = []
    const record = (...args: any[]) => warnings.push(args.map(String).join(' '))
    const warn = vi.spyOn(console, 'warn').mockImplementation(record)
    const error = vi.spyOn(console, 'error').mockImplementation(record)
    const container = document.createElement('div')
    container.innerHTML = html
    document.body.appendChild(container)
    const app = createSSRApp(App)
    app.mount(container)
    await flushPromises()
    warn.mockRestore()
    error.mockRestore()

    expect(warnings.filter((w) => /hydration|mismatch/i.test(w))).toEqual([])
    app.unmount()
  })
})

describe('focusField() finds a field\'s input', () => {
  /** A form whose `code` field is drawn by `field`, or whose input is `input` */
  async function mountForm(extra: Record<string, any>) {
    const form = ref<FormController | null>(null)
    mount(
      defineComponent({
        setup: () => () =>
          h(Enforma, {
            ref: form,
            data: reactive({ code: '' }),
            schema: { code: { label: 'Code', ...(extra.schema || {}) } },
            config: extra.config || {},
          }),
      }),
      { attachTo: document.body }
    )
    await flushPromises()
    return form.value!
  }

  it('when its input has an id of its own', async () => {
    const OwnIdInput = defineComponent({
      inheritAttrs: false,
      props: { name: String },
      setup: (props) => () => h('input', { id: 'own-id', name: props.name }),
    })
    const form = await mountForm({ schema: { inputComponent: OwnIdInput } })

    expect(form.focusField('code')).toBe(true)
    await vi.waitFor(() => expect(document.activeElement?.id).toBe('own-id'))
  })

  it('by the label naming it, in a field of a kit that ids its input itself', async () => {
    const KitField = defineComponent({
      props: { name: { type: String, required: true }, label: String },
      setup(originalProps) {
        const { props } = useEnformaField(originalProps as any)
        return () =>
          h('div', props.value.wrapperProps, [
            h('button', { type: 'button' }, '?'),
            h('label', { for: 'kit-input' }, originalProps.label),
            h('input', { id: 'kit-input', name: originalProps.name }),
          ])
      },
    })
    const form = await mountForm({ config: { components: { field: KitField } } })

    expect(form.focusField('code')).toBe(true)
    await vi.waitFor(() => expect(document.activeElement?.id).toBe('kit-input'))
  })

  it('as the input the field component names', async () => {
    const KitField = defineComponent({
      props: { name: { type: String, required: true }, label: String },
      setup(originalProps) {
        const input = ref<HTMLElement | null>(null)
        const { props } = useEnformaField(originalProps as any, {
          input: () => input.value,
        })
        return () =>
          h('div', props.value.wrapperProps, [
            h('input', { name: 'search', 'aria-label': 'Search codes' }),
            h('input', { ref: input, name: originalProps.name }),
          ])
      },
    })
    const form = await mountForm({ config: { components: { field: KitField } } })

    expect(form.focusField('code')).toBe(true)
    await vi.waitFor(() =>
      expect(document.activeElement?.getAttribute('name')).toBe('code')
    )
  })
})
