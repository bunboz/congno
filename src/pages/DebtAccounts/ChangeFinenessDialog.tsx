import { useState } from 'react';
import { Box, Button, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import FormDialog from '../../components/FormDialog';
import StatusBadge from '../../components/StatusBadge';
import { convertBalance, parseNum, validateUpgrade } from '../../lib/fineness';
import { num } from '../../lib/format';
import type { DebtAccount } from '../../lib/types';

const r4 = (n: number) => Math.round(n * 1e4) / 1e4;

interface Props { account: DebtAccount; today: string; open: boolean; onClose: () => void; onConfirm: (next: number, from: string, reason: string) => void }

export default function ChangeFinenessDialog({ account, today, open, onClose, onConfirm }: Props) {
  const [next, setNext] = useState('');
  const [from, setFrom] = useState(today);
  const [reason, setReason] = useState('');

  const errs = validateUpgrade(account.fineness, next, reason, from, account.effectiveFrom);
  const valid = Object.keys(errs).length === 0;
  const n = parseNum(next);
  const preview = Number.isFinite(n) && n > 0 && n <= 100 ? convertBalance(account.balance, account.fineness, n) : null;
  const b = account.balance;
  const k24 = (w: number, f: number) => r4((w * f) / 100);
  const delta = preview
    ? r4(Math.abs(k24(b.goldDelivered, account.fineness) - k24(preview.goldDelivered, n)) + Math.abs(k24(b.goldPending, account.fineness) - k24(preview.goldPending, n)))
    : null;
  const nextV = account.version + 1;
  const close = () => { setNext(''); setReason(''); setFrom(today); onClose(); };

  const rows: [string, string, string][] = [
    ['Dư nợ Vàng đã giao', `${num(b.goldDelivered, 4)} Lượng`, preview ? `${num(preview.goldDelivered, 4)} Lượng` : '—'],
    ['Hàng chưa giao (Chờ xuất)', `${num(b.goldPending, 4)} Lượng`, preview ? `${num(preview.goldPending, 4)} Lượng` : '—'],
    ['Tiền công (VNĐ)', `${num(b.labor)} đ`, preview ? `${num(preview.labor)} đ` : '—'],
  ];

  return (
    <FormDialog open={open} onClose={close} width={800} title={<>Đổi Tuổi Đối Chiếu: {account.code} <StatusBadge tone="green">v{account.version} → v{nextV}</StatusBadge></>}
      footer={<>
        <Button variant="outlined" color="inherit" onClick={close}>Hủy Bỏ</Button>
        <Button variant="contained" disabled={!valid} onClick={() => { onConfirm(n, from, reason.trim()); close(); }}>Xác Nhận Đổi Tuổi (v{nextV})</Button>
      </>}>
      <Typography variant="body2" sx={{ mb: 2 }}>Khách hàng: <b>{account.customerName}</b> — {account.customerCompany} · Mã đối chiếu: <b>{account.code}</b> (Kênh: {account.channel} • ĐVT: Lượng)</Typography>
      <Typography variant="subtitle1" sx={{ color: 'primary.main', mb: 1 }}>Thông tin phiên bản & hiệu lực</Typography>
      <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
        <Box sx={{ flex: 1, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: '6px', bgcolor: '#fff' }}>
          <Typography variant="caption">Phiên bản hiện tại (v{account.version})</Typography>
          <Typography sx={{ fontSize: 22, fontWeight: 600 }}>{account.fineness.toFixed(2)}% <Typography component="span" variant="caption">Tuổi cũ</Typography></Typography>
        </Box>
        <Box sx={{ flex: 1.3, p: 1.5, border: '2px solid', borderColor: 'primary.main', borderRadius: '6px', bgcolor: '#fff' }}>
          <Typography variant="caption">Phiên bản mới (v{nextV}) {preview && <StatusBadge tone={n - account.fineness >= 0 ? 'green' : 'red'}>{n - account.fineness >= 0 ? '+' : ''}{(n - account.fineness).toFixed(2)}%</StatusBadge>}</Typography>
          <TextField size="small" fullWidth value={next} onChange={(e) => setNext(e.target.value)} placeholder="Tuổi mới" error={!!errs.fineness && next !== ''}
            helperText={next !== '' ? errs.fineness : 'Tuổi đối chiếu mới áp dụng'} InputProps={{ endAdornment: <span>%</span> }} />
        </Box>
        <TextField size="small" type="date" label="Ngày bắt đầu hiệu lực *" value={from} onChange={(e) => setFrom(e.target.value)} sx={{ flex: 1 }}
          InputLabelProps={{ shrink: true }} error={!!errs.date} helperText={errs.date ?? 'Chốt sổ version cũ từ 00:00 ngày này'} />
      </Stack>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle1" sx={{ color: 'primary.main' }}>Quy Đổi Số Dư Nợ (giữ nguyên vàng 24K)</Typography>
        {delta !== null && <StatusBadge tone={delta === 0 ? 'green' : 'red'}>Δ Vàng 24K = {delta.toFixed(4)} ({delta === 0 ? 'Bảo toàn' : 'Lệch'})</StatusBadge>}
      </Stack>
      <Table size="small" sx={{ mb: 2, bgcolor: '#fff' }}>
        <TableHead><TableRow>
          <TableCell>Chỉ tiêu công nợ</TableCell><TableCell align="right">Version v{account.version} ({account.fineness.toFixed(2)}%)</TableCell>
          <TableCell align="right">Version v{nextV} ({preview ? `${n.toFixed(2)}%` : '—'})</TableCell>
        </TableRow></TableHead>
        <TableBody>{rows.map((r) => (
          <TableRow key={r[0]}><TableCell>{r[0]}</TableCell><TableCell align="right">{r[1]}</TableCell>
            <TableCell align="right" sx={{ color: 'primary.main', fontWeight: 600 }}>{r[2]}</TableCell></TableRow>
        ))}</TableBody>
      </Table>
      <TextField fullWidth multiline minRows={2} required label="Lý do thay đổi" value={reason} onChange={(e) => setReason(e.target.value)} InputLabelProps={{ shrink: true }}
        placeholder="VD: Nâng tuổi theo Phụ lục số 12/2026/PL-SEV ngày 12/11/2026" error={!!errs.reason && reason !== ''} helperText={reason !== '' ? errs.reason : 'Tối thiểu 6 ký tự, ghi căn cứ phụ lục thỏa thuận'} />
    </FormDialog>
  );
}
