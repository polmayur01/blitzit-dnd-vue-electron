<script setup>
import { ref, onMounted, onBeforeUnmount, inject, computed, nextTick } from 'vue'
import TaskCard from './TaskCard.vue'

const props = defineProps({
  section: { type: String, required: true },
  tasks: { type: Array, required: true },
  height: { type: Number, default: 600 }
})

const dnd = inject('dnd')
const parentRef = ref(null)
let unregisterDroppable

const orderedTasks = computed(() => [...props.tasks].sort((a, b) => a.position - b.position))

onMounted(async () => {
  if (!dnd) return
  unregisterDroppable = dnd.registerDroppable({
    id: props.section,
    el: parentRef.value,
    data: { type: 'section', section: props.section },
    container: parentRef.value
  })

  await nextTick()
  // register draggables for each task node (wrapper with data-id)
  orderedTasks.value.forEach(task => {
    const el = parentRef.value?.querySelector(`[data-id="${task.id}"]`)
    if (el) dnd.registerDraggable({ id: String(task.id), el, data: { taskId: task.id } })
  })
})

onBeforeUnmount(() => {
  unregisterDroppable?.()
})
</script>

<template>
  <div class="flex flex-col p-3 w-80 bg-gray-50 rounded-xl">
    <h3 class="mb-2 font-semibold">{{ section }}</h3>

    <div ref="parentRef" class="relative flex-1 overflow-y-auto bg-white border rounded-md"
      :style="{ height: props.height + 'px' }">
      <div v-for="task in orderedTasks" :key="task.id" :data-id="task.id">
        <TaskCard :task="task" />
      </div>
    </div>
  </div>
</template>
