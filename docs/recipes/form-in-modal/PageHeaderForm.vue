<template>
  <UPageHeader
    title="Account settings"
    description="Save and Discard are on the title's row, outside the form"
  >
    <template #links>
      <!-- outside the <form>, given the form through its ref -->
      <EnformaResetButton :form="form">Discard</EnformaResetButton>
      <EnformaSubmitButton :form="form">Save changes</EnformaSubmitButton>
    </template>
  </UPageHeader>

  <!-- the form's own buttons are hidden: they're in the header -->
  <Enforma
    ref="form"
    :data="account"
    :schema="schema"
    :validator="validator"
    :submit-handler="save"
    :show-submit-button="false"
  />
</template>

<script setup>
import { ref } from 'vue'
import UPageHeader from '@nuxt/ui/components/PageHeader.vue'
import { Enforma, EnformaResetButton, EnformaSubmitButton } from '@'
import { createEncolaValidator } from '@/validators/encolaValidator'

const account = { company: 'Acme Inc.', website: 'https://acme.example.com' }

// the <Enforma>, which the header's buttons submit and reset
const form = ref(null)

const schema = {
  company: { label: 'Company', required: true },
  website: { label: 'Website' },
}

const validator = createEncolaValidator({
  company: 'required',
  website: 'url',
})

async function save(values, formController) {
  // a request to your API: the Save button shows it's submitting meanwhile
  await new Promise((resolve) => setTimeout(resolve, 1000))
  // the saved values are the ones Discard goes back to
  formController.commit()
}
</script>
