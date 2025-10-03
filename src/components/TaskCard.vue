<script setup>
import { ref, onMounted, onBeforeUnmount, inject, computed } from 'vue'

const props = defineProps({
  task: { type: Object, required: true },
  handle: { type: String, default: '' },
  draggingClass: { type: String, default: 'opacity-70 ring-2 ring-blue-500' }
})

const dnd = inject('dnd')
if (!dnd) {
  throw new Error('TaskCard requires a provided dnd instance')
}

const root = ref(null)
let unregister = null
const isDragging = ref(false)

const cardClass = computed(() =>
  [
    'bg-white border rounded-xl p-3 mb-2 shadow-sm select-none',
    'cursor-grab active:cursor-grabbing transition-[box-shadow,opacity] duration-150',
    isDragging.value ? props.draggingClass : ''
  ].join(' ')
)

onMounted(() => {
  if (!dnd || !root.value) return

  unregister = dnd.registerDraggable({
    id: props.task.id,
    el: root.value,
    data: { type: 'task', taskId: props.task.id },
    handleSelector: props.handle || null
  })

  const offStart = dnd.on('drag:start', ({ id }) => {
    if (id === props.task.id) isDragging.value = true
  })
  const offEnd = dnd.on('drag:end', ({ id }) => {
    if (id === props.task.id) isDragging.value = false
  })

  unregister._off = [offStart, offEnd]
})

onBeforeUnmount(() => {
  if (unregister) {
    unregister()
    if (unregister._off) unregister._off.forEach(off => off && off())
  }
})
</script>

<template>
  <article ref="root" :data-id="task.id" :class="cardClass">
    <header class="flex items-center gap-2">
      <span class="inline-flex items-center justify-center w-6 h-6 text-xs text-gray-500 border rounded drag-handle">
        ⠿
      </span>
      <div class="flex-1 font-semibold leading-tight">
        {{ task.title }}
      </div>
      <slot name="arrows" />
    </header>
  </article>
</template>

<style scoped>
article {
  will-change: transform;
}
</style>
