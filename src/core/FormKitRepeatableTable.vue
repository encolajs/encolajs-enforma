<template>
  <div v-bind="$attrs" v-if="shouldShow">
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
        <table class="formkit-repeatable-table-table">
          <thead>
            <tr>
              <th
                v-for="(subfield, subfieldName) in cleanSubfields"
                :key="subfieldName"
              >
                {{ subfield.label || subfieldName }}
              </th>
              <th class="formkit-repeatable-table-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in value" :key="index">
              <td
                v-for="(subfield, subfieldName) in cleanSubfields"
                :key="subfieldName"
              >
                <FormKitField
                  v-bind="subfield"
                  :name="`${name}.${index}.${subfieldName}`"
                />
              </td>
              <td class="formkit-repeatable-table-actions">
                <div class="formkit-repeatable-table-action-buttons">
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
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Add button -->
        <div v-if="canAdd" class="formkit-repeatable-table-add">
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
import { inject, onBeforeUnmount } from 'vue'
import { formConfigKey, formStateKey } from '../constants/symbols'
import { FormKitConfig } from '../types/config'
import { useDynamicProps } from '../utils/useDynamicProps'
import { FormController } from '@'
import { RepeatableFieldSchema } from '../types/fields'
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
    `FormKitRepeatableTable '${props.name}' must be used within a FormKit form component`
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

<style>
.formkit-repeatable-table-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.formkit-repeatable-table th,
.formkit-repeatable-table td {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  text-align: left;
}

.formkit-repeatable-table th {
  background-color: #f7fafc;
  font-weight: 600;
}

.formkit-repeatable-table-actions {
  width: 150px;
  text-align: center;
}

.formkit-repeatable-table-action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.formkit-repeatable-table-add {
  margin-top: 1rem;
}
</style>
