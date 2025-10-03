<script setup>
import { ref, provide, onMounted, onBeforeUnmount } from 'vue'
import createDnd from '@/utils/dnd-dom'
import SectionColumn from './SectionColumn.vue'
import TaskCardWithArrows from './TaskCardWithArrows.vue'
import { tasks as mockTasks, sections, boards } from '@/mock/data'
import { nextPositionBetween } from '@/utils/positioning'

const allTasks = ref([...mockTasks])

const dnd = createDnd()
provide('dnd', dnd)

let offEnd

onMounted(() => {
  offEnd = dnd.on('drag:end', ({ id, dropTargetId, dropIndex }) => {
    if (!dropTargetId) return

    const fromIdx = allTasks.value.findIndex(t => t.id === id)
    if (fromIdx === -1) return
    const [moving] = allTasks.value.splice(fromIdx, 1)
    const targetSection = dropTargetId
    const targetBoardId = moving.boardId

    const destSlice = allTasks.value.filter(
      t => t.section === targetSection && t.boardId === targetBoardId
    )

    const clamped = Math.max(0, Math.min(dropIndex ?? destSlice.length, destSlice.length))
    const prev = clamped > 0 ? destSlice[clamped - 1]?.position : null
    const next = clamped < destSlice.length ? destSlice[clamped]?.position : null
    const newPos = nextPositionBetween(prev, next)

    const nextNeighborId = clamped < destSlice.length ? destSlice[clamped].id : null
    let insertAt = allTasks.value.length
    if (nextNeighborId) {
      const idxInMaster = allTasks.value.findIndex(t => t.id === nextNeighborId)
      if (idxInMaster !== -1) insertAt = idxInMaster
    }

    allTasks.value.splice(insertAt, 0, {
      ...moving,
      section: targetSection,
      boardId: targetBoardId,
      position: newPos
    })
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
  let newIdx = direction === 'left' ? currentIdx - 1 : currentIdx + 1
  if (newIdx < 0 || newIdx >= boardOrder.length) return
  const newBoardId = boardOrder[newIdx]

  const idx = allTasks.value.findIndex(t => t.id === task.id)
  if (idx === -1) return

  allTasks.value[idx] = { ...task, boardId: newBoardId }
}
</script>

<template>
  <div class="flex gap-6 p-4 overflow-x-auto">
    <div v-for="b in boards" :key="b.id" class="flex flex-col gap-4">
      <h2 class="mb-2 text-lg font-bold">{{ b.title }}</h2>
      <div class="flex gap-4">
        <SectionColumn v-for="s in sections" :key="s + '-' + b.id" :section="s" :tasks="tasksFor(s, b.id)"
          :height="600">
          <template #default="{ task }">
            <TaskCardWithArrows :task="task" :board-ids="boards.map(b => b.id)" :on-move-board="handleMoveBoard" />
          </template>
        </SectionColumn>
      </div>
    </div>
  </div>
</template>
