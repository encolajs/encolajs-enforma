<template>
  <component :is="formConfig.components.field" v-bind="fieldProps" :if="evaluatedIf" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDynamicProps } from '../utils/useDynamicProps'
import { useFormConfig } from '../utils/useFormConfig'
import { FieldSchema } from '../types'

interface FieldWithName extends FieldSchema {
  name: string
}

const props = defineProps<{
  field: FieldWithName
}>()

const { evaluateCondition } = useDynamicProps()
const { formConfig } = useFormConfig()

// Evaluate the if condition if it's a string
const evaluatedIf = computed(() => {
  if (typeof props.field.if === 'string') {
    return evaluateCondition(props.field.if).value
  }
  return props.field.if
})

// Pass all other props directly to FormKitField
const fieldProps = computed(() => {
  const { if: _, ...rest } = props.field
  return rest
})
</script> 