import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface Props { label: string; value: ReactNode; hint?: string; color?: string; icon?: string }

// Phẳng như ERP: viền 1px, radius 6, không bóng.
export default function KpiCard({ label, value, hint, color = '#07554b', icon }: Props) {
  return (
    <Box sx={{ flex: 1, minWidth: 200, p: 2, bgcolor: '#fff', border: '1px solid #e4e6e6', borderRadius: '6px' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 500 }}>{label}</Typography>
        {icon && (
          <Box aria-hidden sx={{ width: 28, height: 28, borderRadius: '6px', display: 'grid', placeItems: 'center', color, bgcolor: `${color}14` }}>
            <span className="material-icons" style={{ fontSize: 18 }}>{icon}</span>
          </Box>
        )}
      </Stack>
      <Typography sx={{ fontSize: 24, fontWeight: 600, color, lineHeight: 1.3, mt: 0.5 }}>{value}</Typography>
      {hint && <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 400 }}>{hint}</Typography>}
    </Box>
  );
}
