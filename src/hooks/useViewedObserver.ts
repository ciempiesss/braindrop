import { useEffect, type RefObject } from 'react';

interface Options {
  threshold?: number;
  delay?: number;
  skip?: boolean;
}

export function useViewedObserver(
  ref: RefObject<Element | null>,
  onViewed: () => void,
  options?: Options
): void {
  const { threshold = 0.5, delay = 2000, skip = false } = options ?? {};

  useEffect(() => {
    if (skip || !ref.current) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(onViewed, delay);
        } else {
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
        }
      },
      { threshold }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
    // onViewed debe estabilizarse con useCallback en el sitio de llamada
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, skip, threshold, delay]);
}
