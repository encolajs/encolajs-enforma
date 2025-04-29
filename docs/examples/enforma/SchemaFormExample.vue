<template>
  <Enforma
    :data="data"
    :rules="rules"
    :custom-messages="messages"
    :submit-handler="submitHandler"
    :schema="schema"
  >
  </Enforma>
</template>

<script setup>
import { Enforma } from '@'
import SalaryField from './SalaryField.vue'
import EndDateField from './EndDateField.vue'

// Form data
const data = {
  name: '',
  email: '',
  address: {
    country: null,
    city: null,
  },
  willing_to_relocate: false,
  salary: null,
  available_date: null,
  linkedin_profile: '',
  personal_site: '',
  skills: [],
  experience: [],
}

// Initialize with sample data
for (let i = 0; i < 3; i++) {
  const level = ['Beginner', 'Intermediate', 'Advanced', 'Expert'].sort(
    () => Math.random() - 0.5
  )[0]
  data.skills.push({ name: `Skill ${i + 1}`, level })
}
for (let i = 0; i < 2; i++) {
  data.experience.push({
    company: `Company ${i + 1}`,
    position: `Job title ${i + 1}`,
    start: new Date(`202${5 - i}-01-01`),
    end: i === 0 ? null : new Date(`202${5 - 1}-12-31`),
    current: i === 0,
  })
}

// Validation rules
const rules = {
  name: 'required',
  email: 'required|email',
  'salary.min': 'number',
  'salary.max': 'number',
  available_date: 'required|date:yy-mm-dd',
  'address.city': 'required',
  'address.country': 'required',
  linkedin_profile: 'required|url',
  personal_site: 'url',
  'skills.*.name': 'required',
  'skills.*.level': 'required',
  'experience.*.company': 'required',
  'experience.*.position': 'required',
  'experience.*.start': 'required|date:yy-mm-dd',
  'experience.*.end': 'required_when:@experience.*.current,false|date:yy-mm-dd',
}

const messages = {
  'name.required': 'You gotta have a name',
}

const submitHandler = async (formData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      alert('Form submitted to server')
      resolve(true)
    }, 2000)
  })
}

// Define the entire form structure using schema
const schema = {
  section_top: {
    type: 'section',
    props: {
      class: 'grid grid-cols-2 gap-4',
    },
  },
  name: {
    type: 'field',
    section: 'section_top',
    props: {
      class: 'col-start-1 col-end-3',
      label: 'Name',
      required: true,
      inputProps: { class: 'w-full' },
    },
  },
  email: {
    type: 'field',
    section: 'section_top',
    props: {
      class: 'col-start-1 col-end-3',
      label: 'Email',
      required: true,
      inputProps: { class: 'w-full' },
    },
  },
  'address.country': {
    type: 'field',
    section: 'section_top',
    props: {
      class: 'col-start-1 col-end-2',
      label: 'Country',
      required: true,
      inputProps: { class: 'w-full' },
    },
  },
  'address.city': {
    type: 'field',
    section: 'section_top',
    props: {
      class: 'col-start-2 col-end-3',
      label: 'City',
      required: true,
      inputProps: { class: 'w-full' },
    },
  },
  willing_to_relocate: {
    type: 'field',
    section: 'section_top',
    props: {
      class: 'col-start-1 col-end-3 toggle-field',
      label: 'Willing to relocate',
      showLabelNextToInput: true,
      inputComponent: 'toggle',
    },
  },
  salary: {
    type: 'field',
    section: 'section_top',
    props: {
      class: 'col-start-1 col-end-2',
      label: 'Salary',
      component: SalaryField,
      inputProps: { class: 'w-full' },
    },
  },
  available_date: {
    type: 'field',
    section: 'section_top',
    props: {
      class: 'col-start-2 col-end-3',
      label: 'Available date',
      component: 'datepicker',
      inputProps: { class: 'w-full' },
    },
  },
  linkedin_profile: {
    type: 'field',
    section: 'section_top',
    props: {
      label: 'Linkedin Profile',
      inputProps: { class: 'w-full' },
    },
  },
  personal_site: {
    type: 'field',
    section: 'section_top',
    props: {
      label: 'Personal site',
      inputProps: { class: 'w-full' },
    },
  },
  skills_section: {
    type: 'section',
    title: 'Skills',
    titleComponent: 'h3',
    titleProps: { class: 'w-full' },
  },
  skills: {
    type: 'repeatable_table',
    section: 'skills_section',
    props: {
      class: 'mb-4',
      subfields: {
        name: {
          label: 'Skill',
          inputComponent: 'input',
          inputProps: { fluid: true },
        },
        level: {
          label: 'Level',
          inputComponent: 'select',
          inputProps: {
            fluid: true,
            options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
          },
        },
      },
    },
  },
  experience_section: {
    type: 'section',
    title: 'Experience',
    titleComponent: 'h3',
    titleProps: { class: 'w-full' },
  },
  experience: {
    type: 'repeatable',
    section: 'experience_section',
    props: {
      class: 'mb-4 form-repeatable-experience',
      subfields: {
        company: {
          label: 'Company',
          wrapperProps: { class: 'col-start-1 col-end-2' },
          inputProps: { fluid: true },
        },
        position: {
          label: 'Position',
          wrapperProps: { class: 'col-start-2 col-end-3' },
          inputProps: { fluid: true },
        },
        start: {
          label: 'Start',
          inputComponent: 'datepicker',
          inputProps: {
            dateFormat: 'yy-mm-dd',
            fluid: true,
          },
        },
        end: {
          label: 'End',
          inputComponent: EndDateField,
          inputProps: { fluid: true },
        },
      },
    },
  }
}
</script>