<!-- src/core/FormKitRepeatable.vue -->
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
        <!-- Items container -->
        <div :class="getConfig('classes.repeatable.items_list')">
          <div
            v-for="(item, index) in value"
            :key="index"
            :class="getConfig('classes.repeatable.item')"
          >
            <!-- Subfields -->
            <template
              v-for="(subfield, subfieldName) in fields"
              :key="subfieldName"
            >
              <FormKitField
                v-bind="subfield"
                :name="`${name}.${index}.${subfieldName}`"
              />
            </template>

            <!-- Actions -->
            <div :class="getConfig('classes.repeatable.actions_buttons')">
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
        <div :class="getConfig('classes.repeatable.actions')">
          <component
            v-if="canAdd"
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
