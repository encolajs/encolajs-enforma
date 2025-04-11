import SubmitButton from './primevue/SubmitButton.vue'
import ResetButton from './primevue/ResetButton.vue'
import { InputText, Select } from 'primevue'
import { FieldController, FormController } from '@/types'
import { DeepPartial, FormKitConfig } from '@/utils/useConfig'

const fieldMap: Record<string, any> = {
  input: InputText,
  select: Select,
}

function fieldPropsTransformer(
  fieldProps: any,
  field: FieldController,
  formState: FormController,
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
  transformers: {
    field_props: [fieldPropsTransformer],
  },
} as DeepPartial<FormKitConfig>
