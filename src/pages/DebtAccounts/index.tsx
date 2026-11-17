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
import { colors } from '../../tokens';

type StatusFilter = 'ALL' | 'ACTIVE' | 'UPGRADED' | 'LOCKED';
const mi = (name: string, size = 18) => <span className="material-icons" style={{ fontSize: size }}>{name}</span>;

function StatusCell({ a, onChange }: { a: DebtAccount; onChange: () => void }) {
  const off = a.status === 'CLOSED' ? 'Tạm khóa' : 'Ngưng hoạt động';
  return (
    <Select variant="standard" disableUnderline size="small" value={a.isActive ? 'on' : 'off'} onChange={(e) => { if ((e.target.value === 'on') !== a.isActive) onChange(); }}
      renderValue={(v) => <Stack direction="row" alignItems="center" gap={1}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: v === 'on' ? colors.success : colors.error }} /><span>{v === 'on' ? 'Đang hoạt động' : off}</span></Stack>}
      sx={{ fontSize: 14, width: 170 }}>
      <MenuItem value="on">Đang hoạt động</MenuItem>
      <MenuItem value="off">{off}</MenuItem>
    </Select>
  );
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
      <Card>
        <StatusTabs value={status} onChange={(v) => { setStatus(v as StatusFilter); setPage(1); }} tabs={[
          { value: 'ALL', label: 'Tất cả', count: accounts.length },
          { value: 'ACTIVE', label: 'Đang hoạt động', count: activeN },
          { value: 'UPGRADED', label: 'Đã nâng version', count: accounts.filter((a) => a.version > 1).length },
          { value: 'LOCKED', label: 'Tạm khóa / Ngưng', count: accounts.length - activeN },
        ]} />
        <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
          <OutlinedInput placeholder="Tìm mã, tên khách hàng..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }}
            startAdornment={<InputAdornment position="start">{mi('search')}</InputAdornment>} sx={{ width: 320 }} />
          <Select value={material} onChange={(e) => { setMaterial(e.target.value as Material | 'ALL'); setPage(1); }} sx={{ minWidth: 160 }}>
            <MenuItem value="ALL">Tất cả loại NL</MenuItem>
            <MenuItem value="GOLD">Vàng (GOLD)</MenuItem>
            <MenuItem value="SILVER">Bạc (SILVER)</MenuItem>
          </Select>
          <Box sx={{ flex: 1 }} />
          <Button variant="contained" startIcon={mi('add')} onClick={() => setAddOpen(true)}>Thêm Mã Đối Chiếu</Button>
        </Stack>

        <TableContainer sx={{ maxHeight: 'calc(100vh - 340px)' }}>
          <Table stickyHeader>
            <TableHead><TableRow>
              <TableCell>Mã Đối Chiếu</TableCell><TableCell>Khách Hàng</TableCell><TableCell>Loại NL</TableCell>
              <TableCell align="right">Tuổi Đối Chiếu</TableCell><TableCell align="right">Bút Toán Sổ Cái</TableCell>
              <TableCell>Trạng Thái</TableCell><TableCell align="right" sx={{ width: 100 }}>Thao Tác</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {shown.map((a) => (
                <TableRow hover key={a.id}>
                  <TableCell><Stack direction="row" alignItems="center" spacing={1}>
                    <b style={{ color: colors.primary }}>{a.code}</b>
                    <Box component="button" type="button" title="Lịch sử phiên bản" aria-label={`Lịch sử phiên bản, hiện tại v${a.version}`} onClick={() => setHistId(a.id)} sx={{ all: 'unset', cursor: 'pointer', display: 'inline-flex' }}><StatusBadge tone={a.version > 1 ? 'green' : 'gray'}>v{a.version}</StatusBadge></Box>
                  </Stack></TableCell>
                  <TableCell sx={{ maxWidth: 380 }}>
                    <Stack direction="row" alignItems="center" spacing={1}><b>{a.customerName}</b>{a.version > 1 && <Typography component="a" variant="caption" onClick={() => setHistId(a.id)} sx={{ color: 'success.main', cursor: 'pointer', fontWeight: 400, '&:hover': { textDecoration: 'underline' } }}>Phiên bản v{a.version} • {a.isActive ? 'Đang hoạt động' : 'Ngưng hoạt động'}</Typography>}</Stack>
                    <Typography variant="caption" component="div" noWrap color="text.secondary" sx={{ fontWeight: 400 }}>{a.customerCode} - {a.customerCompany}</Typography>
                  </TableCell>
                  <TableCell>{MATERIAL_LABEL[a.material]}</TableCell>
                  <TableCell align="right"><b>{a.fineness.toFixed(2)}%</b></TableCell>
                  <TableCell align="right" sx={{ color: a.journalEntryCount > 0 ? 'text.primary' : colors.muted }}>{a.journalEntryCount > 0 ? `${a.journalEntryCount} bút toán` : '0 bút toán'}</TableCell>
                  <TableCell><StatusCell a={a} onChange={() => { toggleAccount(a.id); setToast(a.isActive ? `Đã tạm khóa mã ${a.code}` : `Đã kích hoạt mã ${a.code}`); }} /></TableCell>
                  <TableCell align="right"><Stack direction="row" justifyContent="flex-end">
                    <IconButton size="small" title="Đổi tuổi đối chiếu" aria-label="Đổi tuổi đối chiếu" onClick={() => setChangeId(a.id)}>{mi('edit')}</IconButton>
                    <IconButton size="small" title="Xóa mã" aria-label="Xóa mã" onClick={() => setDelId(a.id)}>{mi('delete')}</IconButton>
                  </Stack></TableCell>
                </TableRow>
              ))}
              {shown.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>Không có dữ liệu</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePager page={page} pageSize={pageSize} total={filtered.length} onPage={setPage} onPageSize={setPageSize} />
      </Card>

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
