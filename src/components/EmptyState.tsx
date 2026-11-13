import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export default function EmptyState({ icon = 'search_off', title, hint, children }: { icon?: string; title: string; hint?: string; children?: ReactNode }) {
  return (
    <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
      <span className="material-icons" aria-hidden style={{ fontSize: 36, color: '#c4c9d0' }}>{icon}</span>
      <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>{title}</Typography>
      {hint && <Typography sx={{ fontSize: 13 }}>{hint}</Typography>}
      {children && <Box sx={{ mt: 1.5 }}>{children}</Box>}
    </Box>
  );
}
