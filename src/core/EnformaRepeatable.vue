<template>
  <div
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.wrapper') || {})"
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
        <!-- Items container -->
        <div v-bind="getConfig('pt.repeatable.items')">
          <div
            v-for="(itemValue, index) in value"
            :key="index"
            v-bind="getConfig('pt.repeatable.item')"
          >
            <!-- Subfields -->
            <template v-if="!component && fields">
              <template
                v-for="(subfield, subfieldName) in fields"
                :key="subfieldName"
              >
                <component
                  :is="getConfig('components.field')"
                  v-bind="subfield"
                  :name="`${name}.${index}.${subfieldName}`"
                />
              </template>

              <!-- Actions for field-based subfields -->
              <div
                v-if="allowRemove || allowSort"
                v-bind="getConfig('pt.repeatable.itemActions')"
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
            </template>

            <!-- Component-based subfields -->
            <template v-else-if="component">
              <component
                :is="component"
                :name="`${name}.${index}`"
                :index="index"
                :value="itemValue"
                :list-length="count"
                v-bind="componentProps || {}"
              />
            </template>
          </div>
        </div>

        <!-- Add button -->
        <div v-bind="getConfig('pt.repeatable.actions')">
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
import { useAttrs, mergeProps } from 'vue'
import HeadlessRepeatable from '@/headless/HeadlessRepeatable'
import {
  RepeatableFieldSchema,
  useEnformaRepeatable,
} from './useEnformaRepeatable'
import { useFormConfig } from '@/utils/useFormConfig'

const props = withDefaults(defineProps<RepeatableFieldSchema>(), {
  validateOnAdd: true,
  validateOnRemove: true,
  if: true,
  min: 0,
  allowAdd: true,
  allowRemove: true,
  allowSort: true,
})

const $attrs = useAttrs()
const { isVisible, fields, component, componentProps } =
  useEnformaRepeatable(props)
const { getConfig } = useFormConfig()
</script>
