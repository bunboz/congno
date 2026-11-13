import { useMemo, useState } from 'react';
import {
  Alert, Box, Button, IconButton, InputAdornment, MenuItem, OutlinedInput, Select, Snackbar, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import Breadcrumb from '../../components/Breadcrumb';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import StatusBadge, { StatusDot } from '../../components/StatusBadge';
import StatusTabs from '../../components/StatusTabs';
import { useStore } from '../../state/store';
import type { Rule } from '../../lib/rules';
import { MATERIAL_LABEL } from '../../lib/types';
import { dmy } from '../../lib/format';
import RuleDialog from './RuleDialog';

const mi = (n: string) => <span className="material-icons" style={{ fontSize: 18 }}>{n}</span>;

// Hao lai dương/bằng 0 là bình thường (chữ thường); chỉ hao lai ngược mới thành ô đỏ.
function Loss({ v }: { v: number }) {
  if (v < 0) return <StatusBadge tone="red">{v.toFixed(2)}%</StatusBadge>;
  return <Typography component="span" sx={{ fontWeight: v > 0 ? 600 : 400, color: v > 0 ? '#b45309' : '#9ca3af' }}>{v > 0 ? '+' : ''}{v.toFixed(2)}%</Typography>;
}

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
      <PageHeader title="Quy Ước Tuổi Giao & Hao Lai" description="Hao lai = Tuổi giao − Tuổi kho. Quy ước mới tự chốt quy ước cũ vào ngày liền trước."
        action={<Button variant="contained" startIcon={mi('add')} onClick={() => setDlg({ rule: null })}>Thêm Quy Ước Mới</Button>} />
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
        </Stack>

        <TableContainer sx={{ maxHeight: 'calc(100vh - 340px)' }}>
          <Table stickyHeader>
            <TableHead><TableRow>
              <TableCell>Mã Đối Chiếu</TableCell><TableCell>Khách Hàng</TableCell><TableCell>Loại NL</TableCell>
              <TableCell align="right">Tuổi Kho</TableCell><TableCell align="right">Tuổi Giao</TableCell><TableCell align="right">Hao Lai</TableCell>
              <TableCell sx={{ pl: 4 }}>Hiệu Lực</TableCell><TableCell>Trạng Thái</TableCell><TableCell align="right" sx={{ width: 100 }}>Thao Tác</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {shown.map(({ r, c }) => (
                <TableRow hover key={r.id}>
                  <TableCell><b style={{ color: '#07554b' }}>{r.debtAccountCode}</b></TableCell>
                  <TableCell sx={{ maxWidth: 320 }}>
                    <b>{c?.name ?? r.customerCode}</b>
                    <Typography variant="caption" component="div" noWrap color="text.secondary" sx={{ fontWeight: 400 }}>{r.customerCode} — {c?.company}</Typography>
                  </TableCell>
                  <TableCell><StatusDot tone={r.material === 'GOLD' ? 'yellow' : 'gray'}>{MATERIAL_LABEL[r.material]}</StatusDot></TableCell>
                  <TableCell align="right">{r.productionFineness.toFixed(2)}%</TableCell>
                  <TableCell align="right">{r.deliveryFineness.toFixed(2)}%</TableCell>
                  <TableCell align="right"><Loss v={r.lossRate} /></TableCell>
                  <TableCell sx={{ pl: 4 }}>{dmy(r.effectiveFrom)}{r.effectiveTo ? ` → ${dmy(r.effectiveTo)}` : ' → nay'}</TableCell>
                  <TableCell>{expired(r) ? <StatusBadge tone="gray">Hết hiệu lực</StatusBadge> : <StatusDot tone="green">Hiệu lực</StatusDot>}</TableCell>
                  <TableCell align="right"><Stack direction="row" justifyContent="flex-end">
                    <IconButton size="small" title="Sửa" aria-label="Sửa" onClick={() => setDlg({ rule: r })}>{mi('edit')}</IconButton>
                    <IconButton size="small" title="Xóa" aria-label="Xóa" onClick={() => { if (window.confirm(`Xóa quy ước ${r.debtAccountCode} (tuổi kho ${r.productionFineness}%)?`)) { deleteRule(r.id); setToast('Đã xóa quy ước'); } }}>{mi('delete')}</IconButton>
                  </Stack></TableCell>
                </TableRow>
              ))}
              {shown.length === 0 && <TableRow><TableCell colSpan={9} sx={{ border: 0 }}><EmptyState title="Không có quy ước phù hợp" hint="Thử đổi từ khóa hoặc chọn tab khác." /></TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {dlg && <RuleDialog key={dlg.rule?.id ?? 'new'} rule={dlg.rule} onClose={() => setDlg(null)} onSaved={(r) => setToast(`Đã lưu quy ước ${r.debtAccountCode}`)} />}
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setToast(null)}>{toast}</Alert>
      </Snackbar>
    </Box>
  );
}
