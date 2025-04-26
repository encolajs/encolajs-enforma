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
                  :hide-label="true"
                  v-bind="{ ...subfield }"
                />
              </td>
              <td
                v-if="allowRemove || allowSort"
                v-bind="getConfig('pt.repeatable_table.actionsTd')"
              >
                <div
                  v-bind="
                    getConfig(
                      'pt.repeatable_table.itemActions',
                      getConfig('pt.repeatable.itemActions')
                    )
                  "
                >
                  <component
                    v-if="allowRemove"
                    :is="
                      removeButton ||
                      getConfig('components.repeatableRemoveButton')
                    "
                    @click="remove(index)"
                  />
                  <component
                    v-if="allowSort"
                    :is="
                      moveUpButton ||
                      getConfig('components.repeatableMoveUpButton')
                    "
                    :disabled="index === 0"
                    @click="moveUp(index)"
                  />
                  <component
                    v-if="allowSort"
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
            v-if="canAdd && allowAdd"
            :is="addButton || getConfig('components.repeatableAddButton')"
            @click="add(defaultValue)"
          />
        </div>
      </template>
    </HeadlessRepeatable>
  </div>
</template>

<script setup lang="ts">
import { useAttrs, mergeProps, computed } from 'vue'
import HeadlessRepeatable from '@/headless/HeadlessRepeatable'
import {
  RepeatableFieldProps,
  useEnformaRepeatable,
} from './useEnformaRepeatable'
import { useFormConfig } from '@/utils/useFormConfig'
import EnformaField from '@/core/EnformaField.vue'
import applyTransformers from '@/utils/applyTransformers'

const props = withDefaults(defineProps<RepeatableFieldProps>(), {
  validateOnAdd: true,
  validateOnRemove: false,
  if: true,
  min: 0,
  allowAdd: true,
  allowRemove: true,
  allowSort: true,
})

const $attrs = useAttrs()
const { getConfig } = useFormConfig()

// Use the useEnformaRepeatable hook, but apply table-specific transformers
const repeatableResult = useEnformaRepeatable(props)
const { isVisible, fields, transformedFieldConfig } = repeatableResult

// Apply table-specific transformers
const transformedTableConfig = computed(() => {
  // Apply repeatable table props transformers if defined in config
  const repeatableTablePropsTransformers = getConfig('transformers.repeatable_table_props', []) as Function[]
  
  if (repeatableTablePropsTransformers.length === 0) {
    return transformedFieldConfig.value
  }
  
  return applyTransformers(
    repeatableTablePropsTransformers,
    { ...transformedFieldConfig.value },
    repeatableResult.formState,
    getConfig() // pass the full config
  )
})

// Derive additional props from the transformed config
const addButton = computed(() => transformedTableConfig.value.addButton)
const removeButton = computed(() => transformedTableConfig.value.removeButton)
const moveUpButton = computed(() => transformedTableConfig.value.moveUpButton)
const moveDownButton = computed(() => transformedTableConfig.value.moveDownButton)
const allowAdd = computed(() => transformedTableConfig.value.allowAdd !== false)
const allowRemove = computed(() => transformedTableConfig.value.allowRemove !== false)
const allowSort = computed(() => transformedTableConfig.value.allowSort !== false)
const defaultValue = computed(() => transformedTableConfig.value.defaultValue)
const name = computed(() => transformedTableConfig.value.name)
const min = computed(() => transformedTableConfig.value.min || 0)
const max = computed(() => transformedTableConfig.value.max)
const validateOnAdd = computed(() => transformedTableConfig.value.validateOnAdd !== false)
const validateOnRemove = computed(() => transformedTableConfig.value.validateOnRemove !== false)
</script>
