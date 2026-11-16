import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import Enforma from '@/core/Enforma.vue'
import { DEFAULT_CONFIG } from '@/constants/defaults'
import { setGlobalConfig } from '@/utils/useConfig'
import useDefaultPreset from '@/presets/default'
import useNuxtUIPreset from '@/presets/nuxtui'

// Stand-in for Nuxt UI's UInput: only the props the preset sets on error
const StubInput = defineComponent({
  name: 'StubInput',
  props: {
    modelValue: { type: null, default: null },
    highlight: { type: Boolean, default: false },
    color: { type: String, default: '' },
  },
  setup(props) {
    return () =>
      h('input', {
        'data-highlight': String(props.highlight),
        'data-color': props.color,
      })
  },
})

describe('Nuxt UI preset', () => {
  beforeEach(() => {
    setGlobalConfig(DEFAULT_CONFIG)
    useDefaultPreset()
    useNuxtUIPreset({ input: StubInput })
  })

  it('puts inputs with validation errors in the error state', async () => {
    const wrapper = mount(Enforma, {
      props: {
        data: { name: '' },
        schema: { name: { type: 'field', label: 'Name', rules: 'required' } },
        submitHandler: () => Promise.resolve(true),
      },
    })
    await flushPromises()

    const input = (): ReturnType<typeof wrapper.find> => wrapper.find('input')
    expect(input().attributes('data-highlight')).toBe('false')
    expect(input().attributes('data-color')).toBe('')

    // @ts-expect-error vm is a form
    await wrapper.vm.submit()
    await flushPromises()

    expect(input().attributes('data-highlight')).toBe('true')
    expect(input().attributes('data-color')).toBe('error')
  })

  it('clears the error state once the error is fixed', async () => {
    const wrapper = mount(Enforma, {
      props: {
        data: { name: '' },
        schema: {
          name: {
            type: 'field',
            label: 'Name',
            rules: 'required',
            inputProps: { class: 'w-full' },
          },
        },
        submitHandler: () => Promise.resolve(true),
      },
    })
    await flushPromises()

    const input = (): ReturnType<typeof wrapper.find> => wrapper.find('input')

    // @ts-expect-error vm is a form
    await wrapper.vm.submit()
    await flushPromises()
    expect(input().attributes('data-highlight')).toBe('true')
    expect(input().attributes('data-color')).toBe('error')

    // @ts-expect-error vm is a form
    await wrapper.vm.setFieldValue('name', 'John')
    await flushPromises()
    expect(input().attributes('data-highlight')).toBe('false')
    expect(input().attributes('data-color')).toBe('')
  })

  it('passes disabled and placeholder from inputProps to the input', async () => {
    const wrapper = mount(Enforma, {
      props: {
        data: { name: '' },
        schema: {
          name: {
            type: 'field',
            label: 'Name',
            inputProps: { disabled: true, placeholder: 'Your name' },
          },
        },
        submitHandler: () => Promise.resolve(true),
      },
    })
    await flushPromises()

    const input = wrapper.find('input')
    expect(input.attributes('disabled')).toBeDefined()
    expect(input.attributes('placeholder')).toBe('Your name')
  })
})

// Stand-ins for Nuxt UI's UTabs, UCollapsible, UButton and UBadge: the props, events and slots
// the preset uses. Like Nuxt UI's, a hidden panel is drawn with `hidden` when unmountOnHide is
// off, and not drawn otherwise
const StubTabs = defineComponent({
  name: 'StubTabs',
  props: {
    items: { type: Array as () => any[], default: () => [] },
    modelValue: { type: String, default: undefined },
    orientation: { type: String, default: 'horizontal' },
    unmountOnHide: { type: Boolean, default: true },
  },
  emits: ['update:modelValue'],
  setup(props, { emit, slots }) {
    return () =>
      h('div', { 'data-orientation': props.orientation }, [
        h(
          'div',
          { role: 'tablist' },
          props.items.map((item) =>
            h(
              'button',
              {
                role: 'tab',
                'aria-selected': String(item.value === props.modelValue),
                onClick: () => emit('update:modelValue', item.value),
              },
              [item.label, slots.trailing?.({ item })]
            )
          )
        ),
        ...props.items.flatMap((item) => {
          const shown = item.value === props.modelValue
          if (!shown && props.unmountOnHide) return []
          return [
            h(
              'div',
              { role: 'tabpanel', hidden: shown ? undefined : '' },
              slots.content?.({ item })
            ),
          ]
        }),
      ])
  },
})

const StubCollapsible = defineComponent({
  name: 'StubCollapsible',
  props: {
    open: { type: Boolean, default: false },
    unmountOnHide: { type: Boolean, default: true },
  },
  emits: ['update:open'],
  setup(props, { slots }) {
    return () =>
      h('div', { class: 'stub-collapsible' }, [
        !props.open && props.unmountOnHide
          ? null
          : h(
              'div',
              { 'data-content': '', hidden: props.open ? undefined : '' },
              slots.content?.()
            ),
      ])
  },
})

