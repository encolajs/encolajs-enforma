<template>
  <div :class="sectionClass">
    <template v-for="field in visibleFields" :key="field.name">
      <FormKitDirectField
        :name="field.name"
        :type="field.type"
        :label="field.label"
        :help-text="field.help_text"
        :placeholder="field.placeholder"
        :required="field.required"
        :disabled="field.disabled"
        :readonly="field.readonly"
        :visible="field.if"
        :default="field.default"
        :input-props="field.input_props"
        :label-props="field.label_props"
        :error-props="field.error_props"
        :help-props="field.help_props"
        :wrapper-props="field.wrapper_props"
        :component="resolveComponent(field)"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, PropType } from 'vue'
import FormKitDirectField from './FormKitDirectField.vue'
import {
  FIELD_REGISTRY,
  FORM_CONTEXT,
  FORM_KIT_CONFIG,
} from '../../constants/symbols'
import { FormKitConfig } from '../../types/config'
import { DEFAULT_CONFIG } from '../../constants/defaults'
import { FieldSchema } from '../../types/field'
import { SectionSchema, getSectionFields } from '../../types/section'
import { useConditions } from '../../composables/useConditions'

export default defineComponent({
  name: 'FormKitFields',

  components: {
    FormKitDirectField,
  },

  props: {
    // Section to render
    section: {
      type: String,
      default: 'default',
    },

    // Field definitions
    fields: {
      type: Object as PropType<Record<string, FieldSchema>>,
      required: true,
    },

    // Section definitions (optional)
    sections: {
      type: Object as PropType<Record<string, SectionSchema>>,
      default: () => ({}),
    },

    // Section class override
    sectionClass: {
      type: [String, Object, Array],
      default: null,
    },
  },

  setup(props) {
    // Inject dependencies
    const config = inject<FormKitConfig>(FORM_KIT_CONFIG, DEFAULT_CONFIG)
    const fieldRegistry = inject<FieldRegistry | undefined>(
      FIELD_REGISTRY,
      undefined
    )

    // Setup condition evaluation
    const { evaluateIf } = useConditions()

    // Get the section schema
    const sectionSchema = computed(() => {
      return props.sections[props.section] || { name: props.section }
    })

    // Get fields for this section
    const sectionFields = computed(() => {
      return getSectionFields(props.fields, props.section)
    })

    // Filter visible fields based on conditions
    const visibleFields = computed(() => {
      return Object.values(sectionFields.value).filter((field) => {
        if (!field.if) return true
        return evaluateIf(field.if).value
      })
    })

    // Resolve component for a field
    const resolveComponent = (field: FieldSchema) => {
      // Use field registry if available
      if (fieldRegistry) {
        const component = fieldRegistry.resolveFieldType(field.type)
        if (component) {
          return component
        }
      }

      // Fall back to component from config
      const fieldType = field.type
      const inputComponents = config.components.input

      return inputComponents[fieldType] || inputComponents.text
    }

    return {
      sectionSchema,
      visibleFields,
      resolveComponent,
    }
  },
})
</script>
