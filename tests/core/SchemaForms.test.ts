// What Enforma 1.6 changes for schema forms: each form's events are its own, a form's config
// reaches its fields without EnformaPlugin, expressions are interpreted (never compiled into
// code) and can be limited to `if`, and a host's own controller renders through
// provideEnformaForm().
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import Enforma from '@/core/Enforma.vue'
import EnformaSchema from '@/core/EnformaSchema.vue'
import { useEnformaField } from '@/core/useEnformaField'
import { provideEnformaForm } from '@/core/provideEnformaForm'
import { useForm } from '@/headless/useForm'
import { createEncolaValidator } from '@/validators/encolaValidator'
import { DEFAULT_CONFIG } from '@/constants/defaults'
import { setGlobalConfig } from '@/utils/useConfig'
import { globalFormEmitter } from '@/utils/events'
import { evaluateCondition } from '@/utils/evaluateCondition'
import { evaluateSchema } from '@/utils/evaluateSchema'
import { deepMerge } from '@/utils/configUtils'
import type { FormController } from '@/types'

/** A field component of one's own: its label, its input, its error, marked with `kind`. */
const fieldComponent = (kind: string) =>
  defineComponent({
    props: {
      name: { type: String, required: true },
      label: { type: String, default: null },
    },
    setup(props) {
      const { fieldController, props: field } = useEnformaField(props as any)
      return () =>
        h('div', { class: `field-${kind}` }, [
          h('label', { for: props.name }, field.value.label ?? ''),
          h('input', {
            id: props.name,
            value: fieldController.value.value ?? '',
            onInput: (event: Event) =>
              fieldController.value.events.input?.(event),
          }),
          fieldController.value.error
            ? h('p', { class: 'error' }, fieldController.value.error)
            : null,
        ])
    },
  })

const FieldA = fieldComponent('a')
const FieldB = fieldComponent('b')

/** All the handlers on the emitter every form used to share. */
const sharedHandlerCount = () =>
  [...globalFormEmitter.all.values()].reduce(
    (count, handlers) => count + (handlers?.length ?? 0),
    0
  )

