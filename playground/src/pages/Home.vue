<template>
  <h1 class="text-2xl font-bold mb-4">Form with headless components</h1>
  <p class="mb-12">
    This page is designed to demonstrate how to use the headless components in a form.<br>
    This gives the greatest flexibility in terms of styling and layout.<br>
    Usually you will create your own application components that wrap the <code>HeadlessField</code> component.
  </p>
  <HeadlessForm
    class="grid grid-cols-4 gap-4"
    ref="$form"
    :data="data"
    :rules="rules"
    :custom-messages="customMessages"
    :submit-handler="submitHandler"
  >
    <template #default="formState">
      <div class="col-start-1 col-end-3 mb-4">
        <HeadlessField
          name="name">
          <template #default="{ value, attrs, error, events, id }">
            <label class="block" :for="id">Name</label>
            <div class="flex">
              <InputText
                :id="id"
                class="w-full"
                v-bind="attrs"
                v-on="events"
              />
            </div>
            <div v-if="error"
                 :id="attrs['aria-errormessage']"
                 class="text-red-500">
              {{ error }}
            </div>
          </template>
        </HeadlessField>
      </div>

      <div class="col-start-1 col-end-3 mb-4">
        <HeadlessField
          name="email">
          <template #default="{ value, attrs, error, events, id }">
            <label class="block" :for="id">Email</label>
            <InputText
              :id="id"
              class="w-full"
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
      <div class="col-start-1 cols-end-2 mb-4">
        <HeadlessField
          name="address.country">
          <template #default="{ value, attrs, error, events, id }">
            <label class="block" :for="id">Country</label>
            <InputText
              :id="id"
              class="w-full"
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
      <div class="col-start-2 cols-end-3 mb-4">
        <HeadlessField
          name="address.city">
          <template #default="{ value, attrs, error, events, id }">
            <label class="block" :for="id">City</label>
            <InputText
              :id="id"
              class="w-full"
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

      <div class="col-start-1 col-end-3 mb-4">
        <HeadlessField
          name="willing_to_relocate">
          <template #default="{ value, attrs, error, events, id }">
            <div class="flex align-center">
              <ToggleSwitch
                :id="id"
                class="me-2"
                :model-value="value"
                :true-value="true"
                :false-value="false"
                v-bind="attrs"
                v-on="events"
              />
              <span @click="formState.setFieldValue('willing_to_relocate', !value)">Willing to relocate</span>
            </div>
            <div v-if="error"
                 :id="attrs['aria-errormessage']"
                 class="text-red-500">
            </div>
          </template>
        </HeadlessField>
      </div>

      <div class="col-start-1 cols-end-2 mb-4">
            <label class="block">Salary</label>
            <div class="flex align-items center gap-2">
              <HeadlessField
                name="salary.min">
                <template #default="{ value, attrs, error, events, id }">
                  <InputText
                    :id="id"
                    placeholder="Min"
                    style="width: 100px"
                    v-bind="attrs"
                    v-on="events"
                  />
                </template>
              </HeadlessField>
              <HeadlessField
                name="salary.max">
                <template #default="{ value, attrs, error, events, id }">
                  <InputText
                    :id="id"
                    placeholder="Max"
                    style="width: 100px"
                    v-bind="attrs"
                    v-on="events"
                  />
                </template>
              </HeadlessField>
            </div>
            <div v-if="formState.errors['salary.min'] || formState.errors['salary.max']"
                 class="text-red-500">
              {{ formState.errors['salary.min'][0] || formState.errors['salary.max'][0] }}
            </div>
      </div>

      <div class="col-start-2 col-end-3 mb-4">
        <HeadlessField
          name="start_date">
          <template #default="{ value, attrs, error, events, id }">
            <label class="block" :for="id">Available date</label>
            <DatePicker
              :id="id"
              :model-value="value"
              date-format="yy-mm-dd"
              fluid
              v-bind="attrs"
              v-on="events"
              @date-select="(date) => events.change({value: formatDate(date)})"
            />
            <div v-if="error"
                 :id="attrs['aria-errormessage']"
                 class="text-red-500">
              {{ error }}
            </div>
          </template>
        </HeadlessField>
      </div>


      <div class="col-start-1 col-end-2 mb-4">
        <HeadlessField
          name="linkedin_profile">
          <template #default="{ value, attrs, error, events, id }">
            <label class="block" :for="id">LinkedIn profile</label>
            <div class="flex">
              <InputText
                :id="id"
                class="w-full"
                v-bind="attrs"
                v-on="events"
              />
            </div>
            <div v-if="error"
                 :id="attrs['aria-errormessage']"
                 class="text-red-500">
              {{ error }}
            </div>
          </template>
        </HeadlessField>
      </div>

      <div class="col-start-2 col-end-3 mb-4">
        <HeadlessField
          name="personal_site">
          <template #default="{ value, attrs, error, events, id }">
            <label class="block" :for="id">Personal site</label>
            <div class="flex">
              <InputText
                :id="id"
                class="w-full"
                v-bind="attrs"
                v-on="events"
              />
            </div>
            <div v-if="error"
                 :id="attrs['aria-errormessage']"
                 class="text-red-500">
              {{ error }}
            </div>
          </template>
        </HeadlessField>
      </div>

      <h3 class="col-start-1 col-end-5 text-xl font-bold">Skills</h3>
      <div class="col-start-1 col-end-5 mb-4">
        <HeadlessRepeatable name="skills" :min="0" :max="100">
        <template #default="{ value, add, remove, canAdd, canRemove, moveUp, moveDown, move, count }">

          <table class="mb-4 table-auto border-spacing-2" v-if="count > 0">
            <thead>
            <tr>
              <th>Name</th>
              <th>Level</th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(skill, index) in value" :key="index">
              <td class="p-2">
                <HeadlessField
                  :name="`skills.${index}.name`">
                  <template #default="field">
                    <InputText
                      :id="field.id"
                      v-bind="field.attrs"
                      v-on="field.events"
                    />
                    <div v-if="field.error"
                         :id="field.attrs['aria-errormessage']"
                         class="text-red-500">
                      {{ field.error }}
                    </div>
                  </template>
                </HeadlessField>
              </td>
              <td class="p-2">
                <HeadlessField
                  :name="`skills.${index}.level`">
                  <template #default="{ value, attrs, error, events, id }">
                    <Select
                      :label-id="id"
                      :model-value="value"
                      fluid
                      :options="['Beginner', 'Intermediate', 'Advanced', 'Expert']"
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
              <td class="p-2">
                <div class="flex gap-2">
                  <Button
                    severity="danger"
                    type="button"
                    :disabled="!canRemove"
                    @click="remove(index)"
                    icon="pi pi-trash"
                  />
                  <Button
                    severity="secondary"
                    type="button"
                    @click="moveUp(index)"
                    icon="pi pi-arrow-up"
                    title="Move up"
                  />
                  <Button
                    severity="secondary"
                    type="button"
                    @click="moveDown(index)"
                    icon="pi pi-arrow-down"
                    title="Move Down"
                  />
                </div>
              </td>
            </tr>
            </tbody>
          </table>
          <div class="mb-4">
            <Button
              severity="secondary"
              type="button"
              icon="pi pi-plus"
              label="Add Skill"
              @click="add({ name: '', level: '' }, 0)"
              :disabled="!canAdd"
              class="mr-2"
            />
            <Button
              severity="secondary"
              type="button"
              icon="pi pi-up"
              label="Move last to top"
              @click="move(value.length - 1, 0)"
              :disabled="!canAdd"
              class="mr-2"
            />
          </div>
        </template>
      </HeadlessRepeatable>
      </div>

      <h3 class="col-start-1 col-end-5 text-xl font-bold">Experience</h3>
      <div class="col-start-1 col-end-3 mb-4">
        <HeadlessRepeatable name="experience" :min="0" :max="100">
        <template #default="{ value, add, remove, canAdd, canRemove, moveUp, moveDown, count }">

          <div v-for="(experience, index) in value" :key="index">
            <div class="grid grid-cols-2 gap-4 mb-8">
              <HeadlessField
                :name="`experience.${index}.company`">
                <template #default="{ value, attrs, error, events, id }">
                  <div>
                    <label :for="id">Company</label>
                    <InputText
                      :id="id"
                      fluid
                      v-bind="attrs"
                      v-on="events"
                    />
                    <div v-if="error"
                         :id="attrs['aria-errormessage']"
                         class="text-red-500">
                      {{ error }}
                    </div>
                  </div>
                </template>
              </HeadlessField>
              <HeadlessField
                :name="`experience.${index}.position`">
                <template #default="{ value, attrs, error, events, id }">
                  <div>
                    <label :for="id">Position</label>
                    <InputText
                      :id="id"
                      fluid
                      v-bind="attrs"
                      v-on="events"
                    />
                    <div v-if="error"
                         :id="attrs['aria-errormessage']"
                         class="text-red-500">
                      {{ error }}
                    </div>
                  </div>
                </template>
              </HeadlessField>
              <HeadlessField
                :name="`experience.${index}.start`">
                <template #default="{ value, attrs, error, events, id }">
                  <div>
                    <label :for="id">Start</label>
                    <DatePicker
                      :id="id"
                      :model-value="value"
                      date-format="yy-mm-dd"
                      fluid
                      v-bind="attrs"
                      v-on="events"
                      @date-select="(date) => events.change({value: formatDate(date)})"
                    />
                    <div v-if="error"
                         :id="attrs['aria-errormessage']"
                         class="text-red-500">
                      {{ error }}
                    </div>
                  </div>
                </template>
              </HeadlessField>
              <HeadlessField
                :names="{end: `experience.${index}.end`, current: `experience.${index}.current`}">
                <template #default="{end, current}">
                  <div>
                    <label :for="end.id">End</label>
                    <DatePicker
                      :id="end.id"
                      :model-value="end.value"
                      date-format="yy-mm-dd"
                      fluid
                      :disabled="current.value"
                      v-bind="end.attrs"
                      v-on="end.events"
                      @date-select="(date) => end.events.change({value: formatDate(date)})"
                    />
                    <div class="flex align-center mt-2">
                      <ToggleSwitch
                        :id="current.id"
                        class="me-2"
                        :model-value="current.value"
                        v-bind="current.attrs"
                        :true-value="true"
                        :false-value="false"
                        @change="(evt) => onChangeExperienceCurrent(index, evt.srcElement?.checked)"
                      />
                      <span @click="onChangeExperienceCurrent(index, !current.value)">Currently working here</span>
                    </div>
                    <div v-if="end.error"
                         :id="end.attrs['aria-errormessage']"
                         class="text-red-500">
                      {{ end.error }}
                    </div>
                  </div>
                </template>
              </HeadlessField>
              <div class="col-span-2 flex gap-2 items-right place-content-end">
                <Button
                  severity="danger"
                  type="button"
                  :disabled="!canRemove"
                  @click="remove(index)"
                  icon="pi pi-trash"
                />
                <Button
                  severity="secondary"
                  type="button"
                  @click="moveUp(index)"
                  icon="pi pi-arrow-up"
                  title="Move up"
                />
                <Button
                  severity="secondary"
                  type="button"
                  @click="moveDown(index)"
                  icon="pi pi-arrow-down"
                  title="Move Down"
                />
              </div>
            </div>
          </div>
          <div class="mb-4">
            <Button
              severity="secondary"
              type="button"
              icon="pi pi-plus"
              label="Add Experience"
              @click="add({ })"
              :disabled="!canAdd"
              class="mr-2"
            />
          </div>
        </template>
      </HeadlessRepeatable>
      </div>

      <div class="col-start-1 col-end-4 mb-4">
        <Button
          severity="primary"
          :loading="formState.isSubmitting.value"
          :label="formState.isSubmitting.value ? 'Submitting...' : 'Submit'"
          type="submit"
        />
      </div>
    </template>
  </HeadlessForm>
