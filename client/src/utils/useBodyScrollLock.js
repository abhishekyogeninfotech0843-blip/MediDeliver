import { useEffect } from "react";

let lockCount = 0;
let previousOverflow = "";
let previousPaddingRight = "";

/**
 * Locks the body scrolling when a modal is opened.
 * Uses reference counting so nested/stacked modals don't break each other.
 * Also accounts for scrollbar width so the UI does not jump horizontally.
 */
export const lockBodyScroll = () => {
  lockCount++;
  if (lockCount === 1) {
    previousOverflow = document.body.style.overflow;
    previousPaddingRight = document.body.style.paddingRight;

    // Calculate scrollbar width
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.classList.add("modal-open-scroll-locked");
  }
};

/**
 * Unlocks body scrolling when a modal is closed.
 */
export const unlockBodyScroll = () => {
  lockCount--;
  if (lockCount <= 0) {
    lockCount = 0;
    document.body.style.overflow = previousOverflow || "";
    document.body.style.paddingRight = previousPaddingRight || "";
    document.body.classList.remove("modal-open-scroll-locked");
  }
};

/**
 * React hook to automatically lock body scroll when `isLocked` is true.
 * @param {boolean} isLocked Whether the modal is currently open/locked.
 */
export const useBodyScrollLock = (isLocked) => {
  useEffect(() => {
    if (isLocked) {
      lockBodyScroll();
      return () => {
        unlockBodyScroll();
      };
    }
  }, [isLocked]);
};

export default useBodyScrollLock;
