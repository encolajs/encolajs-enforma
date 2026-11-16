// The PrimeVue preset draws tabs and collapsible sections with PrimeVue's Tabs and Panel: every
// panel stays drawn, each counts its errors in a Badge, and a refused submit opens the one
// holding the first field with errors.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import Enforma from '@/core/Enforma.vue'
import { DEFAULT_CONFIG } from '@/constants/defaults'
import { setGlobalConfig } from '@/utils/useConfig'
import useDefaultPreset from '@/presets/default'
import usePrimeVuePreset from '@/presets/primevue'

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
    global: { plugins: [PrimeVue] },
    attachTo: document.body,
  })
}

// jsdom has no ResizeObserver, which PrimeVue's components use
globalThis.ResizeObserver ??= class {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
} as any

const isShown = (element: Element | undefined) =>
  !!element && (element as HTMLElement).style.display !== 'none'

const focusedName = () => document.activeElement?.getAttribute('name')

describe('PrimeVue preset: tabs and collapsibles', () => {
  beforeEach(() => {
    setGlobalConfig(DEFAULT_CONFIG)
    useDefaultPreset()
    usePrimeVuePreset()
    Element.prototype.scrollIntoView = () => {}
  })

  afterEach(() => {
    document.body.innerHTML = ''
    delete (Element.prototype as any).scrollIntoView
  })

  it("draws the tabs with PrimeVue's, every panel drawn and one shown", async () => {
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
    expect(wrapper.find('[name="vat"]').exists()).toBe(true)
  })

  it('opens the tab holding the first field with errors, counting them in a Badge', async () => {
    const wrapper = mountForm()
    await flushPromises()

    // @ts-expect-error vm is a form
    expect(await wrapper.vm.submit()).toBe(false)
    await flushPromises()

    const [, billing] = wrapper.findAll('[role="tab"]')
    expect(billing.attributes('aria-selected')).toBe('true')
    expect(isShown(wrapper.findAll('[role="tabpanel"]')[1].element)).toBe(true)
    expect(focusedName()).toBe('iban')
    const badge = billing.find('.p-badge')
    expect(badge.classes()).toContain('p-badge-danger')
    expect(badge.find('[aria-hidden="true"]').text()).toBe('2')
    expect(badge.text()).toContain('2 errors')
  })

  it('opens the tab, then the Panel, holding the first field with errors', async () => {
    const wrapper = mountForm(schema, { name: 'Ana', iban: 'RO49', vat: '' })
    await flushPromises()
    const content = () => wrapper.find('.primevue-collapsible [role="region"]')
    expect(isShown(content().element)).toBe(false)

    // @ts-expect-error vm is a form
    await wrapper.vm.submit()
    await flushPromises()

    expect(isShown(content().element)).toBe(true)
    expect(focusedName()).toBe('vat')
  })

  it("opens and closes the collapsible with Panel's button, named by its title, its description in the header", async () => {
    const wrapper = mountForm()
    await flushPromises()
    const toggle = wrapper.find('.primevue-collapsible button[aria-expanded]')

    expect(toggle.attributes('aria-label')).toBe('Extra')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('.primevue-collapsible').text()).toContain(
      'Optional details'
    )

    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('.primevue-collapsible').attributes('data-state')).toBe(
      'open'
    )
  })

  it('lays vertical tabs in a column beside the panels, moved between with up and down', async () => {
    const wrapper = mountForm({
      ...schema,
      account: { ...schema.account, props: { orientation: 'vertical' } },
    })
    await flushPromises()
    const list = wrapper.find('[role="tablist"]')
    const tabs = wrapper.findAll('[role="tab"]')

    expect(list.attributes('aria-orientation')).toBe('vertical')
    expect((list.element as HTMLElement).style.flexDirection).toBe('column')
    ;(tabs[0].element as HTMLElement).focus()
    await list.trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(tabs[1].element)
    await list.trigger('keydown', { key: 'ArrowUp' })
    expect(document.activeElement).toBe(tabs[0].element)
  })
})
