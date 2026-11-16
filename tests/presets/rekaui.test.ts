// The Reka UI preset draws tabs and collapsible sections with Reka UI's tabs and collapsible:
// every panel stays drawn (unmount-on-hide off), each counts its errors, and a refused submit
// opens the one holding the first field with errors.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Enforma from '@/core/Enforma.vue'
import { DEFAULT_CONFIG } from '@/constants/defaults'
import { setGlobalConfig } from '@/utils/useConfig'
import useDefaultPreset from '@/presets/default'
import useRekauiPreset from '@/presets/rekaui'

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
    attachTo: document.body,
  })
}

const focusedName = () => document.activeElement?.getAttribute('name')

describe('Reka UI preset: tabs and collapsibles', () => {
  beforeEach(() => {
    setGlobalConfig(DEFAULT_CONFIG)
    useDefaultPreset()
    useRekauiPreset()
    Element.prototype.scrollIntoView = () => {}
  })

  afterEach(() => {
    document.body.innerHTML = ''
    delete (Element.prototype as any).scrollIntoView
  })

  it("draws the tabs with Reka UI's, every panel drawn and the others hidden", async () => {
    const wrapper = mountForm()
    await flushPromises()

    expect(wrapper.findAll('[role="tab"]').map((tab) => tab.text())).toEqual([
      'Profile',
      'Billing',
    ])
    const panels = wrapper.findAll('[role="tabpanel"]')
    expect(panels).toHaveLength(2)
    expect(panels[0].attributes('hidden')).toBeUndefined()
    expect(panels[1].attributes('hidden')).toBeDefined()
    expect(wrapper.find('[name="vat"]').exists()).toBe(true)
  })

  it('opens the tab holding the first field with errors, counting them in a badge', async () => {
    const wrapper = mountForm()
    await flushPromises()

    // @ts-expect-error vm is a form
    expect(await wrapper.vm.submit()).toBe(false)
    await flushPromises()

    const [, billing] = wrapper.findAll('[role="tab"]')
    expect(billing.attributes('aria-selected')).toBe('true')
    expect(
      wrapper.findAll('[role="tabpanel"]')[1].attributes('hidden')
    ).toBeUndefined()
    // Reka UI shows the tab's content some ticks after it opens: the form waits for it
    await vi.waitFor(() => expect(focusedName()).toBe('iban'))
    const badge = billing.find('.rekaui-error-badge')
    expect(badge.find('[aria-hidden="true"]').text()).toBe('2')
    expect(badge.text()).toContain('2 errors')
  })

  it('opens the tab, then the collapsible, holding the first field with errors', async () => {
    const wrapper = mountForm(schema, { name: 'Ana', iban: 'RO49', vat: '' })
    await flushPromises()
    const content = () => wrapper.find('.rekaui-collapsible-body')
    expect(content().attributes('hidden')).toBeDefined()

    // @ts-expect-error vm is a form
    await wrapper.vm.submit()
    await flushPromises()

    expect(content().attributes('hidden')).toBeUndefined()
    // Reka UI shows the tab's content some ticks after it opens: the form waits for it
    await vi.waitFor(() => expect(focusedName()).toBe('vat'))
  })

  it('opens and closes the collapsible with its title, its description outside the trigger', async () => {
    const wrapper = mountForm()
    await flushPromises()
    const trigger = wrapper.find('.rekaui-collapsible-toggle')

    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.text()).not.toContain('Optional details')
    expect(wrapper.find('.rekaui-collapsible-header').text()).toContain(
      'Optional details'
    )

    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    // Reka UI gives the trigger its content's id as it draws again
    expect(trigger.attributes('aria-controls')).toBe(
      wrapper.find('.rekaui-collapsible-body').attributes('id')
    )
  })

  it('lays vertical tabs beside their panels, moved between with up and down', async () => {
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
    await tabs[0].trigger('keydown', { key: 'ArrowDown' })
    await flushPromises()
    expect(document.activeElement).toBe(tabs[1].element)
    expect(tabs[1].attributes('aria-selected')).toBe('true')
  })
})
