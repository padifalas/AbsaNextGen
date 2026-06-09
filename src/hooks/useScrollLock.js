import { useEffect } from 'react';

let lockCount = 0;
let savedScrollY = 0;
let savedStyles = null;

function lockScroll() {
  if (lockCount === 0) {
    savedScrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    savedStyles = {
      bodyOverflow: document.body.style.overflow,
      bodyPaddingRight: document.body.style.paddingRight,
      bodyPosition: document.body.style.position,
      bodyTop: document.body.style.top,
      bodyWidth: document.body.style.width,
      htmlOverflow: document.documentElement.style.overflow,
    };

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.width = '100%';
    document.body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : '';
    document.documentElement.style.overflow = 'hidden';
  }
  lockCount += 1;
}

function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount !== 0 || !savedStyles) return;

  document.body.style.overflow = savedStyles.bodyOverflow;
  document.body.style.paddingRight = savedStyles.bodyPaddingRight;
  document.body.style.position = savedStyles.bodyPosition;
  document.body.style.top = savedStyles.bodyTop;
  document.body.style.width = savedStyles.bodyWidth;
  document.documentElement.style.overflow = savedStyles.htmlOverflow;

  window.scrollTo(0, savedScrollY);
  savedStyles = null;
}

/** lockks page scroll while active*/
export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return undefined;
    lockScroll();
    return unlockScroll;
  }, [active]);
}
