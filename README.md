# Blitzit DnD – Vue 3 + Electron + Vite + Tailwind + @dnd-kit/dom

This project is a **desktop application prototype** built with **Vue 3 + Electron**.  
It demonstrates **modern drag-and-drop functionality** with **virtualized task lists** using `@tanstack/vue-virtual` and `@dnd-kit/dom`.

The goal is to replace outdated Vue drag-and-drop solutions with a robust, production-ready setup for **Boards**, **Sections**, and a **Dashboard grid**, while also applying **positioning logic**, **animations**, and **intermediate confirmation actions**.

---

## ✨ Features

- **Electron + Vite + Vue 3** desktop app setup.
- **TailwindCSS** for clean, responsive UI.
- **Drag & Drop with `@dnd-kit/dom`**:
  - Reorder tasks inside a section.
  - Move tasks between sections.
  - Move tasks across boards.
- **Virtualization with `@tanstack/vue-virtual`**:
  - Supports thousands of tasks without lag.
  - Handles uneven card heights.
- **Positioning rules** for consistent ordering:
  - Between two tasks → position = average of neighbors.
  - At start → decrement by 5.
  - At end → increment by 5.
  - Empty section → position starts at 250.
- **Confirmation modal** when detaching from the **Scheduled** section.
- **Arrow buttons** on tasks to move left/right between boards.
- **Dashboard grid** for grid-based task sorting.

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/polmayur01/blitzit-dnd-vue-electron
cd blitzit-dnd-vue-electron
