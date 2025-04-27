<template>
  <div v-bind="props.wrapper" class="vuetify-field">
    <div class="enforma-field-input">
      <component
        :is="props.inputComponent"
        v-model="fieldController.value"
        v-bind="props.input"
        v-on="fieldController.events"
      />
    </div>

    <!-- Error message -->
    <div v-if="errorMessage" class="enforma-field-error" v-bind="props.error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEnformaField } from '../../core/useEnformaField'
import { ComponentPublicInstance, PropType } from 'vue'

const originalProps = defineProps({
  name: { type: String, required: true },
  label: { type: String, default: null },
  inputComponent: {
    type: [String, Object] as PropType<string | ComponentPublicInstance | null>,
    default: null,
  },
  hideLabel: { type: Boolean, default: false },
  showLabelNextToInput: { type: Boolean, default: false },
  required: { type: [Boolean, String], default: undefined },
  help: { type: String, default: null },
  labelProps: { type: Object, default: () => ({}) },
  errorProps: { type: Object, default: () => ({}) },
  helpProps: { type: Object, default: () => ({}) },
  props: { type: Object, default: () => ({}) },
  inputProps: { type: Object, default: () => ({}) },
  // these are here only because they might be passed from the schema
  // they are not actually used for rendering
  section: { type: String, default: null },
  position: { type: Number, default: null },
})
// Use the extracted composable
const {
  fieldOptions,
  fieldController,
  errorMessage,
  requiredIndicator,
  props,
  t,
} = useEnformaField(originalProps)
</script>

<style>
.vuetify-field {
  margin-bottom: 16px;
  .enforma-field-error {
    padding-inline: 16px;
  }
}
.vuetify-field.enforma-field-invalid {
  .v-field__outline::after {
    border-color: red;
    transform: scaleX(1);
  }
}
</style>