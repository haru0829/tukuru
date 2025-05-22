import { useEffect, useRef } from "react";

export const useDragScroll = () => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    const onMouseDown = (e) => {
      isDown = true;
      startX = e.pageX;
      scrollLeft = el.scrollLeft;
      el.classList.add("dragging");
    };

    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX;
      const walk = (x - startX) * -1; // 逆方向に動かす
      el.scrollLeft = scrollLeft + walk;
    };

    const onMouseUpOrLeave = () => {
      isDown = false;
      el.classList.remove("dragging");
    };

    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseup", onMouseUpOrLeave);
    el.addEventListener("mouseleave", onMouseUpOrLeave);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseup", onMouseUpOrLeave);
      el.removeEventListener("mouseleave", onMouseUpOrLeave);
    };
  }, []);

  return ref;
};
