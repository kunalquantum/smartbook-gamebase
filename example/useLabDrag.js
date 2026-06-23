import { useRef, useCallback, useState } from "react";

/**
 * Cursor + hover-highlight feedback for a draggable mesh. Spread the
 * returned handlers alongside drag handlers; use `hovered`/`grabbed` to
 * drive a glow or scale-up effect so it's obvious what can be grabbed.
 */
export function useGrabFeedback() {
  const [hovered, setHovered] = useState(false);
  const [grabbed, setGrabbed] = useState(false);

  const onPointerOver = useCallback((e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "grab";
  }, []);

  const onPointerOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = "auto";
  }, []);

  const onGrabStart = useCallback(() => {
    setGrabbed(true);
    document.body.style.cursor = "grabbing";
  }, []);

  const onGrabEnd = useCallback(() => {
    setGrabbed(false);
    document.body.style.cursor = hovered ? "grab" : "auto";
  }, [hovered]);

  return { hovered, grabbed, onPointerOver, onPointerOut, onGrabStart, onGrabEnd };
}

/**
 * Generic pointer-drag tracker for lab interactions. Call the returned
 * handlers on a mesh's onPointerDown/onPointerMove/onPointerUp/onPointerLeave.
 * `onMove(dx, dy, e)` fires continuously while dragging (screen-space pixel
 * deltas since the previous move); `onEnd(totalDx, totalDy, e)` fires once on
 * release with the cumulative drag since pointerDown.
 */
export function useDrag({ onStart, onMove, onEnd } = {}) {
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const total = useRef({ x: 0, y: 0 });

  const onPointerDown = useCallback(
    (e) => {
      e.stopPropagation();
      e.target.setPointerCapture?.(e.pointerId);
      dragging.current = true;
      last.current = { x: e.clientX, y: e.clientY };
      total.current = { x: 0, y: 0 };
      onStart?.(e);
    },
    [onStart]
  );

  const onPointerMove = useCallback(
    (e) => {
      if (!dragging.current) return;
      e.stopPropagation();
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };
      total.current.x += dx;
      total.current.y += dy;
      onMove?.(dx, dy, e);
    },
    [onMove]
  );

  const endDrag = useCallback(
    (e) => {
      if (!dragging.current) return;
      dragging.current = false;
      e.target.releasePointerCapture?.(e.pointerId);
      onEnd?.(total.current.x, total.current.y, e);
    },
    [onEnd]
  );

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerLeave: endDrag,
  };
}
