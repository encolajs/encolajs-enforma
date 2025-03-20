<template>
  <form
    :id="formId"
    :class="formClasses"
    @submit.prevent="handleSubmit"
    novalidate
  >
    <slot
      name="default"
      :form="formData"
      :errors="errors"
      :submit="handleSubmit"
      :reset="handleReset"
      :validate="validate"
      :is-valid="isValid"
      :is-submitted="submitted"
      :is-submitting="isSubmitting"
      :is-validating="isValidating"
      :Field="fieldComponent"
      :Fields="fieldsComponent"
    >
      <!-- Default form rendering -->
      <template v-for="(section, index) in sectionsList" :key="section.name">
        <div :class="getSectionClasses(section)">
          <template v-if="section.title">
            <h3 :class="sectionTitleClasses">{{ section.title }}</h3>
          </template>

          <template v-if="section.description">
            <div :class="sectionDescriptionClasses">
              {{ section.description }}
            </div>
          </template>

          <FormKitFields
            :section="section.name"
            :fields="fields"
            :sections="sections"
          />
        </div>
      </template>

      <!-- Default form actions -->
      <div :class="formActionsClasses">
        <slot name="actions" :submit="handleSubmit" :reset="handleReset">
          <button
            type="submit"
            :disabled="isSubmitting"
            :class="submitButtonClasses"
          >
            {{ submitButtonText }}
          </button>

          <button
            type="button"
            :disabled="isSubmitting"
            @click="handleReset"
            :class="resetButtonClasses"
          >
            {{ resetButtonText }}
          </button>
        </slot>
      </div>
    </slot>
  </form>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  h,
  onMounted,
  PropType,
  provide,
  ref,
} from 'vue'
import FormKitFields from './FormKitFields.vue'
import FormKitDirectField from './FormKitDirectField.vue'
import { FieldSchema, FormFieldsSchema } from '../../types/fields'
import {
  FormSectionsSchema,
  SectionSchema,
  sortSections,
} from '../../types/section'
import { FormKitConfig } from '../../types/config'
import { useFormState } from '../../composables/useFormState'
import { useConfig } from '../../composables/useConfig'
import { useFieldRegistry } from '../../composables/useFieldRegistry'
import {
  FIELD_REGISTRY,
  FORM_CONTEXT,
  FORM_KIT_CONFIG,
  FORM_STATE,
} from '../../constants/symbols'
import { ValidationRules } from '../../types/validation'

