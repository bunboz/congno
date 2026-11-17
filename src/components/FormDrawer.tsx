import { Box, Drawer, IconButton, Stack, Typography } from '@mui/material';
import { useEffect, useRef, type ReactNode } from 'react';
import { enterKey } from '../lib/enterKey';

// Ô nhập đầu tiên (không bị khóa) nhận con trỏ khi drawer mở, kể cả drawer được gắn vào trang ở trạng thái mở sẵn.
const FOCUS = 'input:not([disabled]):not([type=hidden]), textarea:not([disabled]), [data-autofocus]';

interface Props { open: boolean; onClose: () => void; title: string; subtitle?: string; children: ReactNode; footer: ReactNode; width?: number; onEnter?: () => void }

// Drawer phải; header = Title + nút đóng, footer cố định đáy căn phải (Figma DS: Header/Footer popup).
export default function FormDrawer({ open, onClose, title, subtitle, children, footer, width = 560, onEnter }: Props) {
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => body.current?.querySelector<HTMLElement>(FOCUS)?.focus(), 250);
    return () => clearTimeout(t);
  }, [open]);
  return (
    <Drawer anchor="right" open={open} onClose={onClose} ModalProps={{ disableAutoFocus: true }} PaperProps={{ sx: { width, maxWidth: '100vw', display: 'flex', flexDirection: 'column' } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box>
          <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600 }}>{title}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 400 }}>{subtitle}</Typography>}
        </Box>
        <IconButton size="small" aria-label="Đóng" onClick={onClose}><span className="material-icons">close</span></IconButton>
      </Stack>
      <Box ref={body} onKeyDown={enterKey(onEnter)} sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: 'background.paper' }}>{children}</Box>
      <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>{footer}</Stack>
    </Drawer>
  );
}
