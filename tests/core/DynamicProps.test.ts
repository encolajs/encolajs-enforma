import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import Enforma from '@/core/Enforma.vue'
import useDefaultPreset from '@/presets/default'

describe('Dynamic Props', () => {
  // Initialize default preset before tests
  beforeEach(() => {
    useDefaultPreset()
  })

  // Create a test harness component that renders Enforma with dynamic props
  const createWrapper = (initialData = {}) => {
    const data = ref({
      contactPreference: 'email',
      email: '',
      phone: '',
      position: '',
      experienceDetails: '',
      ...initialData,
    })

    // Context for dynamic props expressions
    const context = {
      positions: ['Developer', 'Manager', 'Designer', 'Other'],
      getExperienceLabel(position) {
        if (!position) return 'Experience Details'
        position = position.toLowerCase()

        if (position.includes('developer')) {
          return 'Technical Experience'
        } else if (position.includes('manager')) {
          return 'Management Experience'
        } else if (position.includes('designer')) {
          return 'Design Experience'
        } else {
          return 'Experience Details'
        }
      },
    }

    // Define schema with dynamic props
    const schema = {
      contactPreference: {
        type: 'field',
        label: 'Preferred Contact Method',
        inputComponent: 'input', // no need to use select
      },
      email: {
        type: 'field',
        label: 'Email Address',
        if: '${form.getFieldValue("contactPreference") === "email" || form.getFieldValue("contactPreference") === "both"}',
      },
      phone: {
        type: 'field',
        label: '${form.getFieldValue("contactPreference")}',
        if: '${form.getFieldValue("contactPreference") === "phone" || form.getFieldValue("contactPreference") === "both"}',
      },
      position: {
        type: 'field',
        label: 'Position Applied For',
        inputComponent: 'input',
      },
      experienceDetails: {
        type: 'field',
        label: '${context.getExperienceLabel(form.getFieldValue("position"))}',
      },
    }

    // Validation rules
    const rules = {
      contactPreference: 'required',
      email: 'required|email',
      phone: 'required',
      position: 'required',
      experienceDetails: 'required',
    }

    // Submit handler
    const submitHandler = vi.fn().mockResolvedValue(undefined)

    // Mount component
    return mount(Enforma, {
      props: {
        data,
        schema,
        rules,
        context,
        submitHandler,
      },
      attachTo: document.body,
    })
  }

  it('should show/hide fields based on dynamic "if" conditions', async () => {
    const wrapper = createWrapper()

    const form = wrapper.vm.form

    // Get the label for the phone field when contactPreference changes

    // Change contactPreference to 'phone'
    form.setFieldValue('contactPreference', 'phone')
    await nextTick()
    await nextTick() // Sometimes multiple ticks are needed for reactivity

    // Get the label text of the phone field after changing to 'phone'
    const phoneLabels = wrapper
      .findAll('label')
      .filter((label) => label.text().includes('phone'))
    expect(phoneLabels.length).toBeGreaterThan(0)

    // Change contactPreference to 'both'
    form.setFieldValue('contactPreference', 'both')
    await nextTick()
    await nextTick()

    // Get the label of the phone field after changing to 'both'
    const updatedPhoneLabels = wrapper
      .findAll('label')
      .filter((label) => label.text().includes('phone'))
    expect(updatedPhoneLabels.length).toBe(0)
  })

  it('should update field label based on dynamic expressions', async () => {
    const wrapper = createWrapper()
    const form = wrapper.vm.form

    // Set position to 'Developer'
    form.setFieldValue('position', 'Developer')
    await nextTick()
    await nextTick()

    // Look for the Technical Experience label
    const techExpLabels = wrapper
      .findAll('label')
      .filter((label) => label.text().includes('Technical Experience'))
    expect(techExpLabels.length).toBeGreaterThan(0)

    // Change position to 'Manager'
    form.setFieldValue('position', 'Manager')
    await nextTick()
    await nextTick()

    // Look for the Management Experience label
    const mgmtExpLabels = wrapper
      .findAll('label')
      .filter((label) => label.text().includes('Management Experience'))
    expect(mgmtExpLabels.length).toBe(1)
  })
})
