import { describe, it, expect, vi } from 'vitest'
import applyTransformers from '../../src/utils/applyTransformers'
import { FormSchema } from '../../src'

describe('Form Props Transformers', () => {
  it('applies form props transformers to modify all form properties', () => {
    // Define a transformer that modifies schema, context, and config together
    const formPropsTransformer = vi.fn((props) => {
      const result = { ...props }
      
      // Modify schema
      if (result.schema) {
        Object.entries(result.schema).forEach(([key, item]) => {
          if (item.type === 'field') {
            result.schema[key] = {
              ...item,
              required: true,
            }
          }
        })
      }
      
      // Modify context
      result.context = {
        ...result.context,
        transformed: true,
        extraValue: 'added by transformer',
      }
      
      // Modify config
      result.config = {
        ...result.config,
        transformed: true,
        customSetting: 'added by transformer',
      }
      
      return result
    })

    // Create test props with schema, context, and config
    const testProps = {
      schema: {
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
      },
      context: {
        originalValue: 'test',
      },
      config: {
        validateOn: 'blur',
        components: {
          field: 'input',
        },
      }
    }

    // Apply the transformer
    const transformedProps = applyTransformers(
      [formPropsTransformer], 
      testProps,
      null
    )

    // Check that the transformer was called
    expect(formPropsTransformer).toHaveBeenCalled()
    
    // Check that schema was transformed
    expect(transformedProps.schema.name.required).toBe(true)
    expect(transformedProps.schema.email.required).toBe(true)
    
    // Check that context was transformed
    expect(transformedProps.context.transformed).toBe(true)
    expect(transformedProps.context.extraValue).toBe('added by transformer')
    expect(transformedProps.context.originalValue).toBe('test')
    
    // Check that config was transformed
    expect(transformedProps.config.transformed).toBe(true)
    expect(transformedProps.config.customSetting).toBe('added by transformer')
    expect(transformedProps.config.validateOn).toBe('blur')
  })

  it('passes form controller to form props transformers', () => {
    // Mock form controller
    const mockFormController = {
      values: () => ({ username: 'test' }),
      $isDirty: true,
    }

    // Define a form props transformer that uses the form controller
    const formPropsTransformer = vi.fn((props, formController) => {
      // Only process if form controller is available
      if (formController && formController.values) {
        const values = formController.values()
        
        // Create a copy of props to modify
        const result = { ...props }
        
        // Modify schema based on form controller data
        if (result.schema) {
          result.schema = {
            ...result.schema,
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
        
        // Modify context based on form controller state
        result.context = {
          ...result.context,
          formState: {
            isDirty: formController.$isDirty,
            username: values.username
          }
        }
        
        return result
      }
      
      return props
    })

    // Create test props
    const testProps = {
      schema: {
        name: {
          type: 'field',
          label: 'Name',
          component: 'input',
        }
      },
      context: {
        originalValue: 'test'
      },
      config: {}
    }

    // Apply the transformer with form controller
    const transformedProps = applyTransformers(
      [formPropsTransformer],
      testProps,
      mockFormController
    )

    // Check that the transformer was called with the props and form controller
    expect(formPropsTransformer).toHaveBeenCalledWith(
      testProps,
      mockFormController
    )
    
    // Check that schema was modified with dynamic fields
    expect(transformedProps.schema.dynamicField).toBeDefined()
    expect(transformedProps.schema.dynamicField.defaultValue).toBe('test')
    expect(transformedProps.schema.conditionalField).toBeDefined()
    expect(transformedProps.schema.conditionalField.if).toBe(true)
    
    // Check that context was modified with form state
    expect(transformedProps.context.formState).toBeDefined()
    expect(transformedProps.context.formState.isDirty).toBe(true)
    expect(transformedProps.context.formState.username).toBe('test')
  })

  it('maintains order of form props transformer execution', () => {
    // Define transformers that will execute in order
    const firstTransformer = vi.fn((props) => {
      return { 
        ...props,
        schema: props.schema ? {
          ...props.schema,
          transformerField1: { 
            type: 'field',
            label: 'First Transformer Field',
          }
        } : props.schema,
        context: {
          ...props.context,
          firstTransformerApplied: true
        }
      }
    })

    const secondTransformer = vi.fn((props) => {
      // Only add second field if first one exists and first transformer was applied
      // This tests that transformers are applied in sequence
      if (props.schema?.transformerField1 && props.context.firstTransformerApplied) {
        return { 
          ...props,
          schema: {
            ...props.schema,
            transformerField2: { 
              type: 'field',
              label: 'Second Transformer Field',
            }
          },
          context: {
            ...props.context,
            secondTransformerApplied: true
          }
        }
      }
      return props
    })

    // Create test props
    const testProps = {
      schema: {
        name: {
          type: 'field',
          label: 'Name',
          component: 'input',
        }
      },
      context: {
        originalValue: 'test'
      },
      config: {}
    }

    // Apply the transformers in order
    const transformedProps = applyTransformers(
      [firstTransformer, secondTransformer],
      testProps,
      null
    )

    // Check that both transformers were called in sequence
    expect(firstTransformer).toHaveBeenCalledWith(testProps, null)
    expect(secondTransformer).toHaveBeenCalled()
    
    // Check that both transformers modified the schema
    expect(transformedProps.schema.transformerField1).toBeDefined()
    expect(transformedProps.schema.transformerField2).toBeDefined()
    
    // Check that both transformers modified the context
    expect(transformedProps.context.firstTransformerApplied).toBe(true)
    expect(transformedProps.context.secondTransformerApplied).toBe(true)
    expect(transformedProps.context.originalValue).toBe('test')
  })
})