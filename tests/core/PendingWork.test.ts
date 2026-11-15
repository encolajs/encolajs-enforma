import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, reactive, ref } from 'vue'
import Enforma from '@/core/Enforma.vue'
import EnformaField from '@/core/EnformaField.vue'
import { DEFAULT_CONFIG } from '@/constants/defaults'
import { setGlobalConfig } from '@/utils/useConfig'
import useDefaultPreset from '@/presets/default'

describe('pending work in <Enforma>', () => {
  beforeEach(() => {
    setGlobalConfig(DEFAULT_CONFIG)
    useDefaultPreset()
  })

  it("drops a field's work as the <EnformaField> unmounts, hidden by its v-if", async () => {
    const shown = ref(true)
    const form = ref<any>(null)
    const Page = defineComponent({
      setup() {
        const data = reactive({ avatar: null })
        return () =>
          h(
            Enforma,
            { ref: form, data, showSubmitButton: false },
            {
              default: () =>
                shown.value ? h(EnformaField, { name: 'avatar' }) : null,
            }
          )
      },
    })
    const wrapper = mount(Page)
    await flushPromises()
    const work = form.value.beginPending('avatar')

    shown.value = false
    await nextTick()

    expect(work.signal.aborted).toBe(true)
    expect(form.value.$isPending).toBe(false)
    wrapper.unmount()
  })
})