</template>

<script setup>
import { HeadlessForm, HeadlessField, HeadlessRepeatable } from '../../../src'
import { InputText, Select, Button, ToggleSwitch, DatePicker} from 'primevue'
import { ref } from 'vue'

const data = {
  name: '',
  email: '',
  address: {
    country: null,
    city: null,
  },
  willing_to_relocate: false,
  skills: [],
  experience: [],
}
for (let i = 0; i < 5; i++) {
  let level = ['Beginner', 'Intermediate', 'Advanced', 'Expert'].sort(() => Math.random() - 0.5)[0]
  data.skills.push({ name: Math.random().toString(36).substring(5), level })
}

const rules = {
  name: 'required',
  email: 'required|email',
  'salary.min': 'number',
  'salary.max': 'number',
  'start_date': 'required|date|date_after:' + (new Date().toISOString().split('T')[0]),
  'address.city': 'required',
  'address.country': 'required',
  'linkedin_profile': 'required|url',
  'personal_site': 'url',
  'skills.*.name': 'required',
  'skills.*.level': 'required',
  'experience.*.company': 'required',
  'experience.*.position': 'required',
  'experience.*.start': 'required|date',
  'experience.*.end': 'required_when:@experience.*.current,false|date',

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

const onChangeExperienceCurrent = (index, value) => {
  $form.value.setFieldValue(`experience.${index}.current`, value)
  $form.value.setFieldValue(`experience.${index}.end`, null)
  $form.value.validateField(`experience.${index}.end`, true)
}

const formatDate = (date) => {
  return date.toISOString().split('T')[0]
}

const $form = ref(null)

</script>