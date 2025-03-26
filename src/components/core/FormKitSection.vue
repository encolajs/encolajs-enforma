<template>
  <div v-bind="$attrs" :class="sectionClass">
    <template v-for="field in visibleFields" :key="field.name">
      <FormKitField v-bind="field" />
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject } from 'vue'
import FormKitDirectField from './FormKitDirectField.vue'
import { formSchemaKey } from '../../constants/symbols'
import { FieldSchema } from '../../types/fields'
import FormKitField from '@/components/core/FormKitField.vue'

function getSectionFields(
  fields: Record<string, FieldSchema>,
  sectionName: string
): Record<string, FieldSchema> {
  return Object.fromEntries(
    Object.entries(fields).filter(([_, field]) => field.section === sectionName)
  )
}

export default defineComponent({
  name: 'FormKitFields',

  components: {
    FormKitField,
    FormKitDirectField,
  },

  props: {
    // Section to render
    name: {
      type: String,
      default: 'default',
    },
  },

  setup(props) {
    // Inject dependencies
    const schema = inject<FormKitSchema>(formSchemaKey)

    // Get fields for this section
    const sectionFields = computed(() => {
      return getSectionFields(schema, props.section)
    })

    return {
      sectionFields,
    }
  },
})
</script>
