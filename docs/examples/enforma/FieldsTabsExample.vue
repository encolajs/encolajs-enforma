<template>
  <Enforma
    :data="data"
    :validator="validator"
    :submit-handler="submitHandler"
  >
    <!-- unmount-on-hide off: the fields of the hidden tab stay mounted, so they are checked -->
    <UTabs
      v-model="tab"
      :items="tabs"
      :unmount-on-hide="false"
      class="mb-4"
    >
      <!-- Each tab counts the errors of the fields inside its panel -->
      <template #trailing="{ item }">
        <EnformaErrorBadge
          :as="UBadge"
          color="error"
          size="sm"
          :count="panels[item.value].errorCount"
        />
      </template>

      <template #profile>
        <EnformaPanel :panel="panels.profile">
          <EnformaField name="name" label="Name" :input-props="{ class: 'w-full' }" />
          <EnformaField name="email" label="Email" :input-props="{ class: 'w-full' }" />
        </EnformaPanel>
      </template>

      <template #billing>
        <EnformaPanel :panel="panels.billing">
          <EnformaField name="iban" label="IBAN" :input-props="{ class: 'w-full' }" />

          <!-- A collapsible inside the Billing tab: a panel inside a panel -->
          <UCollapsible
            v-model:open="companyOpen"
            :unmount-on-hide="false"
            class="mt-4"
          >
            <UButton
              color="neutral"
              variant="ghost"
              trailing-icon="i-lucide-chevron-down"
              block
            >
              Company details
              <EnformaErrorBadge
                :as="UBadge"
                color="error"
                size="sm"
                :count="company.errorCount"
              />
            </UButton>
            <template #content>
              <EnformaPanel :panel="company">
                <EnformaField name="companyName" label="Company name" :input-props="{ class: 'w-full' }" />
                <EnformaField name="vat" label="VAT number" :input-props="{ class: 'w-full' }" />
              </EnformaPanel>
            </template>
          </UCollapsible>
        </EnformaPanel>
      </template>
    </UTabs>
  </Enforma>
</template>

<script setup>
import { ref } from 'vue'
import UTabs from '@nuxt/ui/components/Tabs.vue'
import UCollapsible from '@nuxt/ui/components/Collapsible.vue'
import UButton from '@nuxt/ui/components/Button.vue'
import UBadge from '@nuxt/ui/components/Badge.vue'
import {
  Enforma,
  EnformaField,
  EnformaPanel,
  EnformaErrorBadge,
  useEnformaPanel,
} from '@'
import { createEncolaValidator } from '../../../src/validators/encolaValidator'

const data = ref({ name: '', email: '', iban: '', companyName: '', vat: '' })

// Validation is set up for the whole form
const validator = createEncolaValidator({
  name: 'required',
  email: 'required|email',
  iban: 'required',
  vat: 'required',
})

// The open tab, and whether the collapsible is open: yours, as your components want them
const tab = ref('billing')
const companyOpen = ref(false)
const tabs = [
  { label: 'Profile', value: 'profile', slot: 'profile' },
  { label: 'Billing', value: 'billing', slot: 'billing' },
]

// A panel for each tab and for the collapsible: `reveal` opens it
const panels = {
  profile: useEnformaPanel({ reveal: () => { tab.value = 'profile' } }),
  billing: useEnformaPanel({ reveal: () => { tab.value = 'billing' } }),
}
const company = useEnformaPanel({ reveal: () => { companyOpen.value = true } })

const submitHandler = (formData) => {
  alert('Data sent to server: ' + JSON.stringify(formData))
  return Promise.resolve(true)
}
</script>
