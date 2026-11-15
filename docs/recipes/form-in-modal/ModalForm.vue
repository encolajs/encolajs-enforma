<template>
  <p>
    <strong>{{ profile.name }}</strong> &lt;{{ profile.email }}&gt;
  </p>
  <UButton label="Edit profile" @click="edit" />

  <UModal
    v-model:open="open"
    title="Edit profile"
    description="Press Enter in a field, or Save in the footer"
  >
    <template #body>
      <!-- the form's own buttons are hidden: they're in the footer -->
      <Enforma
        ref="form"
        :data="draft"
        :schema="schema"
        :validator="validator"
        :submit-handler="save"
        :show-submit-button="false"
        @submit_success="open = false"
      />
    </template>

    <template #footer="{ close }">
      <div style="display: flex; gap: 0.5rem; margin-left: auto">
        <UButton
          label="Cancel"
          color="neutral"
          variant="outline"
          @click="close"
        />
        <!-- outside the <form>, given the form through its ref -->
        <EnformaSubmitButton :form="form">Save</EnformaSubmitButton>
      </div>
    </template>
  </UModal>
</template>

<script setup>
import { ref } from 'vue'
import UButton from '@nuxt/ui/components/Button.vue'
import UModal from '@nuxt/ui/components/Modal.vue'
import { Enforma, EnformaSubmitButton } from '@'
import { createEncolaValidator } from '@/validators/encolaValidator'

const profile = ref({ name: 'Jane Doe', email: 'jane@example.com' })

// the modal edits a copy, so Cancel leaves the profile as it was
const draft = ref({})
const open = ref(false)
function edit() {
  draft.value = { ...profile.value }
  open.value = true
}

// the <Enforma>, which the Save button submits
const form = ref(null)

const schema = {
  name: { label: 'Name', required: true },
  email: { label: 'Email', required: true },
}

const validator = createEncolaValidator({
  name: 'required',
  email: 'required|email',
})

async function save(values) {
  // a request to your API: the Save button shows it's submitting meanwhile
  await new Promise((resolve) => setTimeout(resolve, 1000))
  profile.value = { ...values }
}
</script>
