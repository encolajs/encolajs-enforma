import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, onMounted, reactive, ref } from 'vue'
import Enforma from '@/core/Enforma.vue'
import EnformaField from '@/core/EnformaField.vue'
import { DEFAULT_CONFIG } from '@/constants/defaults'
import { setGlobalConfig } from '@/utils/useConfig'
import useDefaultPreset from '@/presets/default'

/** An input component that counts how often it mounts */
function countingInput() {
  const counter = { mounts: 0 }
  const component = defineComponent({
    props: { modelValue: { type: String, default: null } },
    setup(props) {
      onMounted(() => counter.mounts++)
      return () => h('span', props.modelValue)
    },
  })
  return { component, counter }
}

describe('a custom input component', () => {
  beforeEach(() => {
    setGlobalConfig(DEFAULT_CONFIG)
    useDefaultPreset()
  })

  it("stays mounted as its field's value changes, the form's data reactive", async () => {
    const { component, counter } = countingInput()
    const form = ref<any>(null)
    const data = reactive({ photo: 'a' })
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            Enforma,
            { ref: form, data },
            {
              default: () =>
                h(EnformaField, { name: 'photo', inputComponent: component }),
            }
          ),
      })
    )
    await flushPromises()

    await form.value.setFieldValue('photo', 'b')
    await flushPromises()
    await form.value.setFieldValue('photo', 'c')
    await flushPromises()

    expect(wrapper.find('span').text()).toBe('c')
    expect(counter.mounts).toBe(1)
    wrapper.unmount()
  })

  it("stays mounted as its field's value changes, given in a schema", async () => {
    const { component, counter } = countingInput()
    const form = ref<any>(null)
    const data = reactive({ photo: 'a' })
    const schema = { photo: { label: 'Photo', inputComponent: component } }
    const wrapper = mount(
      defineComponent({
        setup: () => () => h(Enforma, { ref: form, data, schema }),
      })
    )
    await flushPromises()

    await form.value.setFieldValue('photo', 'b')
    await flushPromises()

    expect(wrapper.find('span').text()).toBe('b')
    expect(counter.mounts).toBe(1)
    wrapper.unmount()
  })
})
