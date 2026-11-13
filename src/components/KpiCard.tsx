import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export default function KpiCard({ label, value, hint, color }: { label: string; value: ReactNode; hint?: string; color?: string }) {
  return (
    <Box sx={{ flex: 1, minWidth: 180, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: '6px', bgcolor: '#fff' }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 500 }}>{label}</Typography>
      <Typography sx={{ fontSize: 24, fontWeight: 600, color: color ?? 'primary.main', lineHeight: 1.3 }}>{value}</Typography>
      {hint && <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 400 }}>{hint}</Typography>}
    </Box>
  );
}
