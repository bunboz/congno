import { Button, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import FormDialog from './FormDialog';

// Hành động có hậu quả (khóa, kích hoạt, xóa) luôn phải nói rõ hậu quả và hỏi lại trước khi làm.
export default function ConfirmDialog({ title, children, confirmLabel, danger, onConfirm, onClose }: {
  title: string; children: ReactNode; confirmLabel: string; danger?: boolean; onConfirm: () => void; onClose: () => void;
}) {
  return (
    <FormDialog open onClose={onClose} width={420} title={title}
      footer={<>
        <Button variant="outlined" data-autofocus onClick={onClose}>Hủy</Button>
        <Button variant="contained" color={danger ? 'error' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
      </>}>
      <Typography component="div">{children}</Typography>
    </FormDialog>
  );
}
