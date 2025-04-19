<!-- src/core/EnformaRepeatable.vue -->
<template>
  <div
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.wrapper') || {})"
    v-if="isVisible"
    :style="animationStyles"
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
          <!-- Use TransitionGroup for animations when enabled -->
          <TransitionGroup
            v-if="useAnimations"
            name="repeatable-item"
            tag="div"
            class="repeatable-items-container"
            @before-leave="onBeforeItemLeave"
          >
            <div
              v-for="(itemValue, index) in value"
              :key="getItemKey(index)"
              class="repeatable-item"
              v-bind="getConfig('pt.repeatable.item')"
            >
              <!-- Component-based subfields -->
              <template v-if="component">
                <component
                  :is="component"
                  :name="`${name}.${index}`"
                  :index="index"
                  :value="itemValue"
                  :list-length="count"
                  v-bind="componentProps || {}"
                />
              </template>

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
                <div v-if="!component && fields && (showDeleteButton || showMoveButtons)" v-bind="getConfig('pt.repeatable.itemActions')">
                  <component
                    v-if="showDeleteButton"
                    :is="
                      removeButton ||
                      getConfig('components.repeatableRemoveButton')
                    "
                    @click="handleRemove(remove, index)"
                  />
                  <component
                    v-if="showMoveButtons"
                    :is="
                      moveUpButton ||
                      getConfig('components.repeatableMoveUpButton')
                    "
                    :disabled="index === 0"
                    @click="handleMoveUp(moveUp, index)"
                  />
                  <component
                    v-if="showMoveButtons"
                    :is="
                      moveDownButton ||
                      getConfig('components.repeatableMoveDownButton')
                    "
                    :disabled="index >= count - 1"
                    @click="handleMoveDown(moveDown, index)"
                  />
                </div>
              </template>

            </div>
          </TransitionGroup>

          <!-- Non-animated version when animations are disabled -->
          <template v-else>
            <div
              v-for="(itemValue, index) in value"
              :key="index"
              v-bind="getConfig('pt.repeatable.item')"
            >
              <!-- Subfields -->
              <template v-if="fields">
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
                <div v-if="showDeleteButton || showMoveButtons" v-bind="getConfig('pt.repeatable.itemActions')">
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
          </template>
        </div>

        <!-- Add button -->
        <div v-bind="getConfig('pt.repeatable.actions')">
          <component
            v-if="canAdd"
            :is="addButton || getConfig('components.repeatableAddButton')"
            @click="handleAdd(add, defaultValue)"
          />
        </div>
      </template>
    </HeadlessRepeatable>
  </div>
</template>

<script setup lang="ts">
import { useAttrs, mergeProps, ref, nextTick } from 'vue'
import HeadlessRepeatable from '@/headless/HeadlessRepeatable'
import {
  RepeatableFieldSchema,
  RepeatableAnimationOptions,
  useEnformaRepeatable,
} from './useEnformaRepeatable'
import { useFormConfig } from '@/utils/useFormConfig'

const props = withDefaults(defineProps<RepeatableFieldSchema>(), {
  validateOnAdd: true,
  validateOnRemove: true,
  if: true,
  min: 0,
  animations: true,
  showDeleteButton: true,
  showMoveButtons: true,
})

const $attrs = useAttrs()
const { isVisible, fields, component, componentProps, useAnimations, animationStyles } =
  useEnformaRepeatable(props)
const { getConfig } = useFormConfig()

// Used to store unique keys for items to maintain animation state
const itemKeys = ref<Map<number, string>>(new Map())

// Generate stable keys for each item to maintain animation state
const getItemKey = (index: number): string => {
  if (!itemKeys.value.has(index)) {
    itemKeys.value.set(
      index,
      `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    )
  }
  return itemKeys.value.get(index) || `fallback-${index}`
}

// Animation handlers
const onBeforeItemLeave = (el: Element): void => {
  const element = el as HTMLElement
  // Store the element's height before it's removed
  element.style.height = `${element.offsetHeight}px`
  element.style.overflow = 'hidden'
  // Force a repaint to ensure the starting height is applied
  void element.offsetHeight
}

// Wrapper for add action
const handleAdd = (add: (value?: any) => void, defaultValue?: any): void => {
  add(defaultValue)
}

// Wrapper for remove action
const handleRemove = (remove: (index: number) => void, index: number): void => {
  remove(index)
}

// Wrapper for moveUp action
const handleMoveUp = (moveUp: (index: number) => void, index: number): void => {
  if (index > 0) {
    moveUp(index)
  }
}

// Wrapper for moveDown action
const handleMoveDown = (
  moveDown: (index: number) => void,
  index: number
): void => {
  moveDown(index)
}
</script>

<style>
.repeatable-items-container {
  position: relative;
}

.repeatable-item {
  transition-property: opacity, transform;
  transition-duration: var(--repeatable-animation-duration, 300ms);
  transition-timing-function: var(--repeatable-animation-easing, ease);
  position: relative;
  backface-visibility: hidden;
}

/* Enter transitions */
.repeatable-item-enter-active {
  transition-property: opacity, transform;
  transition-duration: var(--repeatable-animation-duration, 300ms);
  transition-timing-function: var(--repeatable-animation-easing, ease);
}

.repeatable-item-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

/* Leave transitions */
.repeatable-item-leave-active {
  position: absolute;
  width: 100%;
  transition-property: opacity, height, transform;
  transition-duration: var(--repeatable-animation-duration, 300ms);
  transition-timing-function: var(--repeatable-animation-easing, ease);
}

.repeatable-item-leave-to {
  opacity: 0;
  height: 0 !important;
  transform: translateY(20px);
}

/* Move transitions */
.repeatable-item-move {
  transition-property: transform;
  transition-duration: var(--repeatable-animation-duration, 300ms);
  transition-timing-function: var(--repeatable-animation-easing, ease);
}
</style>
