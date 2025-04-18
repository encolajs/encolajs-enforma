<template>
  <div
    v-bind="mergeProps($attrs, getConfig('pt.repeatable_table.wrapper'))"
    v-if="isVisible"
  >
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
        <table v-bind="getConfig('pt.repeatable_table.table')">
          <thead>
            <tr>
              <th
                v-for="(subfield, subfieldName) in fields"
                :key="subfieldName"
                v-bind="getConfig('pt.repeatable_table.th')"
              >
                {{ subfield.label || subfieldName }}
              </th>
              <th v-bind="getConfig('pt.repeatable_table.th')"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(_, index) in value" :key="index">
              <td
                v-for="(subfield, subfieldName) in fields"
                :key="subfieldName"
                v-bind="getConfig('pt.repeatable_table.td')"
              >
                <component
                  :is="getConfig('components.field', EnformaField)"
                  :name="`${name}.${index}.${subfieldName}`"
                  hide-label="true"
                  v-bind="subfield"
                />
              </td>
              <td v-if="showDeleteButton || showMoveButtons" v-bind="getConfig('pt.repeatable_table.actionsTd')">
                <div
                  v-bind="
                    getConfig(
                      'pt.repeatable_table.itemActions',
                      getConfig('pt.repeatable.itemActions')
                    )
                  "
                >
                  <component
                    v-if="showDeleteButton"
                    :is="
                      removeButton ||
                      getConfig('components.repeatableRemoveButton')
                    "
                    @click="remove(index)"
                  />
                  <component
                    v-if="showMoveButtons"
                    :is="
                      moveUpButton ||
                      getConfig('components.repeatableMoveUpButton')
                    "
                    :disabled="index === 0"
                    @click="moveUp(index)"
                  />
                  <component
                    v-if="showMoveButtons"
                    :is="
                      moveDownButton ||
                      getConfig('components.repeatableMoveDownButton')
                    "
                    :disabled="index >= count - 1"
                    @click="moveDown(index)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Add button -->
        <div
          v-bind="
            getConfig(
              'pt.repeatable_table.actions',
              getConfig('pt.repeatable.actions')
            )
          "
        >
          <component
            v-if="canAdd"
            :is="addButton || getConfig('components.repeatableAddButton')"
            @click="add(defaultValue)"
          />
        </div>
      </template>
    </HeadlessRepeatable>
  </div>
</template>

<script setup lang="ts">
import { useAttrs, mergeProps } from 'vue'
import HeadlessRepeatable from '@/headless/HeadlessRepeatable'
import {
  RepeatableFieldSchema,
  useEnformaRepeatable,
} from './useEnformaRepeatable'
import { useFormConfig } from '@/utils/useFormConfig'
import EnformaField from '@/core/EnformaField.vue'

const props = withDefaults(defineProps<RepeatableFieldSchema>(), {
  validateOnAdd: true,
  validateOnRemove: false,
  if: true,
  min: 0,
  // Disable animations by default for tables
  animations: false,
  showDeleteButton: true,
  showMoveButtons: true,
})

const $attrs = useAttrs()
const { isVisible, fields } = useEnformaRepeatable(props)
const { getConfig } = useFormConfig()
</script>
