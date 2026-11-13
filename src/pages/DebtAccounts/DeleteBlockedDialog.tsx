import { Button, Typography } from '@mui/material';
import FormDialog from '../../components/FormDialog';
import { canDelete } from '../../lib/account';
import type { DebtAccount } from '../../lib/types';

interface Props { account: DebtAccount; open: boolean; onClose: () => void; onSuspend: () => void; onDelete: () => void }

// US-01 AC-06: đã có bút toán thì chỉ hiện "Chuyển sang Ngưng hoạt động" và "Đóng", không có nút xóa.
export default function DeleteBlockedDialog({ account, open, onClose, onSuspend, onDelete }: Props) {
  const blocked = !canDelete(account);
  return (
    <FormDialog open={open} onClose={onClose} width={600}
      title={blocked ? 'Không thể xóa mã đối chiếu!' : `Xóa mã đối chiếu ${account.code}?`}
      footer={blocked ? <>
        <Button variant="outlined" color="inherit" onClick={onClose}>Đóng</Button>
        <Button variant="contained" onClick={onSuspend}>Chuyển sang Ngưng hoạt động</Button>
      </> : <>
        <Button variant="outlined" color="inherit" onClick={onClose}>Hủy</Button>
        <Button variant="contained" color="error" onClick={onDelete}>Xóa vĩnh viễn</Button>
      </>}>
      <Typography>{blocked
        ? `Tài khoản này đã phát sinh ${account.journalEntryCount} bút toán trong sổ cái công nợ kế toán. Theo nguyên tắc bất biến kế toán, chỉ được phép chuyển sang trạng thái Ngưng hoạt động.`
        : `Xóa vĩnh viễn mã ${account.code}? Không thể hoàn tác.`}</Typography>
    </FormDialog>
  );
}
