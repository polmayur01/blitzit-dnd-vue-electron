<script setup>
import { ref, provide, onMounted, onBeforeUnmount } from 'vue'
import createDnd from '@/utils/dnd-dom'
import TaskCard from './TaskCard.vue'
import { tasks as mockTasks } from '@/mock/data'
import { sortedByPosition, nextPositionBetween } from '@/utils/positioning'

const gridTasks = ref([...mockTasks])

const dnd = createDnd()
provide('dnd', dnd)

let offEnd

onMounted(() => {
  offEnd = dnd.on('drag:end', ({ id }) => {
    const idx = gridTasks.value.findIndex(t => t.id === id)
    if (idx === -1) return

    const last = sortedByPosition(gridTasks.value).at(-1)
    const newPos = last ? nextPositionBetween(last.position, null) : 250

    gridTasks.value[idx] = {
      ...gridTasks.value[idx],
      position: newPos
    }
  })
})

onBeforeUnmount(() => {
  if (offEnd) offEnd()
  dnd.destroy()
})
</script>

<template>
  <section class="p-4">
    <h2 class="text-lg font-semibold mb-4">Dashboard Grid</h2>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <TaskCard
        v-for="t in sortedByPosition(gridTasks)"
        :key="t.id"
        :task="t"
      />
    </div>
  </section>
</template>
