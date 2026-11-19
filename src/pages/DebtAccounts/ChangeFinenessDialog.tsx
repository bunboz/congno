import { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import Field from '../../components/Field';
import FormDialog from '../../components/FormDialog';
import StatusBadge from '../../components/StatusBadge';
import { convertBalance, parseNum, validateUpgrade } from '../../lib/fineness';
import { num } from '../../lib/format';
import type { DebtAccount } from '../../lib/types';
import { colors } from '../../tokens';

const r4 = (n: number) => Math.round(n * 1e4) / 1e4;
const k24 = (w: number, f: number) => r4((w * f) / 100);

interface Props { account: DebtAccount; today: string; open: boolean; onClose: () => void; onConfirm: (next: number, from: string, reason: string) => void }

export default function ChangeFinenessDialog({ account, today, open, onClose, onConfirm }: Props) {
  const [next, setNext] = useState('');
  const [from, setFrom] = useState(today);
  const [reason, setReason] = useState('');

  const errs = validateUpgrade(account.fineness, next, reason, from, account.effectiveFrom);
  const valid = Object.keys(errs).length === 0;
  const n = parseNum(next);
  const b = account.balance;
  // Chỉ hiện quy đổi khi có số dư thật và tuổi mới hợp lệ; không thì bảng toàn số 0 vô nghĩa.
  const preview = !errs.fineness && Number.isFinite(n) && (b.goldDelivered > 0 || b.goldPending > 0) ? convertBalance(b, account.fineness, n) : null;
  const delta = preview
    ? r4(Math.abs(k24(b.goldDelivered, account.fineness) - k24(preview.goldDelivered, n)) + Math.abs(k24(b.goldPending, account.fineness) - k24(preview.goldPending, n)))
    : 0;
  const submit = () => { if (valid) { onConfirm(n, from, reason.trim()); close(); } };
  const close = () => { setNext(''); setReason(''); setFrom(today); onClose(); };

  return (
    <FormDialog open={open} onClose={close} width={600} onEnter={submit} title="Đổi Tuổi Đối Chiếu" subtitle={`${account.code} · ${account.customerName}`}
      footer={<>
        <Button variant="contained" color="inherit" onClick={close}>Hủy Bỏ</Button>
        <Button variant="contained" disabled={!valid} onClick={submit}>Xác Nhận Đổi Tuổi (v{account.version + 1})</Button>
      </>}>
      <Stack spacing={2.5}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Field size="small" label="Tuổi hiện tại" value={`${account.fineness.toFixed(2)}%`} disabled InputLabelProps={{ shrink: true }} sx={{ flex: 1 }} />
          <Field size="small" autoFocus required label="Tuổi mới" value={next} onChange={(e) => setNext(e.target.value)}
            error={!!errs.fineness && next !== ''} helperText={next !== '' ? errs.fineness : undefined}
            InputProps={{ endAdornment: <span>%</span> }} InputLabelProps={{ shrink: true }} sx={{ flex: 1 }} />
          <Field size="small" required type="date" label="Ngày bắt đầu hiệu lực" value={from} onChange={(e) => setFrom(e.target.value)}
            error={!!errs.date} helperText={errs.date} InputLabelProps={{ shrink: true }} sx={{ flex: 1 }} />
        </Stack>

        {preview && (
          <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: '6px', bgcolor: colors.pageBg }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle1">Số dư nợ sau khi quy đổi</Typography>
              <StatusBadge tone={delta === 0 ? 'green' : 'red'}>Vàng 24K {delta === 0 ? 'được bảo toàn' : `lệch ${delta.toFixed(4)}`}</StatusBadge>
            </Stack>
            {[
              ['Dư nợ Vàng đã giao mới', `${num(b.goldDelivered, 4)} → ${num(preview.goldDelivered, 4)} Lượng`],
              ['Hàng chưa giao mới', `${num(b.goldPending, 4)} → ${num(preview.goldPending, 4)} Lượng`],
              ['Dư nợ Tiền công', 'Giữ nguyên'],
            ].map(([label, value]) => (
              <Stack key={label} direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
                <Typography color="text.secondary">{label}</Typography>
                <Typography variant="body2">{value}</Typography>
              </Stack>
            ))}
          </Box>
        )}

        <Field fullWidth multiline minRows={2} required label="Lý do thay đổi" value={reason} onChange={(e) => setReason(e.target.value)} InputLabelProps={{ shrink: true }}
          placeholder="VD: Nâng tuổi theo Phụ lục số 12/2026/PL-SEV ngày 12/11/2026" error={!!errs.reason && reason !== ''}
          helperText={reason !== '' ? errs.reason : undefined} />
      </Stack>
    </FormDialog>
  );
}
