<script setup>
import { defineEmits, defineProps } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  taskTitle: { type: String, default: '' }
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
  >
    <div class="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
      <h2 class="text-lg font-semibold mb-4">Move from Scheduled?</h2>
      <p class="text-sm text-gray-600 mb-6">
        Are you sure you want to move
        <span class="font-medium">"{{ taskTitle }}"</span>
        out of the <span class="font-semibold">Scheduled</span> section?
      </p>
      <div class="flex justify-end gap-2">
        <button
          class="px-4 py-2 rounded-lg border text-sm"
          @click="emit('cancel')"
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm"
          @click="emit('confirm')"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>
