import { useMemo, useState } from 'react';
import {
  Alert, Box, Button, IconButton, InputAdornment, MenuItem, OutlinedInput, Select, Snackbar, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import Breadcrumb from '../../components/Breadcrumb';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import StatusTabs from '../../components/StatusTabs';
import TablePager from '../../components/TablePager';
import { useStore } from '../../state/store';
import { MATERIAL_LABEL, type DebtAccount, type Material } from '../../lib/types';
import AddAccountDrawer from './AddAccountDrawer';
import ChangeFinenessDialog from './ChangeFinenessDialog';
import VersionHistoryDialog from './VersionHistoryDialog';
import DeleteBlockedDialog from './DeleteBlockedDialog';

type StatusFilter = 'ALL' | 'ACTIVE' | 'UPGRADED' | 'LOCKED';
const mi = (name: string) => <span className="material-icons" style={{ fontSize: 18 }}>{name}</span>;

function StatusCell({ a }: { a: DebtAccount }) {
  if (a.isActive) return <StatusBadge tone="green">Hoạt động</StatusBadge>;
  return a.status === 'CLOSED' ? <StatusBadge tone="gray">Tạm khóa</StatusBadge> : <StatusBadge tone="gray">Ngưng hoạt động</StatusBadge>;
}

export default function DebtAccounts() {
  const { accounts, today, toggleAccount, deleteAccount, upgrade } = useStore();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [material, setMaterial] = useState<Material | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [addOpen, setAddOpen] = useState(false);
  const [histId, setHistId] = useState<string | null>(null);
  const [changeId, setChangeId] = useState<string | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const byId = (id: string | null) => accounts.find((a) => a.id === id) ?? null;
  const hist = byId(histId), change = byId(changeId), del = byId(delId);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    return accounts.filter((a) =>
      (material === 'ALL' || a.material === material) &&
      (status === 'ALL' || (status === 'ACTIVE' ? a.isActive : status === 'UPGRADED' ? a.version > 1 : !a.isActive)) &&
      (!k || [a.code, a.customerCode, a.customerName, a.customerCompany, a.note].some((s) => s.toLowerCase().includes(k))));
  }, [accounts, q, status, material]);

  const shown = pageSize === 0 ? filtered : filtered.slice((page - 1) * pageSize, page * pageSize);
  const activeN = accounts.filter((a) => a.isActive).length;

  return (
    <Box>
      <Breadcrumb items={[{ label: 'Quản lý công nợ', to: '/debt-accounts' }, { label: 'Danh mục sổ đối chiếu' }]} />
      <Card><StatusTabs value={status} onChange={(v) => { setStatus(v as StatusFilter); setPage(1); }} tabs={[
        { value: 'ALL', label: 'Tất cả', count: accounts.length },
        { value: 'ACTIVE', label: 'Đang hoạt động', count: activeN },
        { value: 'UPGRADED', label: 'Đã nâng version', count: accounts.filter((a) => a.version > 1).length },
        { value: 'LOCKED', label: 'Tạm khóa / Ngưng', count: accounts.length - activeN },
      ]} />
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <OutlinedInput size="small" placeholder="Tìm mã, tên khách hàng..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }}
          startAdornment={<InputAdornment position="start">{mi('search')}</InputAdornment>} sx={{ width: 300, borderRadius: '10px', height: 32 }} />
        <Select size="small" value={material} onChange={(e) => { setMaterial(e.target.value as Material | 'ALL'); setPage(1); }} sx={{ height: 32, minWidth: 150 }}>
          <MenuItem value="ALL">Tất cả loại NL</MenuItem>
          <MenuItem value="GOLD">Vàng (GOLD)</MenuItem>
          <MenuItem value="SILVER">Bạc (SILVER)</MenuItem>
        </Select>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" startIcon={mi('add')} onClick={() => setAddOpen(true)}>Thêm Mã Đối Chiếu</Button>
      </Stack>

      <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
        <Table stickyHeader size="small">
          <TableHead><TableRow>
            {['Mã Đối Chiếu', 'Khách Hàng', 'Loại NL', 'Tuổi Đối Chiếu', 'Bút Toán Sổ Cái', 'Trạng Thái', 'Thao Tác'].map((h) => <TableCell key={h} sx={h === 'Thao Tác' ? { width: 160 } : undefined}>{h}</TableCell>)}
          </TableRow></TableHead>
          <TableBody>
            {shown.map((a) => (
              <TableRow hover key={a.id} sx={{ height: 54 }}>
                <TableCell><Stack direction="row" alignItems="center" spacing={1}>
                  <b style={{ color: '#07554b' }}>{a.code}</b>
                  <StatusBadge tone={a.version > 1 ? 'green' : 'gray'}>v{a.version}</StatusBadge>
                </Stack></TableCell>
                <TableCell sx={{ maxWidth: 380 }}>
                  <b>{a.customerName}</b>
                  <Typography variant="caption" component="div" noWrap color="text.secondary" sx={{ fontWeight: 400 }}>{a.customerCode} — {a.customerCompany}</Typography>
                </TableCell>
                <TableCell><StatusBadge tone={a.material === 'GOLD' ? 'yellow' : 'gray'}>{MATERIAL_LABEL[a.material]}</StatusBadge></TableCell>
                <TableCell>{a.fineness.toFixed(2)}%</TableCell>
                <TableCell sx={{ color: a.journalEntryCount > 0 ? 'text.primary' : 'text.secondary' }}>{a.journalEntryCount} bút toán</TableCell>
                <TableCell><StatusCell a={a} /></TableCell>
                <TableCell><Stack direction="row" alignItems="center">
                  <IconButton size="small" title="Lịch sử phiên bản" aria-label="Lịch sử phiên bản" onClick={() => setHistId(a.id)}>{mi('history')}</IconButton>
                  <IconButton size="small" title="Đổi tuổi đối chiếu" aria-label="Đổi tuổi đối chiếu" onClick={() => setChangeId(a.id)}>{mi('edit')}</IconButton>
                  <IconButton size="small" title={a.isActive ? 'Tạm khóa' : 'Kích hoạt'} aria-label={a.isActive ? 'Tạm khóa' : 'Kích hoạt'} onClick={() => toggleAccount(a.id)}
                    sx={{ color: a.isActive ? 'primary.main' : '#9ca3af' }}><span className="material-icons" style={{ fontSize: 26 }}>{a.isActive ? 'toggle_on' : 'toggle_off'}</span></IconButton>
                  <IconButton size="small" title="Xóa mã" aria-label="Xóa mã" onClick={() => setDelId(a.id)}>{mi('delete')}</IconButton>
                </Stack></TableCell>
              </TableRow>
            ))}
            {shown.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>Không có sổ đối chiếu phù hợp</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePager page={page} pageSize={pageSize} total={filtered.length} onPage={setPage} onPageSize={setPageSize} /></Card>

      <AddAccountDrawer open={addOpen} onClose={() => setAddOpen(false)} onCreated={(a) => setToast(`Đã tạo mã đối chiếu ${a.code}`)} />
      {hist && <VersionHistoryDialog key={hist.id + hist.version} account={hist} open onClose={() => setHistId(null)} onChangeFineness={() => { setHistId(null); setChangeId(hist.id); }} />}
      {change && <ChangeFinenessDialog key={change.id + change.version} account={change} today={today} open onClose={() => setChangeId(null)}
        onConfirm={(next, from, reason) => { upgrade(change.id, next, from, reason); setToast(`Đã nâng mã ${change.code} lên v${change.version + 1}`); }} />}
      {del && <DeleteBlockedDialog account={del} open onClose={() => setDelId(null)}
        onSuspend={() => { if (del.isActive) toggleAccount(del.id); setDelId(null); setToast(`Đã chuyển mã ${del.code} sang trạng thái không hoạt động`); }}
        onDelete={() => { deleteAccount(del.id); setDelId(null); setToast(`Đã xóa mã ${del.code}`); }} />}
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setToast(null)}>{toast}</Alert>
      </Snackbar>
    </Box>
  );
}
