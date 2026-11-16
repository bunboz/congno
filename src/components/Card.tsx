import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { colors } from '../tokens';

// Khối trắng trên nền xám nhạt, như vùng nội dung ERP Mua hàng.
export default function Card({ children }: { children: ReactNode }) {
  return <Box sx={{ bgcolor: colors.white, border: `1px solid ${colors.cardLine}`, borderRadius: '8px', p: 1.5 }}>{children}</Box>;
}
