import { Box, Dialog, IconButton, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { enterKey } from '../lib/enterKey';

interface Props { open: boolean; onClose: () => void; title: ReactNode; subtitle?: string; width: number; children: ReactNode; footer?: ReactNode; headerExtra?: ReactNode; onEnter?: () => void }

// Popup chuẩn DS: rộng cố định (420/600/800/840/960 hoặc 880 theo BA), header + footer căn phải.
export default function FormDialog({ open, onClose, title, subtitle, width, children, footer, headerExtra, onEnter }: Props) {
  return (
    <Dialog open={open} onClose={onClose} disableAutoFocus TransitionProps={{ onEntered: (node: HTMLElement) => node.querySelector<HTMLElement>('input:not([disabled]):not([type=hidden]), textarea:not([disabled]), [data-autofocus]')?.focus() }} maxWidth={false} PaperProps={{ sx: { width, maxWidth: 'calc(100vw - 32px)', borderRadius: '8px' } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box>
          <Typography variant="h6" component="div">{title}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 400 }}>{subtitle}</Typography>}
        </Box>
        <Stack direction="row" alignItems="center" spacing={1}>
          {headerExtra}
          <IconButton size="small" aria-label="Đóng" onClick={onClose}><span className="material-icons">close</span></IconButton>
        </Stack>
      </Stack>
      <Box onKeyDown={enterKey(onEnter)} sx={{ p: 2, maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', bgcolor: 'background.paper' }}>{children}</Box>
      {footer && <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1} sx={{ px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>{footer}</Stack>}
    </Dialog>
  );
}
