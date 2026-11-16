// The Quasar preset draws tabs and collapsible sections with Quasar's QTabs and QExpansionItem:
// every panel stays drawn, each counts its errors in a QBadge, and a refused submit opens the
// one holding the first field with errors.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { Quasar } from 'quasar'
import Enforma from '@/core/Enforma.vue'
import { DEFAULT_CONFIG } from '@/constants/defaults'
import { setGlobalConfig } from '@/utils/useConfig'
import useDefaultPreset from '@/presets/default'
import useQuasarPreset from '@/presets/quasar'

// jsdom has no ResizeObserver, which Quasar's tabs use
globalThis.ResizeObserver ??= class {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
} as any

const schema = {
  account: { type: 'section', component: 'tabs' },
  profile: { type: 'section', section: 'account', title: 'Profile' },
  name: { type: 'field', section: 'profile' },
  billing: { type: 'section', section: 'account', title: 'Billing' },
  iban: { type: 'field', section: 'billing', rules: 'required' },
  extra: {
    type: 'section',
    section: 'billing',
    component: 'collapsible',
    title: 'Extra',
    description: 'Optional details',
    props: { open: false },
  },
  vat: { type: 'field', section: 'extra', rules: 'required' },
}

function mountForm(
  formSchema: Record<string, any> = schema,
  data: Record<string, any> = { name: 'Ana', iban: '', vat: '' }
) {
  return mount(Enforma, {
    props: {
      data,
      schema: formSchema,
      submitHandler: () => Promise.resolve(true),
    },
    global: { plugins: [[Quasar, {}]] },
    attachTo: document.body,
  })
}

const isShown = (element: Element | undefined) =>
  !!element && (element as HTMLElement).style.display !== 'none'

// What the form scrolled into view, by the name of the input inside
let scrolledTo: Array<string | null | undefined>
const scrolledName = () => scrolledTo[0]

const focusedName = () => document.activeElement?.getAttribute('name')

describe('Quasar preset: tabs and collapsibles', () => {
  beforeEach(() => {
    setGlobalConfig(DEFAULT_CONFIG)
    useDefaultPreset()
    useQuasarPreset()
    scrolledTo = []
    Element.prototype.scrollIntoView = function (this: Element) {
      scrolledTo.push(this.querySelector('[name]')?.getAttribute('name'))
    }
  })

  afterEach(() => {
    document.body.innerHTML = ''
    delete (Element.prototype as any).scrollIntoView
  })

  it('draws the tabs with QTabs, and every panel, one shown', async () => {
    const wrapper = mountForm()
    await flushPromises()

    expect(wrapper.findAll('[role="tab"]').map((tab) => tab.text())).toEqual([
      'Profile',
      'Billing',
    ])
    const panels = wrapper.findAll('[role="tabpanel"]')
    expect(panels).toHaveLength(2)
    expect(isShown(panels[0].element)).toBe(true)
    expect(isShown(panels[1].element)).toBe(false)
    expect(panels[1].attributes('aria-labelledby')).toBe(
      wrapper.findAll('[role="tab"]')[1].attributes('id')
    )
    expect(wrapper.find('[name="vat"]').exists()).toBe(true)
  })

  it('opens the tab holding the first field with errors, counting them in a QBadge', async () => {
    const wrapper = mountForm()
    await flushPromises()

    // @ts-expect-error vm is a form
    expect(await wrapper.vm.submit()).toBe(false)
    await flushPromises()

    const [, billing] = wrapper.findAll('[role="tab"]')
    expect(billing.attributes('aria-selected')).toBe('true')
    expect(isShown(wrapper.findAll('[role="tabpanel"]')[1].element)).toBe(true)
    expect(scrolledName()).toBe('iban')
    expect(focusedName()).toBe('iban')
    const badge = billing.find('.q-badge')
    expect(badge.classes()).toContain('bg-negative')
    expect(badge.find('[aria-hidden="true"]').text()).toBe('2')
    expect(badge.text()).toContain('2 errors')
  })

  it('opens the tab, then the expansion item, holding the first field with errors', async () => {
    const wrapper = mountForm(schema, { name: 'Ana', iban: 'RO49', vat: '' })
    await flushPromises()
    const content = () =>
      wrapper.find('.quasar-collapsible .q-expansion-item__content')
    expect(isShown(content().element)).toBe(false)

    // @ts-expect-error vm is a form
    await wrapper.vm.submit()
    await flushPromises()

    expect(isShown(content().element)).toBe(true)
    expect(scrolledName()).toBe('vat')
    expect(focusedName()).toBe('vat')
  })

  it('opens and closes the collapsible with its header, which holds the description', async () => {
    const wrapper = mountForm()
    await flushPromises()
    const header = wrapper.find('.quasar-collapsible [aria-expanded]')

    expect(header.text()).toContain('Extra')
    expect(header.text()).toContain('Optional details')
    expect(header.attributes('aria-expanded')).toBe('false')
    await header.trigger('click')
    await flushPromises()
    expect(header.attributes('aria-expanded')).toBe('true')
  })

  it("gives a field's id to QInput's native input, which its label points at", async () => {
    const wrapper = mountForm()
    await flushPromises()
    const input = wrapper.find('[name="name"]')
    const id = input.attributes('id')

    expect(id).toMatch(/^field_name_/)
    expect(wrapper.find(`label[for="${id}"]`).exists()).toBe(true)
  })

  it('lays vertical tabs beside their panels', async () => {
    const wrapper = mountForm({
      ...schema,
      account: { ...schema.account, props: { orientation: 'vertical' } },
    })
    await flushPromises()

    expect(wrapper.find('.q-tabs').classes()).toContain('q-tabs--vertical')
    expect(wrapper.find('.q-tabs').element.parentElement!.className).toContain(
      'row'
    )
  })
})
