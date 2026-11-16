// The Vuetify preset draws tabs and collapsible sections with Vuetify's VTabs and expansion
// panels: every panel stays drawn (eager), each counts its errors in a VChip, and a refused
// submit opens the one holding the first field with errors.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import Enforma from '@/core/Enforma.vue'
import { DEFAULT_CONFIG } from '@/constants/defaults'
import { setGlobalConfig } from '@/utils/useConfig'
import useDefaultPreset from '@/presets/default'
import useVuetifyPreset from '@/presets/vuetify'

// jsdom has no ResizeObserver, which Vuetify's components use
globalThis.ResizeObserver ??= class {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
} as any

// Nor document.scrollingElement, where VWindow looks for the page's scroll as tabs change
if (!document.scrollingElement) {
  Object.defineProperty(document, 'scrollingElement', {
    configurable: true,
    get: () => document.documentElement,
  })
}

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
    global: { plugins: [createVuetify()] },
    attachTo: document.body,
  })
}

const isShown = (element: Element | undefined) =>
  !!element && (element as HTMLElement).style.display !== 'none'

const focusedName = () => document.activeElement?.getAttribute('name')

describe('Vuetify preset: tabs and collapsibles', () => {
  beforeEach(() => {
    setGlobalConfig(DEFAULT_CONFIG)
    useDefaultPreset()
    useVuetifyPreset()
    Element.prototype.scrollIntoView = () => {}
  })

  afterEach(() => {
    document.body.innerHTML = ''
    delete (Element.prototype as any).scrollIntoView
  })

  it("draws the tabs with Vuetify's, every panel's fields drawn from the start", async () => {
    const wrapper = mountForm()
    await flushPromises()

    expect(wrapper.findAll('[role="tab"]').map((tab) => tab.text())).toEqual([
      'Profile',
      'Billing',
    ])
    // The second tab's fields, and those of its closed collapsible
    expect(wrapper.find('[name="iban"]').exists()).toBe(true)
    expect(wrapper.find('[name="vat"]').exists()).toBe(true)
  })

  it('opens the tab holding the first field with errors, counting them in a VChip', async () => {
    const wrapper = mountForm()
    await flushPromises()

    // @ts-expect-error vm is a form
    expect(await wrapper.vm.submit()).toBe(false)
    await flushPromises()

    const [, billing] = wrapper.findAll('[role="tab"]')
    expect(billing.attributes('aria-selected')).toBe('true')
    expect(focusedName()).toBe('iban')
    const chip = billing.find('.v-chip')
    expect(chip.classes()).toContain('bg-error')
    expect(chip.find('[aria-hidden="true"]').text()).toBe('2')
    expect(chip.text()).toContain('2 errors')
  })

  it('opens the tab, then the expansion panel, holding the first field with errors', async () => {
    const wrapper = mountForm(schema, { name: 'Ana', iban: 'RO49', vat: '' })
    await flushPromises()
    const toggle = () => wrapper.find('.vuetify-collapsible button')
    expect(toggle().attributes('aria-expanded')).toBe('false')

    // @ts-expect-error vm is a form
    await wrapper.vm.submit()
    await flushPromises()

    expect(toggle().attributes('aria-expanded')).toBe('true')
    expect(
      isShown(
        wrapper.find('.vuetify-collapsible .v-expansion-panel-text').element
      )
    ).toBe(true)
    expect(focusedName()).toBe('vat')
  })

  it('opens and closes the collapsible with its title, which holds the description', async () => {
    const wrapper = mountForm()
    await flushPromises()
    const toggle = wrapper.find('.vuetify-collapsible button')

    expect(toggle.text()).toContain('Extra')
    expect(toggle.text()).toContain('Optional details')
    await toggle.trigger('click')
    await flushPromises()
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('.vuetify-collapsible').attributes('data-state')).toBe(
      'open'
    )
  })

  it('lays vertical tabs beside their panels', async () => {
    const wrapper = mountForm({
      ...schema,
      account: { ...schema.account, props: { orientation: 'vertical' } },
    })
    await flushPromises()

    expect(wrapper.find('.v-tabs').classes()).toContain('v-tabs--vertical')
    expect(wrapper.find('.v-tabs').element.parentElement!.className).toContain(
      'flex-row'
    )
  })
})
