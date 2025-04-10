<template>
  <div v-bind="$attrs" v-if="isVisible">
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
                v-for="(subfield, subfieldName) in fields"
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
                v-for="(subfield, subfieldName) in fields"
                :key="subfieldName"
              >
                <FormKitField
                  v-bind="subfield"
                  :hide-label="true"
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
import { useAttrs } from 'vue'
import HeadlessRepeatable from '../headless/HeadlessRepeatable'
import FormKitField from './FormKitField.vue'
import FormKitRepeatableAddButton from './FormKitRepeatableAddButton.vue'
import FormKitRepeatableRemoveButton from './FormKitRepeatableRemoveButton.vue'
import FormKitRepeatableMoveUpButton from './FormKitRepeatableMoveUpButton.vue'
import FormKitRepeatableMoveDownButton from './FormKitRepeatableMoveDownButton.vue'
import { RepeatableFieldSchema, useFormKitRepeatable } from './useFormKitRepeatable'

const props = withDefaults(defineProps<RepeatableFieldSchema>(), {
  validateOnAdd: true,
  validateOnRemove: false,
  if: true,
  min: 0,
})

const $attrs = useAttrs()
const { isVisible, fields } = useFormKitRepeatable(props)
</script>
