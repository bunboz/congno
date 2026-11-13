import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Chip, IconButton, InputAdornment, Menu, MenuItem, OutlinedInput, Select, Snackbar, Stack, Switch,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import KpiCard from '../../components/KpiCard';
import StatusBadge from '../../components/StatusBadge';
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
  if (a.isActive) return <StatusBadge tone="green">● Hoạt động{a.version > 1 ? ` (v${a.version})` : ''}</StatusBadge>;
  return a.status === 'CLOSED' ? <StatusBadge tone="gray">Tạm khóa</StatusBadge> : <StatusBadge tone="gray">🔒 Ngưng hoạt động</StatusBadge>;
}

export default function DebtAccounts() {
  const nav = useNavigate();
  const { accounts, today, toggleAccount, deleteAccount, upgrade } = useStore();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [material, setMaterial] = useState<Material | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [addOpen, setAddOpen] = useState(false);
  const [histId, setHistId] = useState<string | null>(null);
  const [changeId, setChangeId] = useState<string | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ el: HTMLElement; id: string } | null>(null);
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
  const count = (m: Material) => accounts.filter((a) => a.material === m).length;
  const activeN = accounts.filter((a) => a.isActive).length;
  const reset = () => { setQ(''); setStatus('ALL'); setMaterial('ALL'); setPage(1); };

  return (
    <Box>
      <Typography variant="caption" color="text.secondary">Quản lý công nợ / <b>Danh mục sổ đối chiếu</b></Typography>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Quản Lý Mã Đối Chiếu & Sổ Công Nợ</Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" color="inherit" onClick={() => nav('/credit-limits')}>Cấu Hình Hạn Mức</Button>
          <Button size="small" variant="outlined" color="inherit" onClick={() => nav('/rules-settings')}>Quy Ước Đối Chiếu</Button>
          <Button size="small" variant="outlined" color="inherit" onClick={reset}>Làm mới</Button>
          <Button size="small" variant="contained" onClick={() => setAddOpen(true)}>+ Thêm Mã Đối Chiếu</Button>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <KpiCard label="Tổng mã đối chiếu" value={accounts.length} hint="Toàn bộ sổ công nợ CRM" />
        <KpiCard label="Sổ Vàng (GOLD)" value={count('GOLD')} hint="ĐVT Lượng • Nguyên liệu Vàng" color="#ca8a03" />
        <KpiCard label="Sổ Bạc (SILVER)" value={count('SILVER')} hint="ĐVT Lượng • Nguyên liệu Bạc" color="#1570ef" />
        <KpiCard label="Đang hoạt động" value={`${activeN} / ${accounts.length}`} hint={`Tỷ lệ khả dụng: ${accounts.length ? Math.round((activeN / accounts.length) * 100) : 0}%`} />
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
        <OutlinedInput size="small" placeholder="Tìm mã số, tên số, mã khách hàng, ghi chú..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }}
          startAdornment={<InputAdornment position="start">{mi('search')}</InputAdornment>} sx={{ width: 310, borderRadius: '10px', height: 32 }} />
        <Select size="small" value={status} onChange={(e) => { setStatus(e.target.value as StatusFilter); setPage(1); }} sx={{ height: 32, minWidth: 220 }}>
          <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
          <MenuItem value="ACTIVE">Đang hoạt động (Active)</MenuItem>
          <MenuItem value="UPGRADED">Version cũ (Đã nâng version)</MenuItem>
          <MenuItem value="LOCKED">Tạm khóa / Ngưng HĐ</MenuItem>
        </Select>
        <Typography variant="caption" sx={{ flex: 1, textAlign: 'right' }} color="text.secondary">Hiển thị {filtered.length} / {accounts.length} sổ đối chiếu</Typography>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary">LOẠI NGUYÊN LIỆU:</Typography>
        {([['ALL', 'TẤT CẢ', accounts.length], ['GOLD', 'VÀNG (GOLD)', count('GOLD')], ['SILVER', 'BẠC (SILVER)', count('SILVER')]] as const).map(([v, l, n]) => (
          <Chip key={v} size="small" clickable color={material === v ? 'primary' : 'default'} label={`${l}  ${n}`} onClick={() => { setMaterial(v); setPage(1); }} sx={{ borderRadius: '6px' }} />
        ))}
        <Typography variant="caption" sx={{ flex: 1, textAlign: 'right', color: 'primary.main' }}>
          Quy tắc: 1 Khách hàng - 1 Loại nguyên liệu chỉ có duy nhất 1 mã đối chiếu (Đổi tuổi ➔ Nâng Version)
        </Typography>
      </Stack>

      <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '6px', maxHeight: 'calc(100vh - 420px)' }}>
        <Table stickyHeader size="small">
          <TableHead><TableRow>
            {['STT', 'MÃ ĐỐI CHIẾU', 'TÊN KHÁCH HÀNG', 'MÃ — TÊN CÔNG TY', 'KÊNH PHÂN PHỐI', 'LOẠI NL', 'ĐVT', 'TUỔI ĐỐI CHIẾU', 'BÚT TOÁN SỔ CÁI', 'TRẠNG THÁI', 'THAO TÁC'].map((h) => <TableCell key={h}>{h}</TableCell>)}
          </TableRow></TableHead>
          <TableBody>
            {shown.map((a, i) => (
              <TableRow hover key={a.id} sx={{ height: 54 }}>
                <TableCell>{(pageSize === 0 ? 0 : (page - 1) * pageSize) + i + 1}</TableCell>
                <TableCell><Stack direction="row" alignItems="center" spacing={0.5}>
                  <b>{a.code}</b>
                  <IconButton size="small" aria-label="Sao chép mã" onClick={() => navigator.clipboard?.writeText(a.code)}>{mi('content_copy')}</IconButton>
                  <StatusBadge tone={a.version > 1 ? 'green' : 'gray'}>v{a.version}</StatusBadge>
                </Stack></TableCell>
                <TableCell>
                  <b>{a.customerName}</b>
                  {a.version > 1 && <Typography variant="caption" component="div" onClick={() => setHistId(a.id)} sx={{ color: 'success.main', cursor: 'pointer', fontWeight: 400 }}>
                    Phiên bản v{a.version} • {a.isActive ? 'Đang hoạt động' : 'Ngưng'}</Typography>}
                </TableCell>
                <TableCell sx={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><b>{a.customerCode}</b> — {a.customerCompany}</TableCell>
                <TableCell><StatusBadge tone="blue">{a.channel}</StatusBadge></TableCell>
                <TableCell><StatusBadge tone={a.material === 'GOLD' ? 'yellow' : 'gray'}>{MATERIAL_LABEL[a.material]}</StatusBadge></TableCell>
                <TableCell>{a.uom === 'LUONG' ? 'Lượng' : 'Gram'}</TableCell>
                <TableCell><b>{a.fineness.toFixed(2)}%</b></TableCell>
                <TableCell>{a.journalEntryCount > 0 ? <StatusBadge tone="blue">{a.journalEntryCount} bút toán</StatusBadge> : <Typography variant="caption" color="text.secondary">0 bút toán</Typography>}</TableCell>
                <TableCell><StatusCell a={a} /></TableCell>
                <TableCell><Stack direction="row" alignItems="center">
                  <IconButton size="small" title="Lịch sử phiên bản" onClick={() => setHistId(a.id)}>{mi('history')}</IconButton>
                  <IconButton size="small" title="Đổi tuổi đối chiếu" onClick={() => setChangeId(a.id)}>{mi('edit')}</IconButton>
                  <Switch size="small" checked={a.isActive} onChange={() => toggleAccount(a.id)} inputProps={{ 'aria-label': 'Hoạt động / Tạm khóa' }} />
                  <IconButton size="small" aria-label="Thêm thao tác" onClick={(e) => setMenu({ el: e.currentTarget, id: a.id })}>{mi('more_horiz')}</IconButton>
                </Stack></TableCell>
              </TableRow>
            ))}
            {shown.length === 0 && <TableRow><TableCell colSpan={11} align="center" sx={{ py: 4, color: 'text.secondary' }}>Không có sổ đối chiếu phù hợp</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePager page={page} pageSize={pageSize} total={filtered.length} onPage={setPage} onPageSize={setPageSize} />

      <Menu anchorEl={menu?.el} open={!!menu} onClose={() => setMenu(null)}>
        <MenuItem sx={{ color: 'error.main' }} onClick={() => { setDelId(menu!.id); setMenu(null); }}>{mi('delete')}&nbsp;Xóa mã</MenuItem>
      </Menu>

      <AddAccountDrawer open={addOpen} onClose={() => setAddOpen(false)} onCreated={(a) => setToast(`Đã tạo mã đối chiếu ${a.code}`)} />
      {hist && <VersionHistoryDialog key={hist.id + hist.version} account={hist} open onClose={() => setHistId(null)} onChangeFineness={() => { setHistId(null); setChangeId(hist.id); }} />}
      {change && <ChangeFinenessDialog key={change.id + change.version} account={change} today={today} open onClose={() => setChangeId(null)}
        onHistory={() => { setChangeId(null); setHistId(change.id); }}
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
