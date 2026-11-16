import { useMemo, useState } from 'react';
import {
  Alert, Box, Button, IconButton, InputAdornment, MenuItem, OutlinedInput, Select, Snackbar, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import Breadcrumb from '../../components/Breadcrumb';
import Card from '../../components/Card';
import ConfirmDialog from '../../components/ConfirmDialog';
import StatusBadge from '../../components/StatusBadge';
import StatusTabs from '../../components/StatusTabs';
import { useStore } from '../../state/store';
import type { Rule } from '../../lib/rules';
import { MATERIAL_LABEL } from '../../lib/types';
import { dmy } from '../../lib/format';
import RuleDialog from './RuleDialog';

const mi = (n: string) => <span className="material-icons" style={{ fontSize: 18 }}>{n}</span>;

function Loss({ v }: { v: number }) {
  return <StatusBadge tone={v > 0 ? 'yellow' : v < 0 ? 'red' : 'gray'}>{v > 0 ? '+' : ''}{v.toFixed(2)}%</StatusBadge>;
}

export default function Rules() {
  const { rules, customers, today, deleteRule } = useStore();
  const [q, setQ] = useState('');
  const [mat, setMat] = useState<'ALL' | 'GOLD' | 'SILVER'>('ALL');
  const [st, setSt] = useState<'ALL' | 'ON' | 'OFF'>('ALL');
  const [dlg, setDlg] = useState<{ rule: Rule | null } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const del = rules.find((r) => r.id === delId) ?? null;

  const expired = (r: Rule) => r.effectiveTo !== null && r.effectiveTo < today;
  const rows = useMemo(() => rules.map((r) => ({ r, c: customers.find((x) => x.code === r.customerCode) })), [rules, customers]);
  const shown = rows.filter(({ r, c }) =>
    (mat === 'ALL' || r.material === mat) && (st === 'ALL' || (st === 'ON') === !expired(r)) &&
    (!q.trim() || `${r.debtAccountCode} ${c?.name ?? ''} ${c?.company ?? ''} ${r.customerCode}`.toLowerCase().includes(q.trim().toLowerCase())));
  const active = rules.filter((r) => !expired(r)).length;

  return (
    <Box>
      <Breadcrumb items={[{ label: 'Quản lý công nợ', to: '/debt-accounts' }, { label: 'Cấu hình & Chính sách' }, { label: 'Quy Ước Tuổi Giao & Hao Lai' }]} />
      <Card>
        <StatusTabs value={st} onChange={(v) => setSt(v as typeof st)} tabs={[
          { value: 'ALL', label: 'Tất cả', count: rules.length },
          { value: 'ON', label: 'Hiệu lực', count: active },
          { value: 'OFF', label: 'Hết hiệu lực', count: rules.length - active },
        ]} />
        <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
          <OutlinedInput placeholder="Tìm mã, tên khách hàng..." value={q} onChange={(e) => setQ(e.target.value)}
            startAdornment={<InputAdornment position="start">{mi('search')}</InputAdornment>} sx={{ width: 320 }} />
          <Select value={mat} onChange={(e) => setMat(e.target.value as typeof mat)} sx={{ minWidth: 160 }}>
            <MenuItem value="ALL">Tất cả loại NL</MenuItem><MenuItem value="GOLD">Vàng</MenuItem><MenuItem value="SILVER">Bạc</MenuItem>
          </Select>
          <Box sx={{ flex: 1 }} />
          <Button variant="contained" startIcon={mi('add')} onClick={() => setDlg({ rule: null })}>Thêm Quy Ước Mới</Button>
        </Stack>

        <TableContainer sx={{ maxHeight: 'calc(100vh - 340px)' }}>
          <Table stickyHeader>
            <TableHead><TableRow>
              <TableCell>Mã Đối Chiếu</TableCell><TableCell>Khách Hàng</TableCell><TableCell>Loại NL</TableCell>
              <TableCell align="right">Tuổi Kho</TableCell><TableCell align="right">Tuổi Giao</TableCell><TableCell align="right">Hao Lai</TableCell>
              <TableCell>Ngày Hiệu Lực</TableCell><TableCell>Trạng Thái</TableCell><TableCell align="right" sx={{ width: 100 }}>Thao Tác</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {shown.map(({ r, c }) => (
                <TableRow hover key={r.id}>
                  <TableCell><b style={{ color: '#07554b' }}>{r.debtAccountCode}</b></TableCell>
                  <TableCell sx={{ maxWidth: 320 }}>
                    <b>{c?.name ?? r.customerCode}</b>
                    <Typography variant="caption" component="div" noWrap color="text.secondary" sx={{ fontWeight: 400 }}>{r.customerCode} — {c?.company}</Typography>
                  </TableCell>
                  <TableCell>{MATERIAL_LABEL[r.material]}</TableCell>
                  <TableCell align="right">{r.productionFineness.toFixed(2)}%</TableCell>
                  <TableCell align="right">{r.deliveryFineness.toFixed(2)}%</TableCell>
                  <TableCell align="right"><Loss v={r.lossRate} /></TableCell>
                  <TableCell>{dmy(r.effectiveFrom)}{r.effectiveTo ? ` → ${dmy(r.effectiveTo)}` : ' → nay'}</TableCell>
                  <TableCell><StatusBadge tone={expired(r) ? 'gray' : 'green'}>{expired(r) ? 'Hết hiệu lực' : 'Hiệu lực'}</StatusBadge></TableCell>
                  <TableCell align="right"><Stack direction="row" justifyContent="flex-end">
                    <IconButton size="small" title="Sửa" aria-label="Sửa" onClick={() => setDlg({ rule: r })}>{mi('edit')}</IconButton>
                    <IconButton size="small" title="Xóa" aria-label="Xóa" onClick={() => setDelId(r.id)}>{mi('delete')}</IconButton>
                  </Stack></TableCell>
                </TableRow>
              ))}
              {shown.length === 0 && <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>Không có dữ liệu</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {dlg && <RuleDialog key={dlg.rule?.id ?? 'new'} rule={dlg.rule} onClose={() => setDlg(null)} onSaved={(r) => setToast(`Đã lưu quy ước ${r.debtAccountCode}`)} />}
      {del && <ConfirmDialog danger title={`Xóa quy ước ${del.debtAccountCode}?`} confirmLabel="Xóa vĩnh viễn" onClose={() => setDelId(null)}
        onConfirm={() => { deleteRule(del.id); setToast('Đã xóa quy ước'); setDelId(null); }}>
        Quy ước tuổi kho <b>{del.productionFineness.toFixed(2)}%</b> / tuổi giao <b>{del.deliveryFineness.toFixed(2)}%</b> của mã <b>{del.debtAccountCode}</b> sẽ bị xóa vĩnh viễn và không thể hoàn tác.
      </ConfirmDialog>}
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setToast(null)}>{toast}</Alert>
      </Snackbar>
    </Box>
  );
}
