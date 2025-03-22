<template>
  <HeadlessForm
    :data="data"
    :rules="rules"
    :custom-messages="customMessages"
    :submit-handler="submitHandler"
  >
    <template #default="formState">
      <div class="mb-4">
        <HeadlessField
          name="name">
          <template #default="{ value, attrs, error, events, id }">
            <label class="block" :for="id">Name</label>
            <InputText
              :id="id"
              v-bind="attrs"
              v-on="events"
            />
            <div v-if="error"
                 :id="attrs['aria-errormessage']"
                 class="text-red-500">
              {{ error }}
            </div>
          </template>
        </HeadlessField>
      </div>
      <Button
        severity="warn"
        type="button"
        @click="formState.setFieldValue('name', 'Wow', 'blur')"
      >
        Set name
      </Button>


      <div class="mb-4">
        <HeadlessField
          name="email">
          <template #default="{ value, attrs, error, events, id }">
            <label class="block" :for="id">Email</label>
            <InputText
              :id="id"
              v-bind="attrs"
              v-on="events"
            />
            <div v-if="error"
                 :id="attrs['aria-errormessage']"
                 class="text-red-500">
              {{ error }}
            </div>
          </template>
        </HeadlessField>
      </div>

      <div class="mb-4">
        <HeadlessField
          name="age">
          <template #default="{ value, attrs, error, events, id }">
            <label class="block" :for="id">Age</label>
            <Select
              v-bind="{...attrs, modelValue: value, labelId: id, options: [10, 20, 30, 40]}"
              v-on="events"
            />
            <div v-if="error"
                 :id="attrs['aria-errormessage']"
                 class="text-red-500">
              {{ error }}
            </div>
          </template>
        </HeadlessField>
      </div>

      <HeadlessRepeatable name="friends" :min="0" :max="4">
        <template #default="{ value, add, remove, canAdd, canRemove, moveUp, moveDown, count }">
          {{ value }}
          <table class="mb-4" v-if="count > 0">
            <thead>
            <tr>
              <th>Name</th>
              <th>Origin</th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(friend, index) in value" :key="index">
              <td>
                <HeadlessField
                  :name="`friends.${index}.name`">
                  <template #default="{ value, attrs, error, events, id }">
                    <InputText
                      :id="id"
                      v-bind="attrs"
                      v-on="events"
                    />
                    {{ id }}
                    <div v-if="error"
                         :id="attrs['aria-errormessage']"
                         class="text-red-500">
                      {{ error }}
                    </div>
                  </template>
                </HeadlessField>
              </td>
              <td>
                <HeadlessField
                  :name="`friends.${index}.origin`">
                  <template #default="{ value, attrs, error, events, id }">
                    <InputText
                      :id="id"
                      v-bind="attrs"
                      v-on="events"
                    />
                    <div v-if="error"
                         :id="attrs['aria-errormessage']"
                         class="text-red-500">
                      {{ error }}
                    </div>
                  </template>
                </HeadlessField>
              </td>
              <td>
                <Button
                  severity="danger"
                  type="button"
                  :disabled="!canRemove"
                  @click="remove(index)"
                >
                  Remove
                </Button>
                <Button
                  severity="secondary"
                  type="button"
                  @click="moveUp(index)"
                >
                  Up
                </Button>
                <Button
                  severity="secondary"
                  type="button"
                  @click="moveDown(index)"
                >
                  Down
                </Button>
              </td>
            </tr>
            </tbody>
          </table>
          <div class="mb-4">
            <Button
              severity="secondary"
              type="button"
              @click="add({ name: '', origin: '' })"
              :disabled="!canAdd"
            >
              Add Friend
            </Button>
          </div>
        </template>
      </HeadlessRepeatable>

      <div>
        <Button
          severity="primary"
          :disabled="formState.isSubmitting.value"
          type="submit"
        >
          {{ formState.isSubmitting.value ? 'Submitting...' : 'Submit' }}
        </Button>
      </div>
    </template>
  </HeadlessForm>
</template>

<script setup>
import { HeadlessForm, HeadlessField, HeadlessRepeatable } from '../../../src'
import { InputText, Select, Button} from 'primevue'
import { nextTick } from 'vue'

const data = {
  name: '',
  email: 'john@example.com',
  age: 30,
  friends: [],
}

const rules = {
  name: 'required',
  email: 'required|email',
  age: 'required|number|gt:20|lt:100',
  'friends.*.name': 'required',
  'friends.*.origin': 'required',
}

const customMessages = {
  'name.required': 'You gotta have a name'
}

const submitHandler = async (formData) => {
  return new Promise((resolve) => {
    console.log(formData)
    setTimeout(resolve, 2000)
  })
}

</script>