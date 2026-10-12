// Pointer-based drag and drop that works with mouse, pen and touch.
// Mouse/pen: drag starts after a small movement.
// Touch: drag starts after a short press (so normal swipes still scroll the page).
// A press without dragging counts as a tap.

const MOVE_THRESHOLD = 6;
const LONG_PRESS_MS = 180;

export function enableDragAndDrop(root, { onDrop, onTap }) {
  let drag = null;
  let suppressClick = false;

  root.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    const card = e.target.closest('.task');
    if (!card) return;
    drag = {
      card,
      id: card.dataset.task,
      pointerId: e.pointerId,
      type: e.pointerType,
      startX: e.clientX,
      startY: e.clientY,
      x: e.clientX,
      y: e.clientY,
      active: false,
      timer: null,
    };
    if (e.pointerType === 'touch') {
      drag.timer = setTimeout(() => drag && start(), LONG_PRESS_MS);
    } else {
      try { card.setPointerCapture(e.pointerId); } catch { /* pointer already released */ }
    }
  });

  window.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    drag.x = e.clientX;
    drag.y = e.clientY;
    const dist = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY);
    if (!drag.active) {
      if (drag.type === 'touch') {
        if (dist > MOVE_THRESHOLD * 2) cancel(); // the user is scrolling
      } else if (dist > MOVE_THRESHOLD) {
        start();
      }
      return;
    }
    e.preventDefault();
    follow();
  });

  window.addEventListener('pointerup', e => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const d = drag;
    if (d.active) {
      const zone = zoneAt(d.x, d.y);
      finish();
      suppressClick = true;
      setTimeout(() => (suppressClick = false), 0);
      if (zone) onDrop(d.id, zone.dataset.zone);
    } else {
      cancel();
      onTap(d.id);
    }
  });

  window.addEventListener('pointercancel', () => drag && (drag.active ? finish() : cancel()));

  // While dragging on touch screens, stop the page from scrolling.
  window.addEventListener('touchmove', e => { if (drag?.active) e.preventDefault(); }, { passive: false });
  root.addEventListener('contextmenu', e => { if (e.target.closest('.task')) e.preventDefault(); });
  root.addEventListener('click', e => {
    if (suppressClick) { e.stopPropagation(); e.preventDefault(); }
  }, true);

  function start() {
    const rect = drag.card.getBoundingClientRect();
    drag.active = true;
    drag.offsetX = drag.startX - rect.left;
    drag.offsetY = drag.startY - rect.top;
    drag.ghost = drag.card.cloneNode(true);
    drag.ghost.classList.add('drag-ghost');
    drag.ghost.classList.remove('selected');
    drag.ghost.style.width = `${rect.width}px`;
    document.body.appendChild(drag.ghost);
    drag.card.classList.add('dragging');
    document.body.classList.add('is-dragging');
    navigator.vibrate?.(10);
    follow();
  }

  function follow() {
    drag.ghost.style.transform = `translate(${drag.x - drag.offsetX}px, ${drag.y - drag.offsetY}px) rotate(2deg)`;
    const zone = zoneAt(drag.x, drag.y);
    if (zone !== drag.over) {
      drag.over?.classList.remove('over');
      zone?.classList.add('over');
      drag.over = zone;
    }
    autoScroll(drag.y);
  }

  function finish() {
    drag.ghost?.remove();
    drag.card.classList.remove('dragging');
    drag.over?.classList.remove('over');
    document.body.classList.remove('is-dragging');
    cancel();
  }

  function cancel() {
    if (drag?.timer) clearTimeout(drag.timer);
    drag = null;
  }

  function zoneAt(x, y) {
    return document.elementFromPoint(x, y)?.closest('[data-zone]') || null;
  }

  function autoScroll(y) {
    const edge = 60;
    if (y < edge) window.scrollBy(0, -12);
    else if (y > window.innerHeight - edge) window.scrollBy(0, 12);
  }
}
