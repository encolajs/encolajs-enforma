import SubmitButton from './primevue/SubmitButton.vue'
import ResetButton from './primevue/ResetButton.vue'
import { InputText, Select } from 'primevue'
import { FieldReturn, FormStateReturn } from '../types'

const fieldMap = {
  input: InputText,
  select: Select,
}

function fieldPropsTransformer(
  fieldProps: any,
  field: FieldReturn,
  formState: FormStateReturn,
  config: any
) {
  fieldProps.input.labelId = field.value.id
  fieldProps.input.modelValue = field.value.value
  fieldProps.component = fieldMap[fieldProps.component] || InputText
  return fieldProps
}

export default {
  components: {
    submitButton: SubmitButton,
    resetButton: ResetButton,
  },
  field_props_transformers: [fieldPropsTransformer],
}
