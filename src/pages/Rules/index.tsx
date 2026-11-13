import { useMemo, useState } from 'react';
import {
  Alert, Box, Button, IconButton, InputAdornment, MenuItem, OutlinedInput, Select, Snackbar, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import Breadcrumb from '../../components/Breadcrumb';
import StatusBadge from '../../components/StatusBadge';
import StatusTabs from '../../components/StatusTabs';
import { useStore } from '../../state/store';
import type { Rule } from '../../lib/rules';
import { MATERIAL_LABEL } from '../../lib/types';
import { dmy } from '../../lib/format';
import RuleDialog from './RuleDialog';

const mi = (n: string) => <span className="material-icons" style={{ fontSize: 18 }}>{n}</span>;
const lossTone = (l: number) => (l > 0 ? 'yellow' : l < 0 ? 'red' : 'gray') as 'yellow' | 'red' | 'gray';

export default function Rules() {
  const { rules, customers, today, deleteRule } = useStore();
  const [q, setQ] = useState('');
  const [mat, setMat] = useState<'ALL' | 'GOLD' | 'SILVER'>('ALL');
  const [st, setSt] = useState<'ALL' | 'ON' | 'OFF'>('ALL');
  const [dlg, setDlg] = useState<{ rule: Rule | null } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const expired = (r: Rule) => r.effectiveTo !== null && r.effectiveTo < today;
  const rows = useMemo(() => rules.map((r) => ({ r, c: customers.find((x) => x.code === r.customerCode) })), [rules, customers]);
  const shown = rows.filter(({ r, c }) =>
    (mat === 'ALL' || r.material === mat) && (st === 'ALL' || (st === 'ON') === !expired(r)) &&
    (!q.trim() || `${r.debtAccountCode} ${c?.name ?? ''} ${c?.company ?? ''} ${r.customerCode}`.toLowerCase().includes(q.trim().toLowerCase())));
  const active = rules.filter((r) => !expired(r)).length;

  return (
    <Box>
      <Breadcrumb items={[{ label: 'Quản lý công nợ', to: '/debt-accounts' }, { label: 'Cấu hình & Chính sách' }, { label: 'Quy Ước Tuổi Giao & Hao Lai' }]} />
      <StatusTabs value={st} onChange={(v) => setSt(v as typeof st)} tabs={[
        { value: 'ALL', label: 'Tất cả', count: rules.length },
        { value: 'ON', label: 'Hiệu lực', count: active },
        { value: 'OFF', label: 'Hết hiệu lực', count: rules.length - active },
      ]} />
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <OutlinedInput size="small" placeholder="Tìm mã, tên khách hàng..." value={q} onChange={(e) => setQ(e.target.value)}
          startAdornment={<InputAdornment position="start">{mi('search')}</InputAdornment>} sx={{ width: 300, borderRadius: '10px', height: 32 }} />
        <Select size="small" value={mat} onChange={(e) => setMat(e.target.value as typeof mat)} sx={{ height: 32, minWidth: 150 }}>
          <MenuItem value="ALL">Tất cả loại NL</MenuItem><MenuItem value="GOLD">Vàng</MenuItem><MenuItem value="SILVER">Bạc</MenuItem>
        </Select>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" startIcon={mi('add')} onClick={() => setDlg({ rule: null })}>Thêm Quy Ước Mới</Button>
      </Stack>

      <TableContainer sx={{ maxHeight: 'calc(100vh - 230px)' }}>
        <Table stickyHeader size="small">
          <TableHead><TableRow>
            {['Mã Đối Chiếu', 'Khách Hàng', 'Loại NL', 'Tuổi Kho', 'Tuổi Giao', 'Hao Lai', 'Hiệu Lực', 'Trạng Thái', 'Thao Tác'].map((h) => <TableCell key={h}>{h}</TableCell>)}
          </TableRow></TableHead>
          <TableBody>
            {shown.map(({ r, c }) => (
              <TableRow hover key={r.id} sx={{ height: 54 }}>
                <TableCell><b>{r.debtAccountCode}</b></TableCell>
                <TableCell sx={{ maxWidth: 320 }}>
                  <b>{c?.name ?? r.customerCode}</b>
                  <Typography variant="caption" component="div" noWrap color="text.secondary" sx={{ fontWeight: 400 }}>{r.customerCode} — {c?.company}</Typography>
                </TableCell>
                <TableCell><StatusBadge tone={r.material === 'GOLD' ? 'yellow' : 'gray'}>{MATERIAL_LABEL[r.material]}</StatusBadge></TableCell>
                <TableCell>{r.productionFineness.toFixed(2)}%</TableCell>
                <TableCell>{r.deliveryFineness.toFixed(2)}%</TableCell>
                <TableCell><StatusBadge tone={lossTone(r.lossRate)}>{r.lossRate > 0 ? '+' : ''}{r.lossRate.toFixed(2)}%</StatusBadge></TableCell>
                <TableCell>{dmy(r.effectiveFrom)}{r.effectiveTo ? ` → ${dmy(r.effectiveTo)}` : ' → nay'}</TableCell>
                <TableCell><StatusBadge tone={expired(r) ? 'gray' : 'green'}>{expired(r) ? 'Hết hiệu lực' : 'Hiệu lực'}</StatusBadge></TableCell>
                <TableCell><Stack direction="row">
                  <IconButton size="small" title="Sửa" aria-label="Sửa" onClick={() => setDlg({ rule: r })}>{mi('edit')}</IconButton>
                  <IconButton size="small" title="Xóa" aria-label="Xóa" onClick={() => { if (window.confirm(`Xóa quy ước ${r.debtAccountCode} (tuổi kho ${r.productionFineness}%)?`)) { deleteRule(r.id); setToast('Đã xóa quy ước'); } }}>{mi('delete')}</IconButton>
                </Stack></TableCell>
              </TableRow>
            ))}
            {shown.length === 0 && <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>Không có quy ước phù hợp</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      {dlg && <RuleDialog key={dlg.rule?.id ?? 'new'} rule={dlg.rule} onClose={() => setDlg(null)} onSaved={(r) => setToast(`Đã lưu quy ước ${r.debtAccountCode}`)} />}
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setToast(null)}>{toast}</Alert>
      </Snackbar>
    </Box>
  );
}
