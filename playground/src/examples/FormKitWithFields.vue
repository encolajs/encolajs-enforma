<template>
  <FormKit
    class="grid grid-cols-4 gap-4"
    ref="$form"
    :data="data"
    :rules="rules"
    :custom-messages="messages"
    :submit-handler="submitHandler"
  >
    <template #default="formState">
      <div class="col-start-1 col-end-3 mb-4">
        <FormKitField
          name="name"
          label="Name"
          :type="InputText"
          :input-props="{ class: 'w-full' }"
        />
      </div>

      <div class="col-start-1 col-end-3 mb-4">
        <FormKitField
          name="email"
          label="Email"
          :type="InputText"
          :input-props="{ class: 'w-full' }"
        />
      </div>

      <div class="col-start-1 cols-end-2 mb-4">
        <FormKitField
          name="address.country"
          label="Country"
          :type="InputText"
          :input-props="{ class: 'w-full' }"
        />
      </div>

      <div class="col-start-2 cols-end-3 mb-4">
        <FormKitField
          name="address.city"
          label="City"
          :type="InputText"
          :input-props="{ class: 'w-full' }"
        />
      </div>

      <div class="col-start-1 col-end-3 mb-4">
        <FormKitField
          name="willing_to_relocate"
          :type="ToggleSwitch"
          :input-props="{
            class: 'me-2',
            trueValue: true,
            falseValue: false
          }"
        >
          <template #default="{ value }">
            <div class="flex align-center">
              <component
                :is="ToggleSwitch"
                :model-value="value"
                class="me-2"
                :true-value="true"
                :false-value="false"
                @update:model-value="formState.setFieldValue('willing_to_relocate', $event)"
              />
              <span @click="formState.setFieldValue('willing_to_relocate', !value)">
                Willing to relocate
              </span>
            </div>
          </template>
        </FormKitField>
      </div>

      <div class="col-start-1 cols-end-2 mb-4">
        <label class="block">Salary</label>
        <div class="flex align-items center gap-2">
          <FormKitField
            name="salary.min"
            :type="InputText"
            :input-props="{ placeholder: 'Min', style: 'width: 100px' }"
          />
          <FormKitField
            name="salary.max"
            :type="InputText"
            :input-props="{ placeholder: 'Max', style: 'width: 100px' }"
          />
        </div>
        <div v-if="formState['salary.min.$errors'] || formState['salary.max.errors']"
             class="text-red-500">
          {{ formState['salary.min.$errors'][0] || formState['salary.max.$errors'][0] }}
        </div>
      </div>

      <div class="col-start-2 col-end-3 mb-4">
        <FormKitField
          name="start_date"
          label="Available date"
          :type="DatePicker"
          :input-props="{
            dateFormat: 'yy-mm-dd',
            fluid: true
          }"
        >
          <template #default="{ value, events }">
            <DatePicker
              :model-value="value"
              date-format="yy-mm-dd"
              fluid
              v-on="events"
              @date-select="(date) => events.change({value: formatDate(date)})"
            />
          </template>
        </FormKitField>
      </div>

      <div class="col-start-1 col-end-2 mb-4">
        <FormKitField
          name="linkedin_profile"
          label="LinkedIn profile"
          :type="InputText"
          :input-props="{ class: 'w-full' }"
        />
      </div>

      <div class="col-start-2 col-end-3 mb-4">
        <FormKitField
          name="personal_site"
          label="Personal site"
          :type="InputText"
          :input-props="{ class: 'w-full' }"
        />
      </div>

      <h3 class="col-start-1 col-end-5 text-xl font-bold">Skills</h3>
      <div class="col-start-1 col-end-5 mb-4">
        <FormKitRepeatableTable 
          name="skills" 
          :min="0" 
          :max="1000"
          :subfields="{
            name: {
              type: InputText,
              label: 'Name'
            },
            level: {
              type: Select,
              label: 'Level',
              inputProps: {
                fluid: true,
                options: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
              }
            }
          }"
        >
        </FormKitRepeatableTable>
      </div>
    </template>
  </FormKit>
</template>

<script setup>
import FormKit from '@/../src/core/FormKit.vue'
import FormKitField from '@/../src/core/FormKitField.vue'
import {InputText, DatePicker, Select, Button, ToggleSwitch} from 'primevue'
import FormKitRepeatableTable from '@/core/FormKitRepeatableTable.vue'
import { ref } from 'vue'
import formConfig from '../utils/formConfig'

const $form = ref(null)

const {data, rules, messages, submitHandler} = formConfig

const formatDate = (date) => {
  if (!date) return ''
  return date.toISOString().split('T')[0]
}
</script>