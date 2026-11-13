import { useEffect, useRef } from 'react';

// When `dep` changes (next step, back, next stage), bring the top of the
// referenced element back into view, just below the sticky main nav.
// Only scrolls up: if the top of the element is already on screen, nothing moves.
export function useScrollToTopOnChange(ref, dep) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const el = ref.current;
    if (!el) return;
    const nav = document.querySelector('nav[aria-label="Main"]');
    const offset = (nav ? nav.getBoundingClientRect().height : 0) + 12;
    if (el.getBoundingClientRect().top >= offset) return;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
  }, [dep]);
}
