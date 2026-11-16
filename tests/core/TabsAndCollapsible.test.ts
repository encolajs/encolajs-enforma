// Enforma's own tabs and collapsible sections (`component: 'tabs'`, `component: 'collapsible'`):
// they keep every panel drawn, count each panel's errors and open as a refused submit goes to
// a field inside them.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, reactive, ref } from 'vue'
import Enforma from '@/core/Enforma.vue'
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

const focusedName = () =>
  document.activeElement?.getAttribute('name') ?? undefined

/** A form with its schema, in the page, and a ref to it */
function mountForm(schema: Record<string, any>, data: Record<string, any>) {
  const form = ref<FormController | null>(null)
  const values = reactive(data)
  const wrapper = mount(
    defineComponent({
      setup: () => () => h(Enforma, { ref: form, data: values, schema }),
    }),
    { attachTo: document.body }
  )
  return { wrapper, form, values }
}

const isShown = (element: Element | null | undefined) =>
  !!element && (element as HTMLElement).style.display !== 'none'

describe('tabs', () => {
  const schema = {
    account: { type: 'section', component: 'tabs' },
    intro: { section: 'account', inputComponent: 'input' },
    profile: {
      type: 'section',
      section: 'account',
      title: 'Profile',
      description: 'Who you are',
    },
    name: { section: 'profile', inputComponent: 'input', rules: 'required' },
    billing: { type: 'section', section: 'account' },
    iban: { section: 'billing', inputComponent: 'input', rules: 'required' },
    vat: { section: 'billing', inputComponent: 'input', rules: 'required' },
  }

  const tabs = (wrapper: any) => wrapper.findAll('[role="tab"]')
  const panels = (wrapper: any) => wrapper.findAll('[role="tabpanel"]')

  it('draws a tab for each sub-section, titled by its title or name, and every panel, showing the first', async () => {
    const { wrapper } = mountForm(schema, {
      intro: '',
      name: '',
      iban: '',
      vat: '',
    })
    await flushPromises()

    expect(tabs(wrapper).map((tab: any) => tab.text())).toEqual([
      'Profile',
      'billing',
    ])
    expect(tabs(wrapper)[0].attributes('aria-selected')).toBe('true')
    expect(tabs(wrapper)[1].attributes('tabindex')).toBe('-1')
    // Every panel's fields are drawn; the second panel is hidden
    expect(wrapper.find('[name="iban"]').exists()).toBe(true)
    expect(isShown(panels(wrapper)[0].element)).toBe(true)
    expect(isShown(panels(wrapper)[1].element)).toBe(false)
    expect(panels(wrapper)[0].attributes('aria-labelledby')).toBe(
      tabs(wrapper)[0].attributes('id')
    )
    // The title is the tab's; the panel starts with the description
    expect(panels(wrapper)[0].text()).not.toContain('Profile')
    expect(panels(wrapper)[0].find('p').text()).toBe('Who you are')
  })

  it("draws the tabs section's own fields above the tabs", async () => {
    const { wrapper } = mountForm(schema, {
      intro: '',
      name: '',
      iban: '',
      vat: '',
    })
    await flushPromises()

    const html = wrapper.html()
    expect(html.indexOf('name="intro"')).toBeLessThan(
      html.indexOf('role="tablist"')
    )
    expect(wrapper.find('[role="tablist"] [name="intro"]').exists()).toBe(false)
  })

  it('opens the tab props.active names, and the one clicked', async () => {
    const { wrapper } = mountForm(
      {
        ...schema,
        account: { ...schema.account, props: { active: 'billing' } },
      },
      { intro: '', name: '', iban: '', vat: '' }
    )
    await flushPromises()
    expect(isShown(panels(wrapper)[1].element)).toBe(true)

    await tabs(wrapper)[0].trigger('click')
    expect(isShown(panels(wrapper)[0].element)).toBe(true)
    expect(isShown(panels(wrapper)[1].element)).toBe(false)
  })

  it('opens the tab holding the first field with errors, and counts the errors of each tab', async () => {
    const { wrapper, form } = mountForm(schema, {
      intro: '',
      name: 'Ana',
      iban: '',
      vat: '',
    })
    await flushPromises()

    expect(await form.value!.submit()).toBe(false)
    await flushPromises()

    expect(isShown(panels(wrapper)[1].element)).toBe(true)
    expect(tabs(wrapper)[1].attributes('aria-selected')).toBe('true')
    expect(focusedName()).toBe('iban')
    // The count, which screen readers hear as words
    expect(tabs(wrapper)[0].find('.enforma-error-badge').exists()).toBe(false)
    const badge = tabs(wrapper)[1].find('.enforma-error-badge')
    expect(badge.find('[aria-hidden="true"]').text()).toBe('2')
    expect(badge.text()).toContain('2 errors')
  })

  it('moves between tabs with the arrow keys, Home and End', async () => {
    const { wrapper } = mountForm(
      {
        ...schema,
        extra: { type: 'section', section: 'account', title: 'Extra' },
        note: { section: 'extra', inputComponent: 'input' },
      },
      { intro: '', name: '', iban: '', vat: '', note: '' }
    )
    await flushPromises()
    const list = wrapper.find('[role="tablist"]')
    const selected = () =>
      tabs(wrapper).findIndex(
        (tab: any) => tab.attributes('aria-selected') === 'true'
      )

    expect(list.attributes('aria-orientation')).toBe('horizontal')
    await list.trigger('keydown', { key: 'ArrowRight' })
    expect(selected()).toBe(1)
    expect(document.activeElement).toBe(tabs(wrapper)[1].element)
    await list.trigger('keydown', { key: 'End' })
    expect(selected()).toBe(2)
    await list.trigger('keydown', { key: 'ArrowRight' })
    expect(selected()).toBe(0)
    await list.trigger('keydown', { key: 'ArrowLeft' })
    expect(selected()).toBe(2)
    await list.trigger('keydown', { key: 'Home' })
    expect(selected()).toBe(0)
    // Up and down belong to vertical tabs
    await list.trigger('keydown', { key: 'ArrowDown' })
    expect(selected()).toBe(0)
  })

  it('lays the tabs out vertically, moving with up and down', async () => {
    const { wrapper } = mountForm(
      {
        ...schema,
        account: { ...schema.account, props: { orientation: 'vertical' } },
      },
      { intro: '', name: '', iban: '', vat: '' }
    )
    await flushPromises()
    const list = wrapper.find('[role="tablist"]')

    expect(list.attributes('aria-orientation')).toBe('vertical')
    expect(wrapper.find('.enforma-tabs').attributes('data-orientation')).toBe(
      'vertical'
    )
    await list.trigger('keydown', { key: 'ArrowDown' })
    expect(tabs(wrapper)[1].attributes('aria-selected')).toBe('true')
    await list.trigger('keydown', { key: 'ArrowUp' })
    expect(tabs(wrapper)[0].attributes('aria-selected')).toBe('true')
  })

  it('leaves out a sub-section hidden by its if, opening the first tab when the open one hides', async () => {
    const { wrapper, values } = mountForm(
      {
        ...schema,
        billing: { ...schema.billing, if: '${!form.values().free}' },
        account: { ...schema.account, props: { active: 'billing' } },
      },
      { intro: '', name: '', iban: '', vat: '', free: false }
    )
    await flushPromises()
    expect(tabs(wrapper)).toHaveLength(2)
    expect(tabs(wrapper)[1].attributes('aria-selected')).toBe('true')

    values.free = true
    await flushPromises()
    expect(tabs(wrapper).map((tab: any) => tab.text())).toEqual(['Profile'])
    expect(tabs(wrapper)[0].attributes('aria-selected')).toBe('true')

    // The first stays open when the hidden one is back
    values.free = false
    await flushPromises()
    expect(tabs(wrapper)[0].attributes('aria-selected')).toBe('true')
  })

  it('draws no tabs without sub-sections shown, but its own fields', async () => {
    const { wrapper } = mountForm(
      {
        account: { type: 'section', component: 'tabs' },
        intro: { section: 'account', inputComponent: 'input' },
        hidden: { type: 'section', section: 'account', if: false },
      },
      { intro: '' }
    )
    await flushPromises()

    expect(wrapper.find('[role="tablist"]').exists()).toBe(false)
    expect(wrapper.find('[name="intro"]').exists()).toBe(true)
  })
})

