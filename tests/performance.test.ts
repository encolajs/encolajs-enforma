import { describe, it, expect, beforeEach } from 'vitest'
import { useForm } from '../src/headless/useForm'
import { useRepeatable } from '../src/headless/useRepeatable'
import { nextTick } from 'vue'
import { performance } from 'perf_hooks'

describe('Repeatable Field Performance Tests', () => {
  // Helper to create a large array of items
  const createLargeArray = (size: number) => {
    return Array.from({ length: size }, (_, i) => ({
      name: `Item ${i}`,
      description: `Description for item ${i}`,
      status: i % 2 === 0 ? 'active' : 'inactive',
      tags: [`tag${i}`, `tag${i + 1}`],
    }))
  }

  // Helper to measure execution time
  const measureTime = async (
    callback: () => Promise<void>
  ): Promise<number> => {
    const start = performance.now()
    await callback()
    const end = performance.now()
    return end - start
  }

  // Helper to measure memory usage
  const measureMemory = async (
    callback: () => Promise<void>
  ): Promise<number> => {
    const startMemory = process.memoryUsage().heapUsed
    await callback()
    const endMemory = process.memoryUsage().heapUsed
    return endMemory - startMemory
  }

  describe('Array Operations Performance', () => {
    it('measures add operation performance with different array sizes', async () => {
      const sizes = [10, 50, 100, 500]
      const results: Record<number, { time: number; memory: number }> = {}

      for (const size of sizes) {
        const form = useForm({ items: createLargeArray(size) })
        const repeatable = useRepeatable('items', form)
        await nextTick()

        const time = await measureTime(async () => {
          await repeatable.value.add({
            name: 'New Item',
            description: 'New Description',
            status: 'active',
            tags: ['new'],
          })
          await nextTick()
        })

        const memory = await measureMemory(async () => {
          await repeatable.value.add({
            name: 'New Item',
            description: 'New Description',
            status: 'active',
            tags: ['new'],
          })
          await nextTick()
        })

        results[size] = { time, memory }

        // Optional: Add assertions to catch performance regressions
        expect(time).toBeLessThan(100) // Example threshold: 100ms
      }

      console.table(results)
    })

    it('measures remove operation performance with different array sizes', async () => {
      const sizes = [10, 50, 100, 500]
      const results: Record<number, { time: number; memory: number }> = {}

      for (const size of sizes) {
        const form = useForm({ items: createLargeArray(size) })
        const repeatable = useRepeatable('items', form)
        await nextTick()

        const time = await measureTime(async () => {
          await repeatable.value.remove(Math.floor(size / 2)) // Remove from middle
          await nextTick()
        })

        const memory = await measureMemory(async () => {
          await repeatable.value.remove(Math.floor(size / 2))
          await nextTick()
        })

        results[size] = { time, memory }

        expect(time).toBeLessThan(100) // Example threshold: 100ms
      }

      console.table(results)
    })

    it('measures move operation performance with different array sizes', async () => {
      const sizes = [10, 50, 100, 500]
      const results: Record<number, { time: number; memory: number }> = {}

      for (const size of sizes) {
        const form = useForm({ items: createLargeArray(size) })
        const repeatable = useRepeatable('items', form)
        await nextTick()

        const time = await measureTime(async () => {
          await repeatable.value.move(0, size - 1) // Move from start to end
          await nextTick()
        })

        const memory = await measureMemory(async () => {
          await repeatable.value.move(0, size - 1)
          await nextTick()
        })

        results[size] = { time, memory }

        expect(time).toBeLessThan(150) // Example threshold: 150ms
      }

      console.table(results)
    })

    it('measures rapid sequential operations performance', async () => {
      const size = 100
      const form = useForm({ items: createLargeArray(size) })
      const repeatable = useRepeatable('items', form)
      await nextTick()

      const time = await measureTime(async () => {
        // Perform multiple operations in sequence
        for (let i = 0; i < 10; i++) {
          await repeatable.value.add({ name: `New Item ${i}` })
          await repeatable.value.move(size + i, 0) // Move new item to start
          await repeatable.value.remove(1) // Remove second item
          await nextTick()
        }
      })

      console.log('Sequential operations time:', time)
      expect(time).toBeLessThan(1000) // Example threshold: 1000ms
    })

    it('measures performance with validation enabled', async () => {
      const size = 100
      const form = useForm(
        { items: createLargeArray(size) },
        { 'items.*.name': 'required|min:3' }
      )
      const repeatable = useRepeatable('items', form, {
        validateOnAdd: true,
        validateOnRemove: true,
      })
      await nextTick()

      const time = await measureTime(async () => {
        await repeatable.value.add({ name: 'New Item' })
        await repeatable.value.move(size, 0)
        await repeatable.value.remove(1)
        await nextTick()
      })

      console.log('Operations with validation time:', time)
      expect(time).toBeLessThan(200) // Example threshold: 200ms
    })
  })
})
