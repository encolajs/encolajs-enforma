<template>
  <HeadlessForm
    class="grid grid-cols-2 gap-4"
    ref="$form"
    :data="data"
    :rules="rules"
    :custom-messages="messages"
    :submit-handler="submitHandler"
  >
    <template #default="formCtrl">
      <div class="col-start-1 col-end-3">
        <AppFormField name="name" label="Name">
          <template #default="fieldCtrl">
            <div class="flex">
              <!--
              This field is using v-model to pass data.
              Because of this we cannot use destructuring, we must use `fieldCtrl`
              The rest of the fields are using `attrs` (which includes `value`)
              plus `events` because it offers greater flexibility
              -->
              <InputText
                :id="fieldCtrl.id"
                class="w-full"
                v-bind="fieldCtrl.attrs"
                v-model="fieldCtrl.model"
              />
            </div>
            <code>Attributes passed: {{fieldCtrl.attrs}}</code>
          </template>
        </AppFormField>
      </div>

      <div class="col-start-1 col-end-3">
        <AppFormField name="email" label="Email">
          <template #default="{ attrs, events, id }">
            <InputText
              :id="id"
              class="w-full"
              v-bind="attrs"
              v-on="events"
            />
            <code>Events bound: {{Object.keys(events)}}</code>
          </template>
        </AppFormField>
      </div>

      <div class="col-start-1 cols-end-2">
        <AppFormField name="address.country" label="Country">
          <template #default="{ attrs, events, id }">
            <InputText
              :id="id"
              class="w-full"
              v-bind="attrs"
              v-on="events"
            />
          </template>
        </AppFormField>
      </div>

      <div class="col-start-2 cols-end-3">
        <AppFormField name="address.city" label="City">
          <template #default="{ attrs, events, id }">
            <InputText
              :id="id"
              class="w-full"
              v-bind="attrs"
              v-on="events"
            />
          </template>
        </AppFormField>
      </div>

      <div class="col-start-1 col-end-3">
        <AppFormField name="willing_to_relocate">
          <template #default="{ value, attrs, events, id }">
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
              <span @click="formCtrl.setFieldValue('willing_to_relocate', !value)">Willing to relocate</span>
            </div>
          </template>
        </AppFormField>
      </div>

      <div class="col-start-1 cols-end-2">
        <label class="block">Salary</label>
        <div class="flex align-items center gap-2">
          <AppFormField name="salary.min">
            <template #default="{ attrs, events, id }">
              <InputText
                :id="id"
                placeholder="Min"
                style="width: 100px"
                v-bind="attrs"
                v-on="events"
              />
            </template>
          </AppFormField>
          <AppFormField name="salary.max">
            <template #default="{ attrs, events, id }">
              <InputText
                :id="id"
                placeholder="Max"
                style="width: 100px"
                v-bind="attrs"
                v-on="events"
              />
            </template>
          </AppFormField>
        </div>
        <div v-if="formCtrl['salary.min.$errors'] || formCtrl['salary.max.errors']"
             class="text-red-500">
          {{ formCtrl['salary.min.$errors'][0] || formCtrl['salary.max.$errors'][0] }}
        </div>
      </div>

      <div class="col-start-2 col-end-3">
        <AppFormField name="start_date" label="Available date">
          <template #default="{ value, attrs, events, id }">
            <DatePicker
              :id="id"
              :model-value="value"
              date-format="yy-mm-dd"
              fluid
              v-bind="attrs"
              v-on="events"
              @update:model-value="(date) => events.change({value: date})"
            />
          </template>
        </AppFormField>
      </div>

      <div class="col-start-1 col-end-2">
        <AppFormField name="linkedin_profile" label="LinkedIn profile">
          <template #default="{ attrs, events, id }">
            <div class="flex">
              <InputText
                :id="id"
                class="w-full"
                v-bind="attrs"
                v-on="events"
              />
            </div>
          </template>
        </AppFormField>
      </div>

      <div class="col-start-2 col-end-3">
        <AppFormField name="personal_site" label="Personal site">
          <template #default="{ attrs, events, id }">
            <div class="flex">
              <InputText
                :id="id"
                class="w-full"
                v-bind="attrs"
                v-on="events"
              />
            </div>
          </template>
        </AppFormField>
      </div>

      <h3 class="col-start-1 col-end-5 text-xl font-bold">Skills</h3>
      <div class="col-start-1 col-end-5">
        <HeadlessRepeatable name="skills" :min="0" :max="1000">
          <template #default="{ value, add, remove, canAdd, canRemove, moveUp, moveDown, move, count }">
            <table class="mb-4 table-auto border-spacing-2">
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
                  <AppFormField :name="`skills.${index}.name`">
                    <template #default="{ attrs, events, id }">
                      <InputText
                        :id="id"
                        v-bind="attrs"
                        v-on="events"
                      />
                    </template>
                  </AppFormField>
                </td>
                <td class="p-2">
                  <AppFormField :name="`skills.${index}.level`">
                    <template #default="{ value, attrs, events, id }">
                      <Select
                        :label-id="id"
                        :model-value="value"
                        fluid
                        :options="['Beginner', 'Intermediate', 'Advanced', 'Expert']"
                        v-bind="attrs"
                        v-on="events"
                      />
                    </template>
                  </AppFormField>
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
                @click="add({ name: '', level: '' }, 2)"
                class="mr-2"
              />
            </div>
          </template>
        </HeadlessRepeatable>
      </div>

      <h3 class="col-start-1 col-end-5 text-xl font-bold">Experience</h3>
      <div class="col-start-1 col-end-3">
        <HeadlessRepeatable name="experience" :min="0" :max="100">
          <template #default="{ value, add, remove, canAdd, canRemove, moveUp, moveDown, count }">
            <div
              v-for="(experience, index) in value"
              :key="index"
              class="grid grid-cols-2 gap-4 mb-8"
            >
              <AppFormField :name="`experience.${index}.company`" label="Company">
                <template #default="{ attrs, events, id }">
                  <InputText
                    :id="id"
                    fluid
                    v-bind="attrs"
                    v-on="events"
                  />
                </template>
              </AppFormField>

              <AppFormField :name="`experience.${index}.position`" label="Position">
                <template #default="{ attrs, events, id }">
                  <InputText
                    :id="id"
                    fluid
                    v-bind="attrs"
                    v-on="events"
                  />
                </template>
              </AppFormField>

              <AppFormField :name="`experience.${index}.start`" label="Start">
                <template #default="{ value, attrs, events, id }">
                  <DatePicker
                    :id="id"
                    :model-value="new Date(value)"
                    date-format="yy-mm-dd"
                    fluid
                    v-bind="attrs"
                    @blur="events.blur"
                    @focus="events.focus"
                    @update:modelValue="(date) => events.change({value: date})"
                  />
                </template>
              </AppFormField>

              <ExperienceEndDateField
                :name="`experience.${index}.end`"
                :form="formCtrl"
              />

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
            <div class="mb-4">
              <Button
                severity="secondary"
                type="button"
                icon="pi pi-plus"
                label="Add Experience"
                @click="add({})"
                :disabled="!canAdd"
                class="mr-2"
              />
            </div>
          </template>
        </HeadlessRepeatable>
      </div>

      <div class="col-start-1 col-end-4 flex gap-2">
        <Button
          severity="primary"
          :loading="formCtrl.$isSubmitting"
          :label="formCtrl.$isSubmitting ? 'Submitting...' : 'Submit'"
          type="submit"
        />
        <Button
          severity="secondary"
          :loading="formCtrl.$isSubmitting"
          :label="'Reset'"
          type="reset"
        />
      </div>
    </template>
  </HeadlessForm>
</template>

<script setup>
import { HeadlessForm, HeadlessRepeatable } from '../../../src'
import { InputText, Select, Button, ToggleSwitch, DatePicker} from 'primevue'
import { ref } from 'vue'
import AppFormField from './AppFormField.vue'
import ExperienceEndDateField from './ExperienceEndDateField.vue'
import formConfig from './formConfig'

const {data, rules, messages, submitHandler} = formConfig

const $form = ref(null)
</script>