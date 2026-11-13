import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

// Tiêu đề trang + một câu mô tả; hành động chính nằm bên phải, luôn ở cùng một chỗ trên mọi màn.
export default function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-end" spacing={2} sx={{ mb: 2 }}>
      <Box>
        <Typography variant="h6" component="h1">{title}</Typography>
        {description && <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{description}</Typography>}
      </Box>
      {action}
    </Stack>
  );
}
