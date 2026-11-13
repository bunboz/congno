import { Box } from '@mui/material';
import type { ReactNode } from 'react';

// Khối trắng trên nền xám nhạt, như vùng nội dung ERP Mua hàng.
export default function Card({ children }: { children: ReactNode }) {
  return <Box sx={{ bgcolor: '#fff', border: '1px solid #ececec', borderRadius: '8px', p: 1.5 }}>{children}</Box>;
}
