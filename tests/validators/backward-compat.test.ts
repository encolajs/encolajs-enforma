import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createApp } from 'vue'
import { useForm } from '@/headless/useForm'
import HeadlessForm from '@/headless/HeadlessForm'
import { EnformaPlugin } from '@/EnformaPlugin'
import { createEncolaValidator } from '@/validators/encolaValidator'
import { mount } from '@vue/test-utils'

describe('Backward Compatibility', () => {
  let consoleWarnSpy: any

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
  })

  describe('useForm with rules API', () => {
    it('should work with old rules object API', async () => {
      const app = createApp({})
      app.use(EnformaPlugin)

      const formData = { email: 'test@example.com', name: 'John' }
      const form = useForm(formData, {
        email: 'required|email',
        name: 'required',
      })

      expect(form).toBeDefined()
      expect(form.values()).toEqual(formData)
    })

    it('should show deprecation warning for rules object', () => {
      const app = createApp({})
      app.use(EnformaPlugin)

      const formData = { email: '' }
      useForm(formData, { email: 'required' })

      expect(consoleWarnSpy).toHaveBeenCalled()
      expect(consoleWarnSpy.mock.calls[1][0]).toContain('DEPRECATED')
      expect(consoleWarnSpy.mock.calls[1][0]).toContain(
        'Passing rules object to useForm()'
      )
    })

    it('should not show deprecation warning for FormValidator instance', () => {
      const formData = { email: '' }
      const validator = createEncolaValidator({ email: 'required' })
      useForm(formData, validator)

      // Check no deprecation warnings (filter out Vue inject warnings)
      const deprecationCalls = consoleWarnSpy.mock.calls.filter((call: any[]) =>
        call.some(
          (arg: any) => typeof arg === 'string' && arg.includes('DEPRECATED')
        )
      )
      expect(deprecationCalls).toHaveLength(0)
    })

    it('should create form with old rules API', () => {
      const app = createApp({})
      app.use(EnformaPlugin)

      const formData = { email: '' }
      const form = useForm(formData, { email: 'required' })

      // Verify form was created
      expect(form).toBeDefined()
      expect(form.validate).toBeDefined()
      expect(typeof form.validate).toBe('function')
    })
  })

  describe('useForm with new validator API', () => {
    it('should work with FormValidator instance', async () => {
      const formData = { email: 'test@example.com', name: 'John' }
      const validator = createEncolaValidator({
        email: 'required|email',
        name: 'required',
      })
      const form = useForm(formData, validator)

      expect(form).toBeDefined()
      expect(form.values()).toEqual(formData)
    })

    it('should not show deprecation warning', () => {
      const formData = { email: '' }
      const validator = createEncolaValidator({ email: 'required' })
      useForm(formData, validator)

      // Check no deprecation warnings (filter out Vue inject warnings)
      const deprecationCalls = consoleWarnSpy.mock.calls.filter((call: any[]) =>
        call.some(
          (arg: any) => typeof arg === 'string' && arg.includes('DEPRECATED')
        )
      )
      expect(deprecationCalls).toHaveLength(0)
    })

    it('should work with validator instance directly', async () => {
      const formData = { email: '' }
      const validator = createEncolaValidator({ email: 'required' })

      // Test validator directly
      const isValid = await validator.validate(formData)
      expect(isValid).toBe(false)
      expect(validator.getErrorsForPath('email').length).toBeGreaterThan(0)

      // Test with form
      const form = useForm(formData, validator)
      expect(form).toBeDefined()
      expect(form.validate).toBeDefined()
    })
  })

  describe('useForm without validator', () => {
    it('should work without any validation', async () => {
      const formData = { email: 'anything', name: 'anything' }
      const form = useForm(formData)

      expect(form).toBeDefined()

      const isValid = await form.validate()
      expect(isValid).toBe(true)
      expect(form.errors()).toEqual({})
    })
  })

  describe('HeadlessForm with rules prop', () => {
    it('should work with old :rules prop', () => {
      const app = createApp({})
      app.use(EnformaPlugin)

      const wrapper = mount(HeadlessForm, {
        props: {
          data: { email: 'test@example.com' },
          rules: { email: 'required|email' },
        },
        global: {
          plugins: [EnformaPlugin],
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should show deprecation warning for :rules prop', () => {
      const app = createApp({})
      app.use(EnformaPlugin)

      mount(HeadlessForm, {
        props: {
          data: { email: '' },
          rules: { email: 'required' },
        },
        global: {
          plugins: [EnformaPlugin],
        },
      })

      expect(consoleWarnSpy).toHaveBeenCalled()
      expect(consoleWarnSpy.mock.calls[0][0]).toContain('DEPRECATED')
      expect(consoleWarnSpy.mock.calls[0][0]).toContain(
        ':rules prop on HeadlessForm'
      )
    })
  })

  describe('HeadlessForm with validator prop', () => {
    it('should work with new :validator prop', () => {
      const validator = createEncolaValidator({ email: 'required|email' })

      const wrapper = mount(HeadlessForm, {
        props: {
          data: { email: 'test@example.com' },
          validator,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should not show deprecation warning for :validator prop', () => {
      const validator = createEncolaValidator({ email: 'required' })

      mount(HeadlessForm, {
        props: {
          data: { email: '' },
          validator,
        },
      })

      expect(consoleWarnSpy).not.toHaveBeenCalled()
    })
  })

  describe('HeadlessForm validator priority', () => {
    it('should prefer :validator prop over :rules prop', () => {
      const app = createApp({})
      app.use(EnformaPlugin)

      const validator = createEncolaValidator({ email: 'required|email' })

      mount(HeadlessForm, {
        props: {
          data: { email: '' },
          validator,
          rules: { email: 'required' }, // This should be ignored
        },
        global: {
          plugins: [EnformaPlugin],
        },
      })

      // Should not show deprecation warning because validator prop takes precedence
      const deprecationCalls = consoleWarnSpy.mock.calls.filter((call: any[]) =>
        call.some(
          (arg: any) => typeof arg === 'string' && arg.includes('DEPRECATED')
        )
      )
      expect(deprecationCalls).toHaveLength(0)
    })
  })

  describe('Plugin configuration with createEncolaValidation', () => {
    it('should accept custom validator factory in plugin config', () => {
      const app = createApp({})
      const customFactory = vi.fn(createEncolaValidator)

      app.use(EnformaPlugin, {
        createEncolaValidation: customFactory,
      })

      // Just verify plugin accepts the configuration
      expect(app).toBeDefined()
    })
  })

  describe('Migration path validation', () => {
    it('should demonstrate migration from rules to validator', async () => {
      const formData = { email: 'test@example.com' }
      const rules = { email: 'required|email' }

      // Old way shows warning
      const oldWarnCount = consoleWarnSpy.mock.calls.length
      useForm(formData, rules)
      expect(consoleWarnSpy.mock.calls.length).toBeGreaterThan(oldWarnCount)

      // New way (recommended) does not show deprecation warning
      consoleWarnSpy.mockClear()
      const newForm = useForm(formData, createEncolaValidator(rules))
      const newIsValid = await newForm.validate()

      expect(newIsValid).toBe(true)

      // Check no deprecation warnings (filter out Vue inject warnings)
      const deprecationCalls = consoleWarnSpy.mock.calls.filter((call: any[]) =>
        call.some(
          (arg: any) => typeof arg === 'string' && arg.includes('DEPRECATED')
        )
      )
      expect(deprecationCalls).toHaveLength(0)
    })
  })
})
