<template>
  <EncolaHeadlessForm
    :data="data"
    :rules="rules"
    :customMessages="customMessages"
    :submitHandler="onSubmit"
    :validateOn="validateOn"
    :syncOn="syncOn"
  >
    <template
      v-slot="{ submit, reset, isValid, isDirty, isSubmitting, errors }"
    >
      <form @submit.prevent="submit">
        <div v-for="field in formFields" :key="field.name">
          <component
            :is="getFieldComponent(field.type)"
            :field="field"
            :errors="errors"
          />
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="!isValid || isSubmitting">
            {{ isSubmitting ? 'Submitting...' : submitText }}
          </button>
          <button type="button" @click="reset" v-if="showResetButton">
            Reset
          </button>
        </div>
      </form>
    </template>
  </EncolaHeadlessForm>
</template>

<script>
import { defineComponent, computed, h, ref, reactive } from 'vue'
import { EncolaHeadlessForm } from './HeadlessForm.ts'
import { useField } from './useField'

// Import field components
import TextFieldComponent from './fields/TextField.vue'
import SelectFieldComponent from './fields/SelectField.vue'
import CheckboxFieldComponent from './fields/CheckboxField.vue'
import TextareaFieldComponent from './fields/TextareaField.vue'

export default defineComponent({
  name: 'EncolaHeadlessFormUIKit',

  components: {
    EncolaHeadlessForm,
  },

  props: {
    /**
     * Form fields schema
     */
    fields: {
      type: Array,
      required: true,
      validator: (value) => {
        return value.every((field) => field.name && field.type)
      },
    },

    /**
     * Data source containing form data
     */
    data: {
      type: Object,
      required: true,
    },

    /**
     * Validation rules
     */
    rules: {
      type: Object,
      default: () => ({}),
    },

    /**
     * Custom validation messages
     */
    customMessages: {
      type: Object,
      default: () => ({}),
    },

    /**
     * When to trigger validation
     */
    validateOn: {
      type: String,
      default: 'blur',
    },

    /**
     * When to sync form data
     */
    syncOn: {
      type: String,
      default: 'blur',
    },

    /**
     * Submit button text
     */
    submitText: {
      type: String,
      default: 'Submit',
    },

    /**
     * Whether to show reset button
     */
    showResetButton: {
      type: Boolean,
      default: true,
    },
  },

  emits: ['submit', 'submit-error'],

  setup(props, { emit }) {
    // Process fields to add computed properties and methods
    const formFields = computed(() => {
      return props.fields.map((field) => {
        return {
          ...field,
          id: `field-${field.name.replace(/[\[\]\.]/g, '-')}`,
          labelFor: `input-${field.name.replace(/[\[\]\.]/g, '-')}`,
        }
      })
    })

    // Map field types to components
    const fieldComponentMap = {
      text: TextFieldComponent,
      email: TextFieldComponent,
      password: TextFieldComponent,
      number: TextFieldComponent,
      tel: TextFieldComponent,
      select: SelectFieldComponent,
      checkbox: CheckboxFieldComponent,
      textarea: TextareaFieldComponent,
    }

    // Helper to get the appropriate component for a field type
    const getFieldComponent = (type) => {
      return fieldComponentMap[type] || TextFieldComponent
    }

    // Submit handler
    const onSubmit = async (formData) => {
      try {
        emit('submit', formData)
      } catch (error) {
        emit('submit-error', error)
      }
    }

    return {
      formFields,
      getFieldComponent,
      onSubmit,
    }
  },
})
</script>
