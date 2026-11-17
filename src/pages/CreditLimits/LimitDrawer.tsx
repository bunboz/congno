import { useState } from 'react';
import { Autocomplete, Box, Button, Stack, Typography } from '@mui/material';
import Field from '../../components/Field';
import FormDrawer from '../../components/FormDrawer';
import StatusBadge from '../../components/StatusBadge';
import { useStore } from '../../state/store';
import { amountInWords, validateLimits } from '../../lib/credit';
import { num } from '../../lib/format';
import type { Customer, LimitRow } from '../../lib/types';
import { colors } from '../../tokens';

const toNum = (s: string): number | null => (s.trim() === '' ? null : Number(s.trim().replace(',', '.')));
const toStr = (n: number | null) => (n === null ? '' : String(n));

interface Props { open: boolean; row: LimitRow | null; onClose: () => void; onSaved: (c: Customer) => void }

export default function LimitDrawer({ open, row, onClose, onSaved }: Props) {
  const { customers, accounts, saveLimit } = useStore();
  const editing = !!row;
  const [customer, setCustomer] = useState<Customer | null>(row ? customers.find((c) => c.code === row.customerCode) ?? null : null);
  const [gold, setGold] = useState(toStr(row?.goldLimit ?? null));
  const [silver, setSilver] = useState(toStr(row?.silverLimit ?? null));
  const [labor, setLabor] = useState(toStr(row?.laborLimit ?? null));
  const [term, setTerm] = useState(String(row?.termDays ?? 30));
  const [note, setNote] = useState(row?.approvalNote ?? '');

  const g = toNum(gold), s = toNum(silver), l = toNum(labor), t = term.trim() === '' ? NaN : Number(term);
  const errs = validateLimits({ gold: g, silver: s, labor: l, termDays: t });
  const valid = !!customer && Object.keys(errs).length === 0 && note.length <= 500;
  const goldAcc = accounts.find((a) => a.customerCode === customer?.code && a.material === 'GOLD' && a.isActive);

  const save = () => {
    if (!valid || !customer) return;
    saveLimit({ customerCode: customer.code, goldLimit: g, silverLimit: s, laborLimit: l, termDays: t, approvalNote: note,
      debt: row?.debt ?? { gold: 0, silver: 0, labor: 0 }, nextDueDate: row?.nextDueDate ?? null });
    onSaved(customer); onClose();
  };
  const title = editing ? `Chỉnh sửa Cấu hình Hạn Mức Tín Dụng - ${customer?.company ?? ''}` : 'Tạo Mới Cấu Hình Hạn Mức Tín Dụng';

  return (
    <FormDrawer open={open} onClose={onClose} onEnter={save} title={title} width={600}
      footer={<><Button variant="outlined" color="inherit" onClick={onClose}>Hủy Bỏ</Button><Button variant="contained" disabled={!valid} onClick={save}>Lưu Cấu Hình Hạn Mức</Button></>}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <Typography variant="subtitle1" sx={{ color: colors.label }}>Khách hàng: Mã - Tên công ty <span style={{ color: colors.error }}>*</span></Typography>
        {editing && <StatusBadge tone="green">Đang chỉnh sửa cho khách hàng này</StatusBadge>}
      </Stack>
      <Autocomplete size="small" disabled={editing} options={customers} value={customer} onChange={(_, c) => setCustomer(c)}
        getOptionLabel={(c) => `${c.code} - ${c.company}`} renderInput={(p) => <Field {...p} autoFocus={!editing} placeholder="Chọn khách hàng" />} />
      {editing && <Typography variant="caption" sx={{ color: 'success.main' }}>* Mặc định là khách hàng đang muốn chỉnh sửa</Typography>}

      {row && (
        <Stack direction="row" spacing={4} sx={{ my: 2, p: 1.5, bgcolor: colors.tint, borderRadius: '8px' }}>
          <Box><Typography variant="caption" color="text.secondary">DƯ NỢ VÀNG HIỆN TẠI</Typography>
            <Typography sx={{ fontWeight: 600, color: 'success.main' }}>{num(row.debt.gold, 4)} Lượng</Typography>
            {goldAcc && <Typography variant="caption" color="text.secondary">Tuổi quy ước đối chiếu: {goldAcc.fineness}%</Typography>}</Box>
          <Box><Typography variant="caption" color="text.secondary">DƯ NỢ TIỀN CÔNG HIỆN TẠI</Typography>
            <Typography sx={{ fontWeight: 600, color: 'success.main' }}>{num(row.debt.labor)} VNĐ</Typography></Box>
        </Stack>
      )}

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" sx={{ color: 'primary.main', mb: 1.5 }}>Hạn Mức Công Nợ & Thời Hạn Thanh Toán</Typography>
        <Stack spacing={2}>
          <Field size="small" fullWidth label="Hạn mức nợ Vàng tối đa (Lượng)" value={gold} onChange={(e) => setGold(e.target.value)} error={!!errs.gold}
            helperText={errs.gold ?? 'tính trên vàng 99.99%'} InputLabelProps={{ shrink: true }} InputProps={{ endAdornment: <span>Lượng</span> }} />
          <Field size="small" fullWidth label="Hạn mức nợ Bạc tối đa (Lượng)" value={silver} onChange={(e) => setSilver(e.target.value)} error={!!errs.silver}
            helperText={errs.silver ?? 'tính trên bạc 99.99%'} InputLabelProps={{ shrink: true }} InputProps={{ endAdornment: <span>Lượng</span> }} />
          <Field size="small" fullWidth label="Hạn mức nợ Tiền công tối đa (VNĐ)" value={labor ? Number(labor).toLocaleString('en-US') : ''} onChange={(e) => setLabor(e.target.value.replace(/\D/g, ''))} error={!!errs.labor}
            helperText={errs.labor ?? (l ? `Bằng chữ: ${amountInWords(l)}` : 'Để trống hoặc 0 = không giới hạn')} InputLabelProps={{ shrink: true }} InputProps={{ endAdornment: <span>VNĐ</span> }} />
          <Field size="small" fullWidth required label="Số ngày được phép nợ (Kỳ hạn thanh toán)" value={term} onChange={(e) => setTerm(e.target.value)} error={!!errs.termDays}
            helperText={errs.termDays ?? '0 - 365 ngày (0 = thanh toán ngay)'} InputLabelProps={{ shrink: true }} InputProps={{ endAdornment: <span>Ngày</span> }} />
          <Field size="small" fullWidth multiline minRows={2} label="Ghi chú nghiệp vụ / Căn cứ phê duyệt" value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 500))} InputLabelProps={{ shrink: true }} />
        </Stack>
      </Box>
    </FormDrawer>
  );
}