describe('Enforma 1.6: schema forms', () => {
  beforeEach(() => {
    // No EnformaPlugin, no preset: Enforma's defaults only
    setGlobalConfig(DEFAULT_CONFIG)
  })

  describe("a form's events are its own", () => {
    const twoForms = () =>
      mount(
        defineComponent({
          setup() {
            const schema = { name: { label: 'Name' } }
            return () => [
              h(Enforma, {
                data: { name: 'first' },
                schema,
                submitHandler: () => Promise.resolve(),
                config: { components: { field: FieldA } },
              }),
              h(Enforma, {
                data: { name: 'second' },
                schema,
                submitHandler: () => Promise.resolve(),
                config: { components: { field: FieldA } },
              }),
            ]
          },
        })
      )

    it("submitting one form emits nothing on another form's listeners", async () => {
      const wrapper = twoForms()
      await flushPromises()
      const [first, second] = wrapper.findAllComponents(Enforma)

      await wrapper.findAll('form')[0]!.trigger('submit')
      await flushPromises()

      expect(first!.emitted('submit_success')).toHaveLength(1)
      expect(second!.emitted('submit_success')).toBeUndefined()
    })

    it('a field changing in one form emits field_changed on that form only', async () => {
      const wrapper = twoForms()
      await flushPromises()
      const [first, second] = wrapper.findAllComponents(Enforma)

      await wrapper.findAll('input')[1]!.setValue('changed')
      await flushPromises()

      expect(first!.emitted('field_changed')).toBeUndefined()
      expect(second!.emitted('field_changed')).toHaveLength(1)
    })

    it('a form registers nothing on the emitter every form used to share', async () => {
      const before = sharedHandlerCount()
      const form = mount(Enforma, {
        props: { data: {}, submitHandler: () => Promise.resolve() },
      })
      await flushPromises()
      expect(sharedHandlerCount()).toBe(before)
      form.unmount()
      expect(sharedHandlerCount()).toBe(before)
    })
  })

  describe("a form's config reaches its fields", () => {
    it('two forms side by side, each with its own field component, without EnformaPlugin', async () => {
      const wrapper = mount(
        defineComponent({
          setup() {
            const schema = { name: { label: 'Name' } }
            return () => [
              h(Enforma, {
                data: {},
                schema,
                config: { components: { field: FieldA } },
              }),
              h(Enforma, {
                data: {},
                schema,
                config: { components: { field: FieldB } },
              }),
            ]
          },
        })
      )
      await flushPromises()
      const [first, second] = wrapper.findAll('form')

      expect(first!.find('.field-a label').text()).toBe('Name')
      expect(first!.find('.field-b').exists()).toBe(false)
      expect(second!.find('.field-b label').text()).toBe('Name')
      expect(second!.find('.field-a').exists()).toBe(false)
    })

    it("a form without a field component in its config draws Enforma's own field", async () => {
      const wrapper = mount(Enforma, {
        props: {
          data: {},
          schema: { name: { label: 'Name' } },
          showSubmitButton: false,
        },
      })
      await flushPromises()

      expect(wrapper.find('label').text()).toContain('Name')
      expect(wrapper.find('input[name="name"]').exists()).toBe(true)
    })

    it('a component given in a config is kept as it is, never merged with another', () => {
      const merged = deepMerge(
        { components: { field: FieldA, section: null } },
        { components: { field: FieldB } }
      )
      expect(merged.components.field).toBe(FieldB)
      expect(merged.components.section).toBeNull()
    })
  })

  describe('schema and context are reactive', () => {
    it('a changed label or `if` updates the form, and the other fields keep their values', async () => {
      const schema = ref<Record<string, any>>({
        name: { label: 'Name' },
        city: { label: 'City', if: true },
      })
      const wrapper = mount(
        defineComponent({
          setup() {
            return () =>
              h(Enforma, {
                data: { name: '', city: '' },
                schema: schema.value,
                config: { components: { field: FieldA } },
                showSubmitButton: false,
              })
          },
        })
      )
      await flushPromises()
      await wrapper.find('#name').setValue('Ana')

      schema.value = {
        name: { label: 'Full name' },
        city: { label: 'City', if: false },
      }
      await flushPromises()

      expect(wrapper.find('label[for="name"]').text()).toBe('Full name')
      expect(wrapper.find('#city').exists()).toBe(false)
      expect((wrapper.find('#name').element as HTMLInputElement).value).toBe(
        'Ana'
      )
    })
  })

  describe('expressions', () => {
    let controller: FormController

    beforeEach(() => {
      controller = useForm({
        country: 'CH',
        tags: ['new'],
        address: { city: 'Bern' },
      })
    })

    it('are read in the expression language, with in, and, ?? and method calls on the form', () => {
      const config = DEFAULT_CONFIG
      expect(
        evaluateCondition(
          "${form.country in ['CH', 'GB']}",
          controller,
          {},
          config
        )
      ).toBe(true)
      expect(
        evaluateCondition(
          "${form.country == 'CH' and form.address.city == 'Bern'}",
          controller,
          {},
          config
        )
      ).toBe(true)
      expect(
        evaluateCondition("${form.missing ?? 'none'}", controller, {}, config)
      ).toBe('none')
      expect(
        evaluateCondition(
          "${form.getFieldValue('address.city')}",
          controller,
          {},
          config
        )
      ).toBe('Bern')
    })

    it('never compile a string into code', () => {
      const realFunction = globalThis.Function
      const realEval = globalThis.eval
      const compile = vi.fn(() => {
        throw new EvalError('blocked by the Content Security Policy')
      })
      globalThis.Function = compile as any
      globalThis.eval = compile as any
      try {
        expect(
          evaluateCondition(
            "${form.country in ['CH', 'GB']}",
            controller,
            {},
            DEFAULT_CONFIG
          )
        ).toBe(true)
      } finally {
        globalThis.Function = realFunction
        globalThis.eval = realEval
      }
      expect(compile).not.toHaveBeenCalled()
    })

    it('read the form without registering its fields, and can change nothing in it', () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {})
      try {
        evaluateCondition(
          "${form.country == 'CH'}",
          controller,
          {},
          DEFAULT_CONFIG
        )
        evaluateCondition(
          "${form.tags.push('changed')}",
          controller,
          {},
          DEFAULT_CONFIG
        )
        evaluateCondition('${form.reset()}', controller, {}, DEFAULT_CONFIG)
      } finally {
        error.mockRestore()
      }

      expect(controller.hasField('country')).toBe(false)
      expect(controller.hasField('tags')).toBe(false)
      expect(controller.values()).toEqual({
        country: 'CH',
        tags: ['new'],
        address: { city: 'Bern' },
      })
    })

    it('name only form, context and config', () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {})
      try {
        expect(
          evaluateCondition(
            '${window.location}',
            controller,
            {},
            DEFAULT_CONFIG
          )
        ).toBeUndefined()
        expect(
          evaluateCondition(
            "${constant('globalThis')}",
            controller,
            {},
            DEFAULT_CONFIG
          )
        ).toBeUndefined()
      } finally {
        error.mockRestore()
      }
    })

    it('limited to `if` with expressions.only, leave every other prop as text', () => {
      const config = {
        ...DEFAULT_CONFIG,
        expressions: { ...DEFAULT_CONFIG.expressions, only: ['if'] },
      }
      const props = { label: '${form.country}', if: "${form.country == 'CH'}" }

      expect(evaluateSchema(props, controller, {}, config)).toEqual({
        label: '${form.country}',
        if: true,
      })
      expect(
        evaluateCondition("${form.country == 'CH'}", controller, {}, config)
      ).toBe(true)

      const noIf = {
        ...config,
        expressions: { ...config.expressions, only: ['label'] },
      }
      expect(
        evaluateCondition("${form.country == 'CH'}", controller, {}, noIf)
      ).toBe("${form.country == 'CH'}")
    })
  })

  describe('provideEnformaForm()', () => {
    const host = (schema: ReturnType<typeof ref<Record<string, any>>>) => {
      let controller!: FormController
      const wrapper = mount(
        defineComponent({
          setup() {
            controller = useForm(
              { name: '', city: '' },
              createEncolaValidator({ name: 'required', city: 'required' })
            )
            provideEnformaForm({
              controller,
              schema: () => schema.value,
              config: {
                components: { field: FieldA },
                expressions: { only: ['if'] },
              },
            })
            return () => h(EnformaSchema, { schema: schema.value })
          },
        })
      )
      return { wrapper, controller: () => controller }
    }

    afterEach(() => vi.restoreAllMocks())

    it("renders the schema under the host's controller, which the fields write to", async () => {
      const schema = ref<Record<string, any>>({
        name: { label: 'Name' },
        city: { label: 'City' },
      })
      const { wrapper, controller } = host(schema)
      await flushPromises()

      await wrapper.find('#name').setValue('Ana')
      await flushPromises()

      expect(
        wrapper.findAll('.field-a label').map((label) => label.text())
      ).toEqual(['Name', 'City'])
      expect(controller().getFieldValue('name')).toBe('Ana')
    })

    it('checks only the fields it renders, and a field that goes is no longer checked', async () => {
      const schema = ref<Record<string, any>>({
        name: { label: 'Name' },
        city: { label: 'City', if: "${form.name != 'Ana'}" },
      })
      const { wrapper, controller } = host(schema)
      await flushPromises()
      expect(controller().hasField('city')).toBe(true)

      await wrapper.find('#name').setValue('Ana')
      await flushPromises()

      expect(wrapper.find('#city').exists()).toBe(false)
      expect(controller().hasField('city')).toBe(false)
      expect(await controller().validate()).toBe(true)
    })

    it('keeps a label holding ${…} as text, with expressions limited to `if`', async () => {
      const schema = ref<Record<string, any>>({
        name: { label: '${form.city}' },
      })
      const { wrapper } = host(schema)
      await flushPromises()

      expect(wrapper.find('label').text()).toBe('${form.city}')
    })

    it('follows a changed schema without losing what the user typed', async () => {
      const schema = ref<Record<string, any>>({ name: { label: 'Name' } })
      const { wrapper } = host(schema)
      await flushPromises()
      await wrapper.find('#name').setValue('Ana')

      schema.value = { name: { label: 'Full name' } }
      await nextTick()

      expect(wrapper.find('label').text()).toBe('Full name')
      expect((wrapper.find('#name').element as HTMLInputElement).value).toBe(
        'Ana'
      )
    })
  })
})
