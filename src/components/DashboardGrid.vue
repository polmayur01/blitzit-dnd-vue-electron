<script setup>
import { ref, provide, onMounted, onBeforeUnmount } from 'vue'
import createDnd from '@/utils/dnd-dom'
import TaskCard from './TaskCard.vue'
import { tasks as mockTasks } from '@/mock/data'
import { nextPositionBetween } from '@/utils/positioning'

const gridTasks = ref([...mockTasks])

const dnd = createDnd()
provide('dnd', dnd)

let offEnd

onMounted(() => {
  offEnd = dnd.on('drag:end', ({ id, dropIndex }) => {
    const idx = gridTasks.value.findIndex(t => t.id === id)
    if (idx === -1) return

    const [moved] = gridTasks.value.splice(idx, 1)
    const clamped = Math.max(0, Math.min(dropIndex ?? gridTasks.value.length, gridTasks.value.length))
    const prev = clamped > 0 ? gridTasks.value[clamped - 1]?.position : null
    const next = clamped < gridTasks.value.length ? gridTasks.value[clamped]?.position : null
    const newPos = nextPositionBetween(prev, next)
    gridTasks.value.splice(clamped, 0, { ...moved, position: newPos })
  })
})

onBeforeUnmount(() => {
  if (offEnd) offEnd()
  dnd.destroy()
})
</script>

<template>
  <section class="p-4">
    <h2 class="mb-4 text-lg font-semibold">Dashboard Grid</h2>
    <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      <TaskCard v-for="t in gridTasks" :key="t.id" :task="t" />
    </div>
  </section>
</template>
