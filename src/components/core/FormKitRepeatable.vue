<template>
  <div v-bind="$attrs" v-if="shouldShow">
    {{ shouldShow }}
    <HeadlessRepeatable
      :name="name"
      :min="min"
      :max="max"
      :validate-on-add="validateOnAdd"
      :validate-on-remove="validateOnRemove"
    >
      <template
        #default="{ value, add, remove, canAdd, moveUp, moveDown, count }"
      >
        <!-- Items container -->
        <div class="formkit-repeatable-items">
          <div
            v-for="(item, index) in value"
            :key="index"
            class="formkit-repeatable-item"
          >
            <!-- Subfields -->
            <template
              v-for="(subfield, subfieldName) in cleanSubfields"
              :key="subfieldName"
            >
              {{ `${name}.${index}.${subfieldName}` }}
              <FormKitField
                v-bind="subfield"
                :name="`${name}.${index}.${subfieldName}`"
              />
            </template>

            <!-- Actions -->
            <div class="formkit-repeatable-actions">
              <component
                :is="removeButton || FormKitRepeatableRemoveButton"
                @click="remove(index)"
              />
              <component
                :is="moveUpButton || FormKitRepeatableMoveUpButton"
                :disabled="index === 0"
                @click="moveUp(index)"
              />
              <component
                :is="moveDownButton || FormKitRepeatableMoveDownButton"
                :disabled="index >= count - 1"
                @click="moveDown(index)"
              />
            </div>
          </div>
        </div>

        <!-- Add button -->
        <div v-if="canAdd" class="formkit-repeatable-add">
          <component
            :is="addButton || FormKitRepeatableAddButton"
            @click="add(defaultValue)"
          />
        </div>
      </template>
    </HeadlessRepeatable>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, mergeProps, onBeforeUnmount } from 'vue'
import { formConfigKey, formStateKey } from '../../constants/symbols'
import { FormKitConfig } from '../../types/config'
import { useDynamicProps } from '../../composables/useDynamicProps'
import { FormController } from '../../index'
import { RepeatableFieldSchema } from '../../types/fields'
import HeadlessRepeatable from '../headless/HeadlessRepeatable'
import FormKitField from './FormKitField.vue'
import FormKitRepeatableAddButton from './FormKitRepeatableAddButton.vue'
import FormKitRepeatableRemoveButton from './FormKitRepeatableRemoveButton.vue'
import FormKitRepeatableMoveUpButton from './FormKitRepeatableMoveUpButton.vue'
import FormKitRepeatableMoveDownButton from './FormKitRepeatableMoveDownButton.vue'

const props = withDefaults(defineProps<RepeatableFieldSchema>(), {
  validateOnAdd: true, // Defaults to `true` instead of `undefined`
  validateOnRemove: false, // Explicitly set to `false`
  if: true, // Defaults to `true`
  min: 0,
})

// Get form state from context
const formState = inject<FormController>(formStateKey) as FormController
const config = inject<FormKitConfig>(formConfigKey) as FormKitConfig

if (!formState) {
  console.error(
    `FormKitRepeatable '${props.name}' must be used within a FormKit form component`
  )
}

const { evaluateCondition } = useDynamicProps()

const shouldShow = props.if !== undefined ? evaluateCondition(props.if) : true

const cleanSubfields: Record<string, any> = Object.entries(
  props.subfields
).reduce((acc, [subfieldName, subfield]) => {
  const { name, ...rest } = subfield
  acc[subfieldName] = rest
  return acc
}, {})

// Clean up on unmount
onBeforeUnmount(() => {
  formState?.removeField(props.name)
})
</script>