describe('collapsible', () => {
  const schema = {
    extra: {
      type: 'section',
      component: 'collapsible',
      title: 'Extra',
      description: 'Optional details',
    },
    nickname: { section: 'extra', inputComponent: 'input', rules: 'required' },
  }

  const toggle = (wrapper: any) => wrapper.find('.enforma-collapsible-toggle')
  const body = (wrapper: any) => wrapper.find('.enforma-collapsible-body')

  it('starts open, and opens and closes with its title, its body drawn while closed', async () => {
    const { wrapper } = mountForm(schema, { nickname: '' })
    await flushPromises()

    expect(toggle(wrapper).attributes('aria-expanded')).toBe('true')
    expect(isShown(body(wrapper).element)).toBe(true)
    expect(toggle(wrapper).attributes('aria-controls')).toBe(
      body(wrapper).attributes('id')
    )

    await toggle(wrapper).trigger('click')
    expect(toggle(wrapper).attributes('aria-expanded')).toBe('false')
    expect(isShown(body(wrapper).element)).toBe(false)
    expect(wrapper.find('[name="nickname"]').exists()).toBe(true)
    expect(wrapper.find('.enforma-collapsible').attributes('data-state')).toBe(
      'closed'
    )
  })

  it('shows its description under the title, outside the body', async () => {
    const { wrapper } = mountForm(schema, { nickname: '' })
    await flushPromises()

    expect(wrapper.find('.enforma-collapsible-header').text()).toContain(
      'Optional details'
    )
    expect(body(wrapper).text()).not.toContain('Optional details')
  })

  it('starts closed when props.open is false, titled by its name without a title', async () => {
    const { wrapper } = mountForm(
      {
        extra: {
          type: 'section',
          component: 'collapsible',
          props: { open: false },
        },
        nickname: { section: 'extra', inputComponent: 'input' },
      },
      { nickname: '' }
    )
    await flushPromises()

    expect(toggle(wrapper).attributes('aria-expanded')).toBe('false')
    expect(isShown(body(wrapper).element)).toBe(false)
    expect(toggle(wrapper).text()).toBe('extra')
  })

  it('opens as a refused submit goes to a field inside it, counting its errors', async () => {
    const { wrapper, form } = mountForm(
      { ...schema, extra: { ...schema.extra, props: { open: false } } },
      { nickname: '' }
    )
    await flushPromises()

    expect(await form.value!.submit()).toBe(false)
    await flushPromises()

    expect(isShown(body(wrapper).element)).toBe(true)
    expect(focusedName()).toBe('nickname')
    expect(toggle(wrapper).find('.enforma-error-badge').text()).toContain(
      '1 error'
    )
  })

  it('inside a closed tab, opens the tab, then itself', async () => {
    const { wrapper, form } = mountForm(
      {
        account: { type: 'section', component: 'tabs' },
        main: { type: 'section', section: 'account', title: 'Main' },
        name: { section: 'main', inputComponent: 'input' },
        more: { type: 'section', section: 'account', title: 'More' },
        extra: {
          type: 'section',
          section: 'more',
          component: 'collapsible',
          title: 'Extra',
          props: { open: false },
        },
        nickname: {
          section: 'extra',
          inputComponent: 'input',
          rules: 'required',
        },
      },
      { name: '', nickname: '' }
    )
    await flushPromises()

    await form.value!.submit()
    await flushPromises()

    const [, more] = wrapper.findAll('[role="tabpanel"]')
    expect(isShown(more.element)).toBe(true)
    expect(isShown(body(wrapper).element)).toBe(true)
    expect(focusedName()).toBe('nickname')
    // The tab counts the errors of the collapsible inside it
    const [, moreTab] = wrapper.findAll('[role="tab"]')
    expect(moreTab.find('[aria-hidden="true"]').text()).toBe('1')
  })
})
