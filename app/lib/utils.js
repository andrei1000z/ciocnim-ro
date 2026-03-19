/**
 * Safe localStorage — fallback for private browsing, blocked storage, etc.
 */
export const safeLS = {
  get: (key) => { try { return typeof window !== 'undefined' ? localStorage.getItem(key) : null; } catch { return null; } },
  set: (key, val) => { try { if (typeof window !== 'undefined') localStorage.setItem(key, val); } catch {} },
  del: (key) => { try { if (typeof window !== 'undefined') localStorage.removeItem(key); } catch {} },
};

/**
 * Safe clipboard — fallback for HTTP, old browsers, restricted contexts
 */
export function safeCopy(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(() => {});
    } else {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch {}
      document.body.removeChild(ta);
    }
  } catch {}
}
