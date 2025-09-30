<script setup>
import { ref, onMounted } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'

const parentRef = ref(null)

const items = ref(
    Array.from({ length: 2000 }, (_, i) => ({
        id: i + 1,
        title: `Task ${i + 1} ${i % 5 === 0 ? '— long title' : ''}`,
    }))
)

const rowVirtualizer = useVirtualizer({
    count: items.value.length,
    getScrollElement: () => parentRef.value,
    estimateSize: () => 80,
    overscan: 5,
})
</script>

<template>
    <section ref="parentRef" style="height:70vh; overflow-y:auto; position:relative; border:1px solid #ddd;">
        <!-- spacer for total size -->
        <div :style="{
            height: rowVirtualizer.getTotalSize() + 'px',
            width: '100%',
            position: 'relative'
        }">
            <div v-for="virtualRow in rowVirtualizer.getVirtualItems()" :key="virtualRow.key" :style="{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`
            }">
                <article class="m-2 p-3 border rounded-lg shadow-sm bg-white">
                    <div class="font-semibold">{{ items[virtualRow.index].title }}</div>
                    <div class="text-xs text-gray-500">id: {{ items[virtualRow.index].id }}</div>
                </article>
            </div>
        </div>
    </section>
</template>
