<script setup>
import { ref, provide, onMounted, onBeforeUnmount } from 'vue'
import createDnd from '@/utils/dnd-dom'
import SectionColumn from './SectionColumn.vue'
import ConfirmMoveModal from '@/components/ConfirmDetachModal.vue'
import { tasks as mockTasks, sections } from '@/mock/data'
import { nextPositionBetween } from '@/utils/positioning'

const allTasks = ref([...mockTasks])

const dnd = createDnd()
provide('dnd', dnd)

const modalOpen = ref(false)
const pending = ref(null)

function handleDragEnd({ id, dropTargetId, dropIndex }) {
  if (!dropTargetId) return

  const moving = allTasks.value.find(t => t.id === id)
  if (!moving) return

  const targetSection = dropTargetId

  if (moving.section === 'Scheduled' && targetSection !== 'Scheduled') {
    pending.value = { id, targetSection, dropIndex }
    modalOpen.value = true
    return
  }

  applyMove({ id, targetSection, dropIndex })
}

function applyMove({ id, targetSection, dropIndex }) {
  const fromIdx = allTasks.value.findIndex(t => t.id === id)
  if (fromIdx === -1) return
  const [moving] = allTasks.value.splice(fromIdx, 1)

  const destSlice = allTasks.value.filter(t => t.section === targetSection)

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
    position: newPos
  })
}

function confirmMove() {
  if (!pending.value) return
  applyMove(pending.value)
  modalOpen.value = false
  pending.value = null
}

function cancelMove() {
  modalOpen.value = false
  pending.value = null
}

let offEnd
onMounted(() => {
  offEnd = dnd.on('drag:end', handleDragEnd)
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
  <div class="flex gap-4 p-4 overflow-x-auto">
    <SectionColumn v-for="s in sections" :key="s" :section="s" :tasks="tasksFor(s)" :height="600" />

    <ConfirmMoveModal :open="modalOpen" :task-title="allTasks.find(t => t.id === pending?.id)?.title"
      @confirm="confirmMove" @cancel="cancelMove" />
  </div>
</template>
