<script setup>
const props = defineProps({
  direction: { type: String, required: true },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['move'])

function handleClick() {
  if (!props.disabled) emit('move', props.direction)
}
</script>

<template>
  <button
    class="inline-flex items-center justify-center h-6 w-6 rounded-full border text-xs font-bold
           hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
    :disabled="disabled"
    @click="handleClick"
  >
    <span v-if="direction==='left'">←</span>
    <span v-else-if="direction==='right'">→</span>
  </button>
</template>