export default defineComponent({
  name: 'FormKit',

  components: {
    FormKitFields,
  },

  props: {
    // Form data (initial values)
    data: {
      type: Object,
      default: () => ({}),
    },

    // Form schema
    schema: {
      type: Object as PropType<FormFieldsSchema | FormSectionsSchema>,
      default: null,
    },

    // Sections (if not using schema)
    sections: {
      type: Object as PropType<Record<string, SectionSchema>>,
      default: () => ({}),
    },

    // Fields (if not using schema)
    fields: {
      type: Object as PropType<Record<string, FieldSchema>>,
      default: () => ({}),
    },

    // Validation rules (if not using schema)
    rules: {
      type: Object as PropType<ValidationRules>,
      default: () => ({}),
    },

    // Custom validation messages
    messages: {
      type: Object,
      default: () => ({}),
    },

    // Form ID
    id: {
      type: String,
      default: null,
    },

    // External context for expressions
    context: {
      type: Object,
      default: () => ({}),
    },

    // Form configuration
    config: {
      type: Object as PropType<Partial<FormKitConfig>>,
      default: () => ({}),
    },

    // Submit handler
    submitHandler: {
      type: Function as PropType<(data: any) => Promise<any> | void>,
      default: null,
    },

    // Button texts
    submitText: {
      type: String,
      default: 'Submit',
    },
    resetText: {
      type: String,
      default: 'Reset',
    },
  },

  emits: [
    'submit',
    'reset',
    'validation-error',
    'submit-error',
    'submit-success',
  ],

  setup(props, { emit }) {
    // Generate form ID
    const formId = computed(
      () => props.id || `form-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    )

    // Extract schema parts if schema is provided
    const schemaFields = computed(() => {
      if (!props.schema) return props.fields
      return (props.schema as FormFieldsSchema).fields
    })

    const schemaRules = computed(() => {
      if (!props.schema) return props.rules
      return (props.schema as FormFieldsSchema).validation_rules || {}
    })

    const schemaSections = computed(() => {
      if (!props.schema) return props.sections
      return (props.schema as FormSectionsSchema).sections || {}
    })

    const schemaMessages = computed(() => {
      if (!props.schema) return props.messages
      return (props.schema as FormFieldsSchema).validation_messages || {}
    })

    // Create form state
    const formState = useFormState(props.data, schemaRules.value, {
      customMessages: schemaMessages.value,
      submitHandler: async (data) => {
        if (props.submitHandler) {
          try {
            await props.submitHandler(data)
            emit('submit-success', data)
          } catch (error) {
            emit('submit-error', error)
            throw error
          }
        } else {
          emit('submit', data)
        }
      },
    })

    // Set up configuration
    const { config, provideConfig } = useConfig(props.config)

    // Initialize field registry
    const fieldRegistry = useFieldRegistry()

    // Provide values to descendants
    provide(FORM_STATE, formState)
    provide(FORM_CONTEXT, props.context)
    provide(FORM_KIT_CONFIG, config.value)
    provide(FIELD_REGISTRY, fieldRegistry)

    // Extract form state properties
    const {
      getData,
      errors,
      validate,
      reset,
      submit,
      isValid,
      isSubmitting,
      isValidating,
      submitted,
    } = formState

    // Form data accessor
    const formData = computed(() => getData())

    // List of sections
    const sectionsList = computed(() => {
      const sections = schemaSections.value

      // If no sections defined, create a default section
      if (Object.keys(sections).length === 0) {
        return [{ name: 'default' }]
      }

      return sortSections(sections)
    })

    // Handle form submission
    const handleSubmit = async () => {
      try {
        const isValid = await submit()

        if (!isValid) {
          emit('validation-error', errors)
        }

        return isValid
      } catch (error) {
        emit('submit-error', error)
        return false
      }
    }

    // Handle form reset
    const handleReset = () => {
      reset()
      emit('reset')
    }

    // Component references for slot
    const fieldComponent = FormKitDirectField
    const fieldsComponent = FormKitFields

    // CSS classes
    const formClasses = computed(() =>
      [
        'formkit',
        `formkit-form-${formId.value}`,
        config.value.fieldProps?.form?.class,
      ]
        .filter(Boolean)
        .join(' ')
    )

    const formActionsClasses = computed(() =>
      ['formkit-actions', config.value.fieldProps?.actions?.class]
        .filter(Boolean)
        .join(' ')
    )

    const submitButtonClasses = computed(() =>
      ['formkit-submit', config.value.fieldProps?.submit?.class]
        .filter(Boolean)
        .join(' ')
    )

    const resetButtonClasses = computed(() =>
      ['formkit-reset', config.value.fieldProps?.reset?.class]
        .filter(Boolean)
        .join(' ')
    )

    const sectionTitleClasses = computed(() =>
      ['formkit-section-title', config.value.fieldProps?.section?.titleClass]
        .filter(Boolean)
        .join(' ')
    )

    const sectionDescriptionClasses = computed(() =>
      [
        'formkit-section-description',
        config.value.fieldProps?.section?.descriptionClass,
      ]
        .filter(Boolean)
        .join(' ')
    )

    // Button texts
    const submitButtonText = computed(() => props.submitText)
    const resetButtonText = computed(() => props.resetText)

    // Section class helper
    const getSectionClasses = (section: SectionSchema) => {
      return [
        'formkit-section',
        `formkit-section-${section.name}`,
        config.value.fieldProps?.section?.class,
        section.props?.class,
      ]
        .filter(Boolean)
        .join(' ')
    }

    return {
      formId,
      formData,
      errors,
      isValid,
      isSubmitting,
      isValidating,
      submitted,
      sectionsList,
      validate,
      handleSubmit,
      handleReset,
      fieldComponent,
      fieldsComponent,
      formClasses,
      formActionsClasses,
      submitButtonClasses,
      resetButtonClasses,
      sectionTitleClasses,
      sectionDescriptionClasses,
      submitButtonText,
      resetButtonText,
      getSectionClasses,
    }
  },
})
</script>
