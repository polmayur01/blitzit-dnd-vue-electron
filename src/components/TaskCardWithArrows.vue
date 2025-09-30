<script setup>
import { ref, onMounted, onBeforeUnmount, inject, computed } from 'vue'
import ArrowButton from './ArrowButton.vue'

const props = defineProps({
  task: { type: Object, required: true },
  handle: { type: String, default: '' },
  draggingClass: { type: String, default: 'opacity-70 ring-2 ring-blue-500' },
  boardIds: { type: Array, required: true },
  onMoveBoard: { type: Function, required: true }
})

const dnd = inject('dnd')
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
    if (unregister._off) unregister._off.forEach(fn => fn && fn())
  }
})

function moveLeft() {
  props.onMoveBoard(props.task, 'left')
}
function moveRight() {
  props.onMoveBoard(props.task, 'right')
}
</script>

<template>
  <article ref="root" :data-id="task.id" :class="cardClass">
    <header class="flex items-center gap-2">
      <span class="drag-handle inline-flex h-6 w-6 items-center justify-center rounded border text-xs text-gray-500">
        ⠿
      </span>
      <div class="font-semibold leading-tight flex-1">
        {{ task.title }}
      </div>
      <ArrowButton direction="left" @move="moveLeft" />
      <ArrowButton direction="right" @move="moveRight" />
    </header>
    <p class="text-[11px] text-gray-500 mt-1">pos: {{ task.position }}</p>
  </article>
</template>
