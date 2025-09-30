<script setup>
import { ref, provide, onMounted, onBeforeUnmount } from 'vue'
import createDnd from '@/utils/dnd-dom'
import SectionColumn from './SectionColumn.vue'
import { tasks as mockTasks, sections, boards } from '@/mock/data'
import { sortedByPosition, nextPositionBetween } from '@/utils/positioning'

const allTasks = ref([...mockTasks])

const dnd = createDnd()
provide('dnd', dnd)

let offEnd

onMounted(() => {
  // Listen for drag end events globally
  offEnd = dnd.on('drag:end', ({ id, dropTargetId }) => {
    if (!dropTargetId) return
    const idx = allTasks.value.findIndex(t => t.id === id)
    if (idx === -1) return

    const targetSection = dropTargetId
    const sectionTasks = sortedByPosition(allTasks.value.filter(t => t.section === targetSection))
    let newPos

    if (sectionTasks.length === 0) {
      newPos = 250
    } else {
      const last = sectionTasks[sectionTasks.length - 1]
      newPos = nextPositionBetween(last.position, null)
    }

    allTasks.value[idx] = {
      ...allTasks.value[idx],
      section: targetSection,
      position: newPos
    }
  })
})

onBeforeUnmount(() => {
  if (offEnd) offEnd()
  dnd.destroy()
})

function tasksFor(section) {
  return allTasks.value.filter(t => t.section === section)
}
</script>

<template>
  <div class="flex gap-4 overflow-x-auto p-4">
    <SectionColumn
      v-for="s in sections"
      :key="s"
      :section="s"
      :tasks="tasksFor(s)"
      :height="600"
    />
  </div>
</template>
