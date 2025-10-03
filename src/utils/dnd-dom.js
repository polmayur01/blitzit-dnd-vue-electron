let DndDom = null;
try {
  DndDom = await import("@dnd-kit/dom");
} catch (_) {
  DndDom = null;
}

function createBus() {
  const map = new Map();
  return {
    on(t, fn) {
      const a = map.get(t) || [];
      a.push(fn);
      map.set(t, a);
      return () => this.off(t, fn);
    },
    off(t, fn) {
      const a = map.get(t) || [];
      const i = a.indexOf(fn);
      if (i >= 0) a.splice(i, 1);
      map.set(t, a);
    },
    emit(t, p) {
      (map.get(t) || []).forEach((fn) => fn(p));
    },
    clear() {
      map.clear();
    },
  };
}

export function computeDropIndex({ container, itemRects, y }) {
  const rect = container.getBoundingClientRect();
  const pointerY = y - rect.top + container.scrollTop;
  if (!itemRects.length) return 0;
  for (let i = 0; i < itemRects.length; i++) {
    const r = itemRects[i];
    const center = r.top + r.height / 2;
    if (pointerY < center) return r.index;
  }
  return itemRects[itemRects.length - 1].index + 1;
}

export function autoScroll(
  container,
  { y },
  { speed = 14, threshold = 56 } = {}
) {
  const rect = container.getBoundingClientRect();
  if (y < rect.top + threshold) container.scrollTop -= speed;
  else if (y > rect.bottom - threshold) container.scrollTop += speed;
}

function directItems(container, selector, exclude) {
  return Array.from(container.children).filter(
    (el) =>
      el.matches?.(selector) &&
      el !== exclude &&
      !el.classList.contains("dnd-origin-collapsed")
  );
}

