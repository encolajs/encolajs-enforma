<template>
  <HeadlessForm
    class="grid grid-cols-2 gap-4"
    ref="$form"
    :data="data"
    :validator="validator"
    
    :submit-handler="submitHandler"
  >
    <template #default="formCtrl">
      <div class="col-start-1 col-end-3">
        <AppFormField name="name" label="Name">
          <template #default="{ attrs, events, id, error }">
            <div class="flex">
              <!--
              This field is now using attrs and events for consistency.
              This approach offers greater flexibility and avoids
              potential conflicts with v-model binding.
              -->
              <UInput
                :id="id"
                class="w-full"
                :color="error ? 'error' : undefined"
                :highlight="!!error"
                v-bind="attrs"
                v-on="events"
              />
            </div>
            <code>Attributes passed: {{attrs}}</code>
          </template>
        </AppFormField>
      </div>

      <div class="col-start-1 col-end-3">
        <AppFormField name="email" label="Email">
          <template #default="{ attrs, events, id, error }">
            <UInput
              :id="id"
              class="w-full"
              :color="error ? 'error' : undefined"
              :highlight="!!error"
              v-bind="attrs"
              v-on="events"
            />
            <code>Events bound: {{Object.keys(events)}}</code>
          </template>
        </AppFormField>
      </div>

      <div class="col-start-1 cols-end-2">
        <AppFormField name="address.country" label="Country">
          <template #default="{ attrs, events, id, error }">
            <UInput
              :id="id"
              class="w-full"
              :color="error ? 'error' : undefined"
              :highlight="!!error"
              v-bind="attrs"
              v-on="events"
            />
          </template>
        </AppFormField>
      </div>

      <div class="col-start-2 cols-end-3">
        <AppFormField name="address.city" label="City">
          <template #default="{ attrs, events, id, error }">
            <UInput
              :id="id"
              class="w-full"
              :color="error ? 'error' : undefined"
              :highlight="!!error"
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
              <!--
              USwitch and USelect only report the new value
              through `update:modelValue`, so we listen to that
              instead of binding the native events
              -->
              <USwitch
                :id="id"
                class="me-2"
                :model-value="value"
                v-bind="attrs"
                @update:model-value="(checked) => formCtrl.setFieldValue('willing_to_relocate', checked)"
              />
              <span @click="formCtrl.setFieldValue('willing_to_relocate', !value)">Willing to relocate</span>
            </div>
          </template>
        </AppFormField>
      </div>

      <div class="col-start-1 cols-end-2">
        <label class="block">Salary</label>
        <div class="grid grid-cols-2 gap-2">
          <AppFormField name="salary.min">
            <template #default="{ attrs, events, id }">
              <UInput
                :id="id"
                placeholder="Min"
                class="w-full"
                v-bind="attrs"
                v-on="events"
              />
            </template>
          </AppFormField>
          <AppFormField name="salary.max">
            <template #default="{ attrs, events, id }">
              <UInput
                :id="id"
                placeholder="Max"
                class="w-full"
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
          <template #default="{ value, attrs, events, id, error }">
            <DatePicker
              :id="id"
              :model-value="value"
              class="w-full"
              :color="error ? 'error' : undefined"
              :highlight="!!error"
              v-bind="attrs"
              @update:model-value="(date) => events.change({value: date})"
            />
          </template>
        </AppFormField>
      </div>

      <div class="col-start-1 col-end-2">
        <AppFormField name="linkedin_profile" label="LinkedIn profile">
          <template #default="{ attrs, events, id, error }">
            <div class="flex">
              <UInput
                :id="id"
                class="w-full"
                :color="error ? 'error' : undefined"
                :highlight="!!error"
                v-bind="attrs"
                v-on="events"
              />
            </div>
          </template>
        </AppFormField>
      </div>

      <div class="col-start-2 col-end-3">
        <AppFormField name="personal_site" label="Personal site">
          <template #default="{ attrs, events, id, error }">
            <div class="flex">
              <UInput
                :id="id"
                class="w-full"
                :color="error ? 'error' : undefined"
                :highlight="!!error"
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
                      <UInput
                        :id="id"
                        v-bind="attrs"
                        v-on="events"
                      />
                    </template>
                  </AppFormField>
                </td>
                <td class="p-2">
                  <AppFormField :name="`skills.${index}.level`">
                    <template #default="{ value, attrs, events, id, error }">
                      <USelect
                        :id="id"
                        :model-value="value"
                        class="w-full"
                        :items="['Beginner', 'Intermediate', 'Advanced', 'Expert']"
                        :color="error ? 'error' : undefined"
                        :highlight="!!error"
                        v-bind="attrs"
                        @update:model-value="(level) => events.change({value: level})"
                        @blur="events.blur"
                        @focus="events.focus"
                      />
                    </template>
                  </AppFormField>
                </td>
                <td class="p-2">
                  <div class="flex gap-2">
                    <UButton
                      color="error"
                      variant="ghost"
                      type="button"
                      :disabled="!canRemove"
                      @click="remove(index)"
                      icon="i-lucide-trash-2"
                      title="Remove"
                    />
                    <UButton
                      color="neutral"
                      variant="ghost"
                      type="button"
                      @click="moveUp(index)"
                      icon="i-lucide-arrow-up"
                      title="Move up"
                    />
                    <UButton
                      color="neutral"
                      variant="ghost"
                      type="button"
                      @click="moveDown(index)"
                      icon="i-lucide-arrow-down"
                      title="Move Down"
                    />
                  </div>
                </td>
              </tr>
              </tbody>
            </table>
            <div class="mb-4">
              <UButton
                color="primary"
                variant="soft"
                type="button"
                icon="i-lucide-plus"
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
                <template #default="{ attrs, events, id, error }">
                  <UInput
                    :id="id"
                    class="w-full"
                    :color="error ? 'error' : undefined"
                    :highlight="!!error"
                    v-bind="attrs"
                    v-on="events"
                  />
                </template>
              </AppFormField>

              <AppFormField :name="`experience.${index}.position`" label="Position">
                <template #default="{ attrs, events, id, error }">
                  <UInput
                    :id="id"
                    class="w-full"
                    :color="error ? 'error' : undefined"
                    :highlight="!!error"
                    v-bind="attrs"
                    v-on="events"
                  />
                </template>
              </AppFormField>

              <AppFormField :name="`experience.${index}.start`" label="Start">
                <template #default="{ value, attrs, events, id, error }">
                  <DatePicker
                    :id="id"
                    :model-value="value"
                    class="w-full"
                    :color="error ? 'error' : undefined"
                    :highlight="!!error"
                    v-bind="attrs"
                    @blur="events.blur"
                    @focus="events.focus"
                    @update:model-value="(date) => events.change({value: date})"
                  />
                </template>
              </AppFormField>

              <ExperienceEndDateField
                :name="`experience.${index}.end`"
                :form="formCtrl"
              />

              <div class="col-span-2 flex gap-2 items-right place-content-end">
                <UButton
                  color="error"
                  variant="ghost"
                  type="button"
                  :disabled="!canRemove"
                  @click="remove(index)"
                  icon="i-lucide-trash-2"
                  title="Remove"
                />
                <UButton
                  color="neutral"
                  variant="ghost"
                  type="button"
                  @click="moveUp(index)"
                  icon="i-lucide-arrow-up"
                  title="Move up"
                />
                <UButton
                  color="neutral"
                  variant="ghost"
                  type="button"
                  @click="moveDown(index)"
                  icon="i-lucide-arrow-down"
                  title="Move Down"
                />
              </div>
            </div>
            <div class="mb-4">
              <UButton
                color="primary"
                variant="soft"
                type="button"
                icon="i-lucide-plus"
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
        <UButton
          color="primary"
          :loading="formCtrl.$isSubmitting.value"
          :label="formCtrl.$isSubmitting.value ? 'Submitting...' : 'Submit'"
          type="submit"
        />
        <UButton
          color="neutral"
          variant="outline"
          :loading="formCtrl.$isSubmitting.value"
          :label="'Reset'"
          type="reset"
        />
        {{formCtrl.$isSubmitting}}
      </div>
    </template>
  </HeadlessForm>
</template>

<script setup>
import { HeadlessForm, HeadlessRepeatable } from '../../../src'
import UInput from '@nuxt/ui/components/Input.vue'
import USelect from '@nuxt/ui/components/Select.vue'
import USwitch from '@nuxt/ui/components/Switch.vue'
import UButton from '@nuxt/ui/components/Button.vue'
// Nuxt UI's UInputDate with Date objects as values
import DatePicker from '../nuxtui/DatePicker.vue'
import { ref } from 'vue'
import AppFormField from './AppFormField.vue'
import ExperienceEndDateField from './ExperienceEndDateField.vue'
import useFormConfig from './useFormConfig'

const {data, validator, submitHandler} = useFormConfig()

const $form = ref(null)
</script>