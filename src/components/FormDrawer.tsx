import { Box, Drawer, IconButton, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface Props { open: boolean; onClose: () => void; title: string; subtitle?: string; children: ReactNode; footer: ReactNode; width?: number }

// Drawer phải; header = Title + nút đóng, footer cố định đáy căn phải (Figma DS: Header/Footer popup).
export default function FormDrawer({ open, onClose, title, subtitle, children, footer, width = 560 }: Props) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width, maxWidth: '100vw', display: 'flex', flexDirection: 'column' } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box>
          <Typography variant="h6">{title}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 400 }}>{subtitle}</Typography>}
        </Box>
        <IconButton size="small" aria-label="Đóng" onClick={onClose}><span className="material-icons">close</span></IconButton>
      </Stack>
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: 'background.paper' }}>{children}</Box>
      <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>{footer}</Stack>
    </Drawer>
  );
}
