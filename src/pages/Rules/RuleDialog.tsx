import { useState } from 'react';
import { Alert, Autocomplete, Box, Button, Stack, TextField, Typography } from '@mui/material';
import FormDialog from '../../components/FormDialog';
import { useStore } from '../../state/store';
import { approvalLevel, lossRate, validateRule, type Rule } from '../../lib/rules';
import { parseNum } from '../../lib/fineness';
import { CURRENT_USER } from '../../data/mock';
import { MATERIAL_LABEL, type DebtAccount } from '../../lib/types';
import { colors } from '../../tokens';

export default function RuleDialog({ rule, onClose, onSaved }: { rule: Rule | null; onClose: () => void; onSaved: (r: Rule) => void }) {
  const { accounts, customers, today, saveRule } = useStore();
  const editing = !!rule;
  const options = accounts.filter((a) => a.material === 'GOLD' || a.material === 'SILVER');
  const [acc, setAcc] = useState<DebtAccount | null>(rule ? accounts.find((a) => a.code === rule.debtAccountCode) ?? null : null);
  const [from, setFrom] = useState(rule?.effectiveFrom ?? today);
  const [to, setTo] = useState(rule?.effectiveTo ?? '');
  const [kho, setKho] = useState(rule ? String(rule.productionFineness) : '61');
  const [giao, setGiao] = useState(rule ? String(rule.deliveryFineness) : '62');
  const [reason, setReason] = useState(rule?.approvalReason ?? '');
  const [note, setNote] = useState(rule?.note ?? '');
  const [err, setErr] = useState<string | null>(null);

  const customerCode = rule?.customerCode ?? acc?.customerCode ?? '';
  const customer = customers.find((c) => c.code === customerCode);
  const material = (rule?.material ?? acc?.material ?? 'GOLD') as 'GOLD' | 'SILVER';
  const code = rule?.debtAccountCode ?? acc?.code ?? '';

  const errs = validateRule({ production: kho, delivery: giao, reason, effectiveFrom: from, effectiveTo: to || null });
  const k = parseNum(kho), g = parseNum(giao);
  const okNums = Number.isFinite(k) && Number.isFinite(g) && !errs.production && !errs.delivery;
  const loss = okNums ? lossRate(k, g) : null;
  const level = loss === null ? 'NONE' : approvalLevel(loss);
  const valid = !!code && Object.keys(errs).length === 0;

  const save = () => {
    if (!valid) return;
    const r: Rule = {
      id: rule?.id ?? `r${Date.now()}`, debtAccountCode: code, customerCode, material, productionFineness: k, deliveryFineness: g,
      lossRate: lossRate(k, g), effectiveFrom: from, effectiveTo: to || null,
      approvalReason: level === 'NONE' ? null : reason.trim(), approvedRole: level === 'NONE' ? null : level,
      isActive: true, note, updatedBy: CURRENT_USER, updatedAt: new Date().toISOString(),
    };
    const e = saveRule(r);
    if (e) { setErr(e); return; }
    onSaved(r); onClose();
  };

  return (
    <FormDialog open onClose={onClose} width={720} title={editing ? 'Sửa Quy Ước Tuổi Giao & Hao Lai' : 'Thêm Mới Quy Ước Tuổi Giao & Hao Lai'}
      footer={<>
        <Button variant="outlined" color="inherit" onClick={onClose}>Hủy Bỏ</Button>
        <Button variant="contained" disabled={!valid} onClick={save}>{editing ? 'Lưu Cập Nhật' : 'Tạo Quy Ước'}</Button>
      </>}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <Autocomplete size="small" fullWidth disabled={editing} options={options} value={acc} onChange={(_, a) => setAcc(a)}
            getOptionLabel={(a) => `${a.code} - ${a.customerName} - Sổ ${MATERIAL_LABEL[a.material]} (${a.fineness}%)`}
            renderInput={(p) => <TextField {...p} required helperText={customer ? `${customer.code} - ${customer.company} · ${MATERIAL_LABEL[material]}` : undefined} label="Số Đối Chiếu Công Nợ" InputLabelProps={{ shrink: true }} placeholder={editing ? code : 'Chọn từ danh mục số đối chiếu công nợ của khách hàng'} />} />
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField size="small" fullWidth required type="date" label="Ngày Bắt Đầu Hiệu Lực" value={from} onChange={(e) => setFrom(e.target.value)} InputLabelProps={{ shrink: true }} error={!!errs.date} helperText={errs.date ?? 'Kích hoạt tự động đóng bản ghi cũ'} />
          <TextField size="small" fullWidth type="date" label="Ngày Kết Thúc (Tùy chọn)" value={to} onChange={(e) => setTo(e.target.value)} InputLabelProps={{ shrink: true }} helperText="Để trống = Hiệu lực vô cực" />
        </Stack>
        <Box sx={{ p: 1.5, bgcolor: colors.pageBg, borderRadius: '8px' }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle1">Thông Số Tuổi & Hao Lai</Typography>
            <Typography variant="caption" sx={{ color: loss !== null && loss < 0 ? 'error.main' : 'success.main', fontWeight: 600 }}>
              {loss === null ? 'Hao lai = Tuổi giao - Tuổi kho' : `Hao lai = Tuổi giao (${g}%) - Tuổi kho (${k}%) = ${loss > 0 ? '+' : ''}${loss.toFixed(2)}%`}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField size="small" fullWidth required label="Tuổi Kho Thực Tế (F_stock)" value={kho} onChange={(e) => setKho(e.target.value)} error={!!errs.production} helperText={errs.production} InputProps={{ endAdornment: <span>%</span> }} InputLabelProps={{ shrink: true }} />
            <TextField size="small" fullWidth required label="Tuổi Giao Ghi Nợ (F_delivery)" value={giao} onChange={(e) => setGiao(e.target.value)} error={!!errs.delivery} helperText={errs.delivery ?? 'Tuổi thỏa thuận ghi nợ khách hàng'} InputProps={{ endAdornment: <span>%</span> }} InputLabelProps={{ shrink: true }} />
          </Stack>
        </Box>
        {level !== 'NONE' && (
          <Alert severity="warning">Hao lai ngược. Cần phê duyệt: {level === 'KTT' ? 'Kế toán trưởng' : 'Ban Giám Đốc (BOD / CFO)'}.</Alert>
        )}
        <TextField fullWidth multiline minRows={2} label="Lý Do Điều Chỉnh / Căn Cứ Hợp Đồng" value={reason} onChange={(e) => setReason(e.target.value)} InputLabelProps={{ shrink: true }}
          required={level !== 'NONE'} error={!!errs.reason} helperText={errs.reason ?? (level !== 'NONE' ? 'Bắt buộc, tối thiểu 20 ký tự' : undefined)} placeholder="Nhập căn cứ hợp đồng hoặc lý do thay đổi quy ước..." />
        {err && <Alert severity="error">{err}</Alert>}
      </Stack>
    </FormDialog>
  );
}
