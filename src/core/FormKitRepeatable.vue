<!-- src/core/FormKitRepeatable.vue -->
<template>
  <div
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.wrapper'))"
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
            v-for="(_, index) in value"
            :key="index"
            v-bind="getConfig('pt.repeatable.item')"
          >
            <!-- Subfields -->
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

            <!-- Actions -->
            <div v-bind="getConfig('pt.repeatable.itemActions')">
              <component
                :is="
                  removeButton || getConfig('components.repeatableRemoveButton')
                "
                @click="remove(index)"
              />
              <component
                :is="
                  moveUpButton || getConfig('components.repeatableMoveUpButton')
                "
                :disabled="index === 0"
                @click="moveUp(index)"
              />
              <component
                :is="
                  moveDownButton ||
                  getConfig('components.repeatableMoveDownButton')
                "
                :disabled="index >= count - 1"
                @click="moveDown(index)"
              />
            </div>
          </div>
        </div>

        <!-- Add button -->
        <div v-bind="getConfig('pt.repeatable.actions')">
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
  useFormKitRepeatable,
} from './useFormKitRepeatable'
import { useFormConfig } from '@/utils/useFormConfig'

const props = withDefaults(defineProps<RepeatableFieldSchema>(), {
  validateOnAdd: true,
  validateOnRemove: false,
  if: true,
  min: 0,
})

const $attrs = useAttrs()
const { isVisible, fields } = useFormKitRepeatable(props)
const { getConfig } = useFormConfig()
</script>
