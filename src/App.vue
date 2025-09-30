<!-- src/App.vue -->
<script setup>
import BoardsView from './components/BoardsView.vue'
</script>

<template>
  <main class="min-h-screen bg-gray-100">
    <header class="p-4 bg-white shadow flex items-center">
      <h1 class="text-xl font-bold">Blitzit DnD Demo</h1>
    </header>

    <section class="p-4">
      <BoardsView />
    </section>
  </main>
</template>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
}
</style>
