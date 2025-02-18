import { useEffect, useRef, useState } from "react";

interface DragToScrollOptions {
  speed?: number;
}

export const useDragToScroll = <T extends HTMLElement>(
  options: DragToScrollOptions = {}
) => {
  const { speed = 1.5 } = options;
  const elementRef = useRef<T | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const mouseCoords = useRef({
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleDragStart = (e: MouseEvent) => {
      const startX = e.pageX - element.offsetLeft;
      const startY = e.pageY - element.offsetTop;
      const scrollLeft = element.scrollLeft;
      const scrollTop = element.scrollTop;

      mouseCoords.current = { startX, startY, scrollLeft, scrollTop };
      setIsMouseDown(true);
      element.style.cursor = "grabbing";
      element.style.userSelect = "none";
    };

    const handleDragEnd = () => {
      setIsMouseDown(false);
      element.style.cursor = "grab";
      element.style.removeProperty("user-select");
    };

    const handleDrag = (e: MouseEvent) => {
      if (!isMouseDown) return;
      e.preventDefault();

      const x = e.pageX - element.offsetLeft;
      const y = e.pageY - element.offsetTop;
      const walkX = (x - mouseCoords.current.startX) * speed;
      const walkY = (y - mouseCoords.current.startY) * speed;

      element.scrollLeft = mouseCoords.current.scrollLeft - walkX;
      element.scrollTop = mouseCoords.current.scrollTop - walkY;
    };

    element.style.cursor = "grab";
    element.addEventListener("mousedown", handleDragStart);
    element.addEventListener("mousemove", handleDrag);
    element.addEventListener("mouseleave", handleDragEnd);
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("mousemove", handleDrag);

    return () => {
      element.removeEventListener("mousedown", handleDragStart);
      element.removeEventListener("mousemove", handleDrag);
      element.removeEventListener("mouseleave", handleDragEnd);
      document.removeEventListener("mouseup", handleDragEnd);
      document.removeEventListener("mousemove", handleDrag);
    };
  }, [isMouseDown, speed]);

  return elementRef;
};
