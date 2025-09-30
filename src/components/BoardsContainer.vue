
<script setup>
import { ref, provide, onMounted, onBeforeUnmount } from 'vue'
import createDnd from '@/utils/dnd-dom'
import SectionColumn from './SectionColumn.vue'
import TaskCardWithArrows from './TaskCardWithArrows.vue'
import { tasks as mockTasks, sections, boards } from '@/mock/data'
import { sortedByPosition, nextPositionBetween } from '@/utils/positioning'

const allTasks = ref([...mockTasks])

const dnd = createDnd()
provide('dnd', dnd)

let offEnd

onMounted(() => {
  offEnd = dnd.on('drag:end', ({ id, dropTargetId }) => {
    if (!dropTargetId) return
    const idx = allTasks.value.findIndex(t => t.id === id)
    if (idx === -1) return

    const targetSection = dropTargetId
    const sectionTasks = sortedByPosition(
      allTasks.value.filter(t => t.section === targetSection)
    )
    let newPos
    if (sectionTasks.length === 0) {
      newPos = 250
    } else {
      const last = sectionTasks.at(-1)
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

function tasksFor(section, boardId) {
  return allTasks.value.filter(
    t => t.section === section && t.boardId === boardId
  )
}

function handleMoveBoard(task, direction) {
  const boardOrder = boards.map(b => b.id)
  const currentIdx = boardOrder.indexOf(task.boardId)
  let newIdx =
    direction === 'left' ? currentIdx - 1 : currentIdx + 1
  if (newIdx < 0 || newIdx >= boardOrder.length) return
  const newBoardId = boardOrder[newIdx]

  const idx = allTasks.value.findIndex(t => t.id === task.id)
  if (idx === -1) return

  allTasks.value[idx] = { ...task, boardId: newBoardId }
}
</script>

<template>
  <div class="flex gap-6 overflow-x-auto p-4">
  ==?  {{ allTasks }}
    <div
      v-for="b in boards"
      :key="b.id"
      class="flex flex-col gap-4"
    >
      <h2 class="text-lg font-bold mb-2">{{ b.title }}</h2>
      <div class="flex gap-4">
        <SectionColumn
          v-for="s in sections"
          :key="s + '-' + b.id"
          :section="s"
          :tasks="tasksFor(s, b.id)"
          :height="600"
        >
          <template #default="{ task }">
            <TaskCardWithArrows
              :task="task"
              :board-ids="boards.map(b => b.id)"
              :on-move-board="handleMoveBoard"
            />
          </template>
        </SectionColumn>
      </div>
    </div>
  </div>
</template>
