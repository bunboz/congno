import { useState } from 'react';
import { Alert, Autocomplete, Box, Button, MenuItem, Stack, Typography } from '@mui/material';
import Field from '../../components/Field';
import { customerPicker } from '../../components/customerPicker';
import FormDrawer from '../../components/FormDrawer';
import { useStore } from '../../state/store';
import { canCreateAccount, defaultCode } from '../../lib/account';
import { parseNum, validateFineness } from '../../lib/fineness';
import { CURRENT_USER } from '../../data/mock';
import type { Customer, DebtAccount, Material } from '../../lib/types';

const card = { mb: 3 } as const;

export default function AddAccountDrawer({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (a: DebtAccount) => void }) {
  const { accounts, customers, today, createAccount } = useStore();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [material, setMaterial] = useState<Material>('GOLD');
  const [fineness, setFineness] = useState('61');
  const [note, setNote] = useState('');

  const pick = (c: Customer | null, m: Material) => { setCustomer(c); setMaterial(m); };
  // BA US-01 AC-01: hệ thống tự điền mã đối chiếu (mã khách hàng, thêm hậu tố nếu là Bạc); người dùng không nhập.
  const code = customer ? defaultCode(customer.code, material) : '';
  const finErr = validateFineness(fineness, 'đối chiếu');
  const blockErr = customer ? canCreateAccount(accounts, customer.code, material, code.trim()) : null;
  const canSave = !!customer && !finErr && !blockErr && code.trim() !== '' && note.length <= 500;

  const reset = () => { setCustomer(null); setMaterial('GOLD'); setFineness('61'); setNote(''); };
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
    <FormDrawer open={open} onClose={close} onEnter={save} title="Thêm Mã Đối Chiếu"
      footer={<>
        <Button variant="contained" color="inherit" onClick={close}>Hủy bỏ</Button>
        <Button variant="contained" disabled={!canSave} onClick={save}>Lưu & Áp Dụng</Button>
      </>}>
      <Box sx={card}>
        <Autocomplete size="small" options={customers} value={customer} onChange={(_, c) => pick(c, material)} {...customerPicker}
          renderInput={(p) => <Field {...p} autoFocus required label="Khách hàng" InputLabelProps={{ shrink: true }} />} />
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Field select size="small" fullWidth required label="Loại nguyên liệu" value={material} InputLabelProps={{ shrink: true }}
            onChange={(e) => pick(customer, e.target.value as Material)}>
            <MenuItem value="GOLD">Vàng (GOLD)</MenuItem>
            <MenuItem value="SILVER">Bạc (SILVER)</MenuItem>
            <MenuItem value="PLATINUM">Bạch Kim (PLATINUM)</MenuItem>
          </Field>
          <Field size="small" fullWidth required label="Tuổi đối chiếu thỏa thuận" value={fineness} InputLabelProps={{ shrink: true }}
            onChange={(e) => setFineness(e.target.value)} error={!!finErr}
            helperText={finErr ?? undefined} InputProps={{ endAdornment: <span>%</span> }} />
        </Stack>
      </Box>
      <Box sx={card}>
        <Field size="small" fullWidth required label="Mã đối chiếu công nợ" value={code} disabled InputLabelProps={{ shrink: true }} />
        <Field size="small" fullWidth multiline minRows={2} label="Ghi chú nghiệp vụ" value={note} sx={{ mt: 2 }} InputLabelProps={{ shrink: true }} onChange={(e) => setNote(e.target.value.slice(0, 500))} />
      </Box>
      {blockErr && <Alert severity="error">{blockErr}</Alert>}
    </FormDrawer>
  );
}