export default function createDnd(options = {}) {
  const opts = {
    z: 10000,
    itemSelector: "[data-id]",
    collapseSource: true,
    showPlaceholder: true,
    ghost: true,
    placeholderClass: "dnd-placeholder",
    originCollapsedClass: "dnd-origin-collapsed",
    ...options,
  };

  const bus = createBus();

  const state = {
    active: /** @type null | {
      id:string, el:HTMLElement, data:any,
      ghostEl?:HTMLElement, height:number, grabX:number, grabY:number,
      sourceDroppableId?:string
    } */ (null),
    overId: /** @type null | string */ (null),
    draggables: new Map(),
    droppables: new Map(),
  };

  function within(rect, x, y) {
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  }
  function findOver(x, y) {
    for (const [id, { el }] of state.droppables.entries()) {
      const r = el.getBoundingClientRect();
      if (within(r, x, y)) return id;
    }
    return null;
  }
  function findSourceDroppableId(node) {
    for (const [id, d] of state.droppables.entries())
      if (d.el.contains(node)) return id;
    return null;
  }

  function makeGhost(fromEl, atX, atY) {
    const r = fromEl.getBoundingClientRect();
    const g = fromEl.cloneNode(true);
    g.style.position = "fixed";
    g.style.left = r.left + "px";
    g.style.top = r.top + "px";
    g.style.width = r.width + "px";
    g.style.height = r.height + "px";
    g.style.pointerEvents = "none";
    g.style.zIndex = String(opts.z);
    g.style.willChange = "transform";
    g.classList.add("dnd-ghost");
    return {
      ghost: g,
      grabX: atX - r.left,
      grabY: atY - r.top,
      height: r.height,
    };
  }
  function moveGhost(ghost, grabX, grabY, x, y) {
    ghost.style.transform = `translate3d(${x - grabX}px, ${y - grabY}px, 0)`;
  }

  function ensurePlaceholder(droppableId, height) {
    const d = state.droppables.get(droppableId);
    if (!d) return null;
    if (!d.placeholderEl) {
      const ph = document.createElement("div");
      ph.className = opts.placeholderClass;
      ph.style.height = height + "px";
      ph.style.margin = "4px 0";
      ph.style.border = "2px dashed #3b82f6";
      ph.style.borderRadius = "8px";
      ph.style.background = "rgba(59,130,246,0.08)";
      d.placeholderEl = ph;
    } else {
      d.placeholderEl.style.height = height + "px";
    }
    return d.placeholderEl;
  }
  function removePlaceholder(droppableId) {
    const d = state.droppables.get(droppableId);
    if (d?.placeholderEl?.parentElement)
      d.placeholderEl.parentElement.removeChild(d.placeholderEl);
    if (d) {
      d.placeholderEl = undefined;
      d.lastIndex = undefined;
    }
  }
  function updatePlaceholderPosition(droppableId, index) {
    const d = state.droppables.get(droppableId);
    if (!d || !d.placeholderEl) return;

    const container = d.container || d.el;
    const items = directItems(container, opts.itemSelector, d.placeholderEl);

    const clamped = Math.max(0, Math.min(index, items.length));
    if (d.lastIndex === clamped && d.placeholderEl.parentElement) return; 

    const target = clamped >= items.length ? null : items[clamped];
    if (target) container.insertBefore(d.placeholderEl, target);
    else container.appendChild(d.placeholderEl);

    d.lastIndex = clamped;
  }

  function makePointerDraggable(el, { id, data, handleSelector }) {
    const handle = handleSelector ? el.querySelector(handleSelector) : el;
    if (!handle) return () => {};

    let pointerId = null;

    function onDown(e) {
      if (e.button !== 0) return;
      pointerId = e.pointerId;
      handle.setPointerCapture(pointerId);

      const sourceDroppableId = findSourceDroppableId(el);

      let ghostEl,
        grabX = 0,
        grabY = 0,
        height = el.offsetHeight || 64;
      if (opts.ghost) {
        const g = makeGhost(el, e.clientX, e.clientY);
        ghostEl = g.ghost;
        grabX = g.grabX;
        grabY = g.grabY;
        height = g.height || height;
        moveGhost(ghostEl, grabX, grabY, e.clientX, e.clientY);
      }

      if (opts.showPlaceholder && sourceDroppableId) {
        const d = state.droppables.get(sourceDroppableId);
        const container = d?.container || d?.el;
        if (container) {
          const ph = ensurePlaceholder(sourceDroppableId, height);
          const items = directItems(container, opts.itemSelector, ph);
          const sourceIndex = Math.max(
            0,
            items.findIndex((n) => n === el)
          );
          updatePlaceholderPosition(sourceDroppableId, sourceIndex);
          state.overId = sourceDroppableId;
          if (d) d.lastIndex = sourceIndex;
        }
      }

      if (opts.collapseSource) {
        el.classList.add(opts.originCollapsedClass); 
      }

      state.active = {
        id,
        el,
        data,
        ghostEl,
        height,
        grabX,
        grabY,
        sourceDroppableId,
      };
      document.body.style.userSelect = "none";

      bus.emit("drag:start", {
        id,
        data,
        el,
        x: e.clientX,
        y: e.clientY,
        source: { droppableId: sourceDroppableId },
        height,
      });
    }

    function onMove(e) {
      if (pointerId !== e.pointerId || !state.active) return;

      const a = state.active;
      if (a.ghostEl)
        moveGhost(a.ghostEl, a.grabX, a.grabY, e.clientX, e.clientY);

      const overId = findOver(e.clientX, e.clientY);
      if (overId !== state.overId) {
        if (state.overId) removePlaceholder(state.overId);
        state.overId = overId;
        bus.emit("drag:over", { overId, event: e });
      }

      if (state.overId) {
        const d = state.droppables.get(state.overId);
        const container = d?.container || d?.el;
        if (container) autoScroll(container, { y: e.clientY });

        if (opts.showPlaceholder && container) {
          const ph = ensurePlaceholder(state.overId, a.height);

          const items = directItems(container, opts.itemSelector, ph);
          const containerRect = container.getBoundingClientRect();
          const itemRects = items.map((node, i) => {
            const r = node.getBoundingClientRect();
            return {
              top: r.top - containerRect.top + container.scrollTop,
              height: r.height,
              index: i,
            };
          });

          const index = computeDropIndex({
            container,
            itemRects,
            y: e.clientY,
          });
          updatePlaceholderPosition(state.overId, index);
        }
      }

      bus.emit("drag:move", {
        id: a.id,
        data: a.data,
        el: a.el,
        x: e.clientX,
        y: e.clientY,
        overId: state.overId,
      });
    }

    function onUp(e) {
      if (pointerId !== e.pointerId || !state.active) return;
      try {
        handle.releasePointerCapture(pointerId);
      } catch {}
      pointerId = null;

      const a = state.active;
      const dropTargetId = state.overId;

      let dropIndex = null;
      if (dropTargetId) {
        const d = state.droppables.get(dropTargetId);
        dropIndex = d?.lastIndex ?? null;
      }

      a.ghostEl?.remove();
      a.el.classList.remove(opts.originCollapsedClass);
      if (dropTargetId) removePlaceholder(dropTargetId);
      document.body.style.userSelect = "";

      state.active = null;
      state.overId = null;

      bus.emit("drag:end", {
        id,
        data: a.data,
        dropTargetId,
        dropIndex,
        x: e.clientX,
        y: e.clientY,
      });
    }

    handle.addEventListener("pointerdown", onDown);
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);

    return () => {
      handle.removeEventListener("pointerdown", onDown);
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
    };
  }

  function registerDraggable({ id, el, data = {}, handleSelector }) {
    if (!el) return () => {};
    if (DndDom?.createDraggable) {
      const inst = DndDom.createDraggable(el, {
        id,
        data,
        onStart: (e) =>
          bus.emit("drag:start", { id, data, el, x: e.clientX, y: e.clientY }),
        onMove: (e) =>
          bus.emit("drag:move", {
            id,
            data,
            el,
            x: e.clientX,
            y: e.clientY,
            overId: state.overId,
          }),
        onEnd: (e) =>
          bus.emit("drag:end", {
            id,
            data,
            dropTargetId: state.overId,
            x: e.clientX,
            y: e.clientY,
          }),
      });
      state.draggables.set(id, { el, data, handle: null });
      return () => {
        inst.destroy?.();
        state.draggables.delete(id);
      };
    }
    const destroy = makePointerDraggable(el, { id, data, handleSelector });
    state.draggables.set(id, { el, data, handle: handleSelector });
    return () => {
      destroy();
      state.draggables.delete(id);
    };
  }

  function registerDroppable({ id, el, data = {}, container }) {
    if (!el) return () => {};
    state.droppables.set(id, { el, data, container: container || el });
    return () => {
      removePlaceholder(id);
      state.droppables.delete(id);
    };
  }

  return {
    on: (t, f) => bus.on(t, f),
    off: (t, f) => bus.off(t, f),
    registerDraggable,
    registerDroppable,
    destroy() {
      bus.clear();
      state.draggables.clear();
      state.droppables.clear();
    },
    _state: state,
  };
}
