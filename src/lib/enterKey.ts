import type { KeyboardEvent } from 'react';

// Enter ở ô nhập một dòng thì xác nhận; không đụng textarea, nút, hay ô chọn có danh sách.
export const enterKey = (fn?: () => void) => fn && ((e: KeyboardEvent) => {
  const t = e.target as HTMLElement;
  if (e.key === 'Enter' && t.tagName === 'INPUT' && t.getAttribute('role') !== 'combobox') { e.preventDefault(); fn(); }
});
