import { useState } from 'react';
import { Alert, Autocomplete, Box, Button, MenuItem, Stack, Typography } from '@mui/material';
import Field from '../../components/Field';
import FormDialog from '../../components/FormDialog';
import { useStore } from '../../state/store';
import { canCreateAccount, defaultCode } from '../../lib/account';
import { parseNum, validateFineness } from '../../lib/fineness';
import { CURRENT_USER } from '../../data/mock';
import type { Customer, DebtAccount, Material } from '../../lib/types';

const card = { mb: 3 } as const;
const Head = ({ children }: { children: string }) => (
  <Typography variant="subtitle1" sx={{ color: 'primary.main', mb: 1.5 }}>{children}</Typography>
);

export default function AddAccountDrawer({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (a: DebtAccount) => void }) {
  const { accounts, customers, today, createAccount } = useStore();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [material, setMaterial] = useState<Material>('GOLD');
  const [fineness, setFineness] = useState('61');
  const [code, setCode] = useState('');
  const [codeTouched, setCodeTouched] = useState(false);
  const [note, setNote] = useState('');

  const pick = (c: Customer | null, m: Material) => {
    setCustomer(c); setMaterial(m);
    if (c && !codeTouched) setCode(defaultCode(c.code, m));
  };
  const finErr = validateFineness(fineness, 'đối chiếu');
  const blockErr = customer ? canCreateAccount(accounts, customer.code, material, code.trim()) : null;
  const canSave = !!customer && !finErr && !blockErr && code.trim() !== '' && note.length <= 500;

  const reset = () => { setCustomer(null); setMaterial('GOLD'); setFineness('61'); setCode(''); setCodeTouched(false); setNote(''); };
  const close = () => { reset(); onClose(); };
  const save = () => {
    if (!canSave || !customer) return;
    const a: DebtAccount = {
      id: code.trim(), code: code.trim(), customerCode: customer.code, customerName: customer.name, customerCompany: customer.company,
      channel: customer.channel, material, uom: 'LUONG', fineness: parseNum(fineness), version: 1, status: 'ACTIVE', isActive: true,
      journalEntryCount: 0, note, versionNote: note || 'Khởi tạo', effectiveFrom: today, history: [],
      balance: { goldDelivered: 0, goldPending: 0, labor: 0 }, modifiedBy: CURRENT_USER, modifiedAt: new Date().toISOString(),
    };
    createAccount(a); onCreated(a); reset(); onClose();
  };

  return (
    <FormDialog open={open} onClose={close} onEnter={save} width={600} title="Thêm Mã Đối Chiếu" subtitle="Khởi tạo tài khoản công nợ đối tác khách hàng"
      footer={<>
        <Button variant="contained" color="inherit" onClick={close}>Hủy bỏ</Button>
        <Button variant="contained" disabled={!canSave} onClick={save}>Lưu & Áp Dụng</Button>
      </>}>
      <Box sx={card}>
        <Head>Đối tượng CRM & nguyên liệu</Head>
        <Autocomplete size="small" options={customers} value={customer} onChange={(_, c) => pick(c, material)}
          getOptionLabel={(c) => `${c.code} - ${c.name} (${c.company}) • [${c.channel}]`}
          renderInput={(p) => <Field {...p} autoFocus required label="Khách hàng CRM" placeholder="Tìm mã hoặc tên khách hàng" InputLabelProps={{ shrink: true }} />} />
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Field select size="small" fullWidth required label="Loại nguyên liệu" value={material} InputLabelProps={{ shrink: true }}
            onChange={(e) => pick(customer, e.target.value as Material)}>
            <MenuItem value="GOLD">Vàng (GOLD)</MenuItem>
            <MenuItem value="SILVER">Bạc (SILVER)</MenuItem>
            <MenuItem value="PLATINUM">Bạch Kim (PLATINUM)</MenuItem>
          </Field>
          <Field size="small" fullWidth required label="Tuổi đối chiếu thỏa thuận" value={fineness} InputLabelProps={{ shrink: true }}
            onChange={(e) => setFineness(e.target.value)} error={!!finErr}
            helperText={finErr ?? 'Hợp lệ: lớn hơn 0% và tối đa 100.00%'} InputProps={{ endAdornment: <span>%</span> }} />
        </Stack>
      </Box>
      <Box sx={card}>
        <Head>Định danh mã đối chiếu</Head>
        <Field size="small" fullWidth required label="Mã đối chiếu công nợ" value={code} InputLabelProps={{ shrink: true }}
          onChange={(e) => { setCode(e.target.value); setCodeTouched(true); }}
          helperText="Mặc định là Mã khách hàng (VD: 100006), có thể chỉnh sửa nếu cần" />
        <Field size="small" fullWidth multiline minRows={2} label="Ghi chú nghiệp vụ" value={note} sx={{ mt: 2 }} InputLabelProps={{ shrink: true }}
          placeholder="Ghi chú về thỏa thuận công nợ, chính sách giao dịch, lý do tạo mã..." onChange={(e) => setNote(e.target.value.slice(0, 500))}
          helperText="Tối đa 500 ký tự (tùy chọn)" />
      </Box>
      {blockErr && <Alert severity="error">{blockErr}</Alert>}
    </FormDialog>
  );
}
