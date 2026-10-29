import { useEffect, useRef } from 'react';

export const EMBED_HEIGHT_MESSAGE = 'kadchma:embed-height';
const REFRESH_MS = 2 * 60 * 1000;

/**
 * Wraps an embed page: reports its height to the parent window so the portal
 * can size the iframe without an inner scrollbar, and re-fetches data every
 * two minutes so a long-open portal tab stays current.
 */
export function EmbedFrame({ children, onRefresh }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.parent === window) return;
    const post = () => {
      window.parent.postMessage(
        { type: EMBED_HEIGHT_MESSAGE, height: Math.ceil(el.offsetHeight) },
        '*',
      );
    };
    const observer = new ResizeObserver(post);
    observer.observe(el);
    post();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!onRefresh) return;
    const id = setInterval(onRefresh, REFRESH_MS);
    return () => clearInterval(id);
  }, [onRefresh]);

  return (
    <div ref={ref} style={{ padding: '24px 16px' }}>
      <div style={{ margin: '0 auto', maxWidth: 1360, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {children}
      </div>
    </div>
  );
}