const StubButton = defineComponent({
  name: 'StubButton',
  inheritAttrs: false,
  props: {
    color: String,
    variant: String,
    trailingIcon: String,
    block: Boolean,
  },
  setup(_, { attrs, slots }) {
    return () =>
      h('button', { ...attrs, 'data-ubutton': '' }, slots.default?.())
  },
})

const StubBadge = defineComponent({
  name: 'StubBadge',
  props: { color: String, variant: String, size: String },
  setup(props, { slots }) {
    return () =>
      h(
        'span',
        { 'data-ubadge': '', 'data-color': props.color },
        slots.default?.()
      )
  },
})

describe('Nuxt UI preset: tabs and collapsibles', () => {
  beforeEach(() => {
    setGlobalConfig(DEFAULT_CONFIG)
    useDefaultPreset()
    useNuxtUIPreset({
      input: StubInput,
      button: StubButton,
      tabs: StubTabs,
      collapsible: StubCollapsible,
      badge: StubBadge,
    })
    Element.prototype.scrollIntoView = () => {}
  })

  afterEach(() => {
    document.body.innerHTML = ''
    delete (Element.prototype as any).scrollIntoView
  })

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

  it('draws the tabs with UTabs, keeping every panel drawn', async () => {
    const wrapper = mountForm({
      ...schema,
      account: { ...schema.account, props: { orientation: 'vertical' } },
    })
    await flushPromises()

    const tabs = wrapper.findComponent(StubTabs)
    expect(tabs.props('unmountOnHide')).toBe(false)
    expect(tabs.props('orientation')).toBe('vertical')
    expect(wrapper.findAll('[role="tab"]').map((tab) => tab.text())).toEqual([
      'Profile',
      'Billing',
    ])
    expect(wrapper.findAll('[role="tabpanel"]')).toHaveLength(2)
    expect(wrapper.find('[name="iban"]').exists()).toBe(true)
  })

  it('opens the tab holding the first field with errors, counting them in a UBadge', async () => {
    const wrapper = mountForm()
    await flushPromises()

    // @ts-expect-error vm is a form
    expect(await wrapper.vm.submit()).toBe(false)
    await flushPromises()

    const [, billing] = wrapper.findAll('[role="tab"]')
    expect(billing.attributes('aria-selected')).toBe('true')
    expect(document.activeElement?.getAttribute('name')).toBe('iban')
    // The collapsible's field counts in its tab too
    const badge = billing.find('[data-ubadge]')
    expect(badge.attributes('data-color')).toBe('error')
    expect(badge.find('[aria-hidden="true"]').text()).toBe('2')
    expect(badge.text()).toContain('2 errors')
  })

  it('opens the tab, then the collapsible, holding the first field with errors', async () => {
    const wrapper = mountForm(schema, { name: 'Ana', iban: 'RO49', vat: '' })
    await flushPromises()
    const collapsibleBody = () =>
      wrapper.find('.stub-collapsible [data-content]')
    expect(collapsibleBody().attributes('hidden')).toBeDefined()

    // @ts-expect-error vm is a form
    expect(await wrapper.vm.submit()).toBe(false)
    await flushPromises()

    const [, billing] = wrapper.findAll('[role="tab"]')
    expect(billing.attributes('aria-selected')).toBe('true')
    expect(collapsibleBody().attributes('hidden')).toBeUndefined()
    expect(document.activeElement?.getAttribute('name')).toBe('vat')
    expect(wrapper.find('[data-ubutton] [data-ubadge]').text()).toContain(
      '1 error'
    )
  })

  it('opens and closes the collapsible with a UButton, its description outside it', async () => {
    const wrapper = mountForm()
    await flushPromises()
    const toggle = wrapper.find('[data-ubutton]')

    expect(toggle.text()).toContain('Extra')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(toggle.text()).not.toContain('Optional details')
    expect(wrapper.find('.nuxtui-collapsible-header').text()).toContain(
      'Optional details'
    )

    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(
      wrapper.find('.stub-collapsible [data-content]').attributes('hidden')
    ).toBeUndefined()
  })

  it("keeps Enforma's own tabs and collapsible when the app gives no Nuxt UI ones", async () => {
    setGlobalConfig(DEFAULT_CONFIG)
    useDefaultPreset()
    useNuxtUIPreset({ input: StubInput })
    const wrapper = mountForm()
    await flushPromises()

    expect(wrapper.findComponent({ name: 'EnformaTabs' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'EnformaCollapsible' }).exists()).toBe(
      true
    )
    expect(wrapper.findComponent(StubTabs).exists()).toBe(false)
  })
})
