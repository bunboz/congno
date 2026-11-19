import { useMemo, useState } from 'react';
import { ClearFilterButton, FilterHead, useColumnFilters } from '../../components/ColumnFilter';
import {
  Alert, Avatar, Box, Button, IconButton, InputAdornment, MenuItem, OutlinedInput, Select, Snackbar, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import Breadcrumb from '../../components/Breadcrumb';
import Card from '../../components/Card';
import ConfirmDialog from '../../components/ConfirmDialog';
import StatusBadge from '../../components/StatusBadge';
import { useStore } from '../../state/store';
import type { Rule } from '../../lib/rules';
import { MATERIAL_LABEL } from '../../lib/types';
import { dmy } from '../../lib/format';
import RuleDialog from './RuleDialog';
import { stickyEndCell, stickyEndHead } from '../../components/stickyEnd';
import { colors } from '../../tokens';

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
  const base = rows.filter(({ r, c }) =>
    (mat === 'ALL' || r.material === mat) && (st === 'ALL' || (st === 'ON') === !expired(r)) &&
    (!q.trim() || `${r.debtAccountCode} ${c?.name ?? ''} ${c?.company ?? ''} ${r.customerCode}`.toLowerCase().includes(q.trim().toLowerCase())));
  const cf = useColumnFilters(base, ({ r, c }) => ({ code: r.debtAccountCode, customer: `${r.customerCode} - ${c?.name ?? ''}`, material: MATERIAL_LABEL[r.material], kho: `${r.productionFineness.toFixed(2)}%`, giao: `${r.deliveryFineness.toFixed(2)}%`, loss: `${r.lossRate > 0 ? '+' : ''}${r.lossRate.toFixed(2)}%`, date: `${dmy(r.effectiveFrom)} → ${r.effectiveTo ? dmy(r.effectiveTo) : 'Vô thời hạn'}`, status: expired(r) ? 'Hết hiệu lực' : 'Đang áp dụng' }));
  const shown = cf.view;
  const active = rules.filter((r) => !expired(r)).length;

  return (
    <Box>
      <Breadcrumb items={[{ label: 'Quản lý công nợ', to: '/debt-accounts' }, { label: 'Cấu hình & Chính sách' }, { label: 'Quy Ước Tuổi Giao & Hao Lai' }]} />
      <Card>
        <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
          <OutlinedInput placeholder="Tìm mã, tên khách hàng..." value={q} onChange={(e) => setQ(e.target.value)}
            startAdornment={<InputAdornment position="start">{mi('search')}</InputAdornment>} sx={{ width: 320 }} />
          <Select value={mat} onChange={(e) => setMat(e.target.value as typeof mat)} sx={{ minWidth: 160 }}>
            <MenuItem value="ALL">Tất cả loại nguyên liệu</MenuItem><MenuItem value="GOLD">Vàng</MenuItem><MenuItem value="SILVER">Bạc</MenuItem>
          </Select>
          <Box sx={{ flex: 1 }} />
          <ClearFilterButton active={cf.active} onClick={cf.clear} />
          <Button variant="contained" startIcon={mi('add')} onClick={() => setDlg({ rule: null })}>Thêm Quy Ước Tuổi & Hao Lai</Button>
        </Stack>

        <TableContainer sx={{ flex: '0 1 auto', minHeight: 0 }}>
          <Table stickyHeader>
            <TableHead><TableRow>
              <FilterHead ctl={cf} k="code" label="Mã Đối Chiếu" /><FilterHead ctl={cf} k="customer" label="Khách Hàng" /><FilterHead ctl={cf} k="material" label="Loại Nguyên Liệu" />
              <FilterHead ctl={cf} k="kho" label="Tuổi Kho Sản Xuất" align="right" /><FilterHead ctl={cf} k="giao" label="Tuổi Giao Tính Nợ" align="right" /><FilterHead ctl={cf} k="loss" label="Hao Lai (%)" align="right" />
              <FilterHead ctl={cf} k="date" date label="Ngày Hiệu Lực" /><FilterHead ctl={cf} k="status" label="Trạng Thái Hoạt Động" /><TableCell align="right" sx={{ width: 100, ...stickyEndHead }}>Thao Tác</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {shown.map(({ r, c }) => (
                <TableRow hover key={r.id}>
                  <TableCell><b style={{ color: colors.primary }}>{r.debtAccountCode}</b></TableCell>
                  <TableCell sx={{ maxWidth: 380 }}><Stack direction="row" alignItems="center" spacing={1}><Avatar sx={{ width: 26, height: 26, bgcolor: colors.primary }}>{' '}</Avatar><Box sx={{ minWidth: 0 }}><span>{r.customerCode} - {c?.name ?? r.customerCode}</span><Typography variant="caption" component="div" noWrap color="text.secondary" sx={{ fontWeight: 400 }}>{c?.company}</Typography></Box></Stack></TableCell>
                  <TableCell>{MATERIAL_LABEL[r.material]}</TableCell>
                  <TableCell align="right">{r.productionFineness.toFixed(2)}%</TableCell>
                  <TableCell align="right">{r.deliveryFineness.toFixed(2)}%</TableCell>
                  <TableCell align="right"><Loss v={r.lossRate} /></TableCell>
                  <TableCell>{dmy(r.effectiveFrom)}{r.effectiveTo ? ` → ${dmy(r.effectiveTo)}` : ' → Vô thời hạn'}</TableCell>
                  <TableCell><StatusBadge tone={expired(r) ? 'gray' : 'green'}>{expired(r) ? 'Hết hiệu lực' : 'Đang áp dụng'}</StatusBadge></TableCell>
                  <TableCell align="right" sx={stickyEndCell}><Stack direction="row" justifyContent="flex-end">
                    <IconButton size="small" title="Sửa" aria-label="Sửa" onClick={() => setDlg({ rule: r })}>{mi('edit')}</IconButton>
                    <IconButton size="small" title="Xóa" aria-label="Xóa" onClick={() => setDelId(r.id)}>{mi('delete')}</IconButton>
                  </Stack></TableCell>
                </TableRow>
              ))}
              {shown.length === 0 && <TableRow><TableCell colSpan={10} align="center" sx={{ py: 4, color: 'text.secondary' }}>Không có dữ liệu</TableCell></TableRow>}
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
