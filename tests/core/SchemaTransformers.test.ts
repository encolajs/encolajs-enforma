import { describe, it, expect, vi } from 'vitest'
import applyTransformers from '../../src/utils/applyTransformers'
import { FormSchema } from '../../src'

describe('Schema Transformers', () => {
  it('applies schema transformers to modify schema', () => {
    // Define a simple transformer that adds a required flag to all fields
    const addRequiredTransformer = vi.fn((schema: FormSchema) => {
      const result = { ...schema }
      
      // Add required: true to all field schemas
      Object.entries(result).forEach(([key, item]) => {
        if (item.type === 'field') {
          result[key] = {
            ...item,
            required: true,
          }
        }
      })
      
      return result
    })

    // Create a test schema
    const testSchema = {
      name: {
        type: 'field',
        label: 'Name',
        component: 'input',
      },
      email: {
        type: 'field',
        label: 'Email',
        component: 'input',
      },
    }

    // Apply the transformer
    const transformedSchema = applyTransformers(
      [addRequiredTransformer], 
      testSchema,
      null
    )

    // Check that the transformer was called
    expect(addRequiredTransformer).toHaveBeenCalled()
    
    // Check that fields are now required
    expect(transformedSchema.name.required).toBe(true)
    expect(transformedSchema.email.required).toBe(true)
  })

  it('applies context transformers to modify context', () => {
    // Define a transformer that adds properties to the context
    const contextTransformer = vi.fn((context) => {
      return {
        ...context,
        transformed: true,
        extraValue: 'added by transformer',
      }
    })

    // Create a test context
    const testContext = {
      originalValue: 'test',
    }

    // Apply the transformer
    const transformedContext = applyTransformers(
      [contextTransformer], 
      testContext,
      null
    )

    // Check that the transformer was called
    expect(contextTransformer).toHaveBeenCalled()
    
    // Check that the context was transformed
    expect(transformedContext.transformed).toBe(true)
    expect(transformedContext.extraValue).toBe('added by transformer')
    expect(transformedContext.originalValue).toBe('test')
  })

  it('applies form config transformers to modify form config', () => {
    // Define a transformer that adds properties to the form config
    const formConfigTransformer = vi.fn((config) => {
      return {
        ...config,
        transformed: true,
        customSetting: 'added by transformer',
      }
    })

    // Create a test config
    const testConfig = {
      validateOn: 'blur',
      components: {
        field: 'input',
      },
    }

    // Apply the transformer
    const transformedConfig = applyTransformers(
      [formConfigTransformer], 
      testConfig,
      null
    )

    // Check that the transformer was called
    expect(formConfigTransformer).toHaveBeenCalled()
    
    // Check that the form config was transformed
    expect(transformedConfig.transformed).toBe(true)
    expect(transformedConfig.customSetting).toBe('added by transformer')
    expect(transformedConfig.validateOn).toBe('blur')
  })

  it('passes form controller to transformers when available', () => {
    // Mock form controller
    const mockFormController = {
      values: () => ({ username: 'test' }),
      $isDirty: true,
    }

    // Define a schema transformer that uses the form controller
    const formControllerAwareTransformer = vi.fn((schema, formController) => {
      // Add a dynamic field based on the form controller
      if (formController && formController.values) {
        const values = formController.values()
        return {
          ...schema,
          dynamicField: {
            type: 'field',
            label: 'Dynamic Field',
            component: 'input',
            defaultValue: values.username,
          },
          conditionalField: {
            type: 'field',
            label: 'Conditional Field',
            component: 'input',
            if: formController.$isDirty,
          },
        }
      }
      return schema
    })

    // Create a test schema
    const testSchema = {
      name: {
        type: 'field',
        label: 'Name',
        component: 'input',
      },
    }

    // Apply the transformer with form controller
    const transformedSchema = applyTransformers(
      [formControllerAwareTransformer],
      testSchema,
      mockFormController
    )

    // Check that the transformer was called with the schema and form controller
    expect(formControllerAwareTransformer).toHaveBeenCalledWith(
      testSchema,
      mockFormController
    )
    
    // Check that dynamic fields were added
    expect(transformedSchema.dynamicField).toBeDefined()
    expect(transformedSchema.dynamicField.defaultValue).toBe('test')
    expect(transformedSchema.conditionalField).toBeDefined()
    expect(transformedSchema.conditionalField.if).toBe(true)
  })

  it('maintains order of transformer execution', () => {
    // Define transformers that will execute in order
    const firstTransformer = vi.fn((schema) => {
      return { 
        ...schema,
        transformerField1: { 
          type: 'field',
          label: 'First Transformer Field',
        },
      }
    })

    const secondTransformer = vi.fn((schema) => {
      // Only add second field if first one exists (testing execution order)
      if (schema.transformerField1) {
        return { 
          ...schema,
          transformerField2: { 
            type: 'field',
            label: 'Second Transformer Field',
          },
        }
      }
      return schema
    })

    // Create a test schema
    const testSchema = {
      name: {
        type: 'field',
        label: 'Name',
        component: 'input',
      },
    }

    // Apply the transformers in order
    const transformedSchema = applyTransformers(
      [firstTransformer, secondTransformer],
      testSchema,
      null
    )

    // Check that both transformers were called
    expect(firstTransformer).toHaveBeenCalledWith(testSchema, null)
    expect(secondTransformer).toHaveBeenCalled()
    
    // Check that both fields were added (proving order was maintained)
    expect(transformedSchema.transformerField1).toBeDefined()
    expect(transformedSchema.transformerField2).toBeDefined()
  })
})