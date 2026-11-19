import { useEffect, useMemo, useState } from 'react';
import { ClearFilterButton, FilterHead, useColumnFilters } from '../../components/ColumnFilter';
import {
  Alert, Avatar, Box, Button, IconButton, InputAdornment, MenuItem, OutlinedInput, Select, Snackbar, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import Breadcrumb from '../../components/Breadcrumb';
import Card from '../../components/Card';
import StatusTabs from '../../components/StatusTabs';
import StatusBadge from '../../components/StatusBadge';
import TablePager from '../../components/TablePager';
import { useStore } from '../../state/store';
import { dmyHm, person } from '../../lib/format';
import { MATERIAL_LABEL, type DebtAccount, type Material } from '../../lib/types';
import ConfirmDialog from '../../components/ConfirmDialog';
import AddAccountDrawer from './AddAccountDrawer';
import ChangeFinenessDialog from './ChangeFinenessDialog';
import VersionHistoryDialog from './VersionHistoryDialog';
import DeleteBlockedDialog from './DeleteBlockedDialog';
import { stickyEndCell, stickyEndHead } from '../../components/stickyEnd';
import { colors } from '../../tokens';

type StatusFilter = 'ALL' | 'ACTIVE' | 'CLOSED' | 'SUPERSEDED';
const mi = (name: string, size = 18) => <span className="material-icons" style={{ fontSize: size }}>{name}</span>;

// 3 trạng thái BA: Hoạt động / Tạm khóa / Ngưng hoạt động (đã bị thay thế, không bật lại). Khóa / Kích hoạt luôn hỏi xác nhận.
const VSTATUS: Record<DebtAccount['status'], [string, 'green' | 'gray']> = { ACTIVE: ['Hoạt động', 'green'], CLOSED: ['Tạm khóa', 'gray'], SUPERSEDED: ['Ngưng hoạt động', 'gray'] };

export default function DebtAccounts() {
  const { accounts, today, toggleAccount, deleteAccount, upgrade } = useStore();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [addOpen, setAddOpen] = useState(false);
  const [histId, setHistId] = useState<string | null>(null);
  const [changeId, setChangeId] = useState<string | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [togId, setTogId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const byId = (id: string | null) => accounts.find((a) => a.id === id) ?? null;
  const hist = byId(histId), change = byId(changeId), del = byId(delId), tog = byId(togId);

  const base = useMemo(() => {
    const k = q.trim().toLowerCase();
    return accounts.filter((a) =>
      (status === 'ALL' || (status === 'ACTIVE' ? a.isActive : status === 'CLOSED' ? !a.isActive && a.status === 'CLOSED' : !a.isActive && a.status !== 'CLOSED')) &&
      (!k || [a.code, a.customerCode, a.customerName, a.customerCompany, a.note].some((s) => s.toLowerCase().includes(k))));
  }, [accounts, q, status]);
  const cf = useColumnFilters(base, (a) => ({ code: a.code, customer: `${a.customerCode} - ${a.customerName}`, channel: a.channel, material: MATERIAL_LABEL[a.material], uom: a.uom === 'LUONG' ? 'Lượng' : 'Gram', fineness: `${a.fineness.toFixed(2)}%`, status: VSTATUS[a.status][0], entries: `${a.journalEntryCount} bút toán`, note: a.note, by: person(a.modifiedBy), at: dmyHm(a.modifiedAt) }));
  const filtered = cf.view;
  useEffect(() => setPage(1), [cf.view]);

  const shown = pageSize === 0 ? filtered : filtered.slice((page - 1) * pageSize, page * pageSize);
  const activeN = accounts.filter((a) => a.isActive).length;

  return (
    <Box>
      <Breadcrumb items={[{ label: 'Quản lý công nợ', to: '/debt-accounts' }, { label: 'Danh mục sổ đối chiếu' }]} />
      <Card>
        <StatusTabs value={status} onChange={(v) => { setStatus(v as StatusFilter); setPage(1); }} tabs={[
          { value: 'ALL', label: 'Tất cả', count: accounts.length },
          { value: 'ACTIVE', label: 'Hoạt động', count: accounts.filter((a) => a.isActive).length },
          { value: 'CLOSED', label: 'Tạm khóa', count: accounts.filter((a) => !a.isActive && a.status === 'CLOSED').length },
          { value: 'SUPERSEDED', label: 'Ngưng hoạt động', count: accounts.filter((a) => !a.isActive && a.status !== 'CLOSED').length },
        ]} />
        <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
          <OutlinedInput placeholder="Tìm mã, tên khách hàng..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }}
            startAdornment={<InputAdornment position="start">{mi('search')}</InputAdornment>} sx={{ width: 320 }} />
          <Box sx={{ flex: 1 }} />
          <ClearFilterButton active={cf.active} onClick={cf.clear} />
          <Button variant="contained" startIcon={mi('add')} onClick={() => setAddOpen(true)}>Thêm Mã Đối Chiếu</Button>
        </Stack>

        <TableContainer sx={{ flex: '0 1 auto', minHeight: 0 }}>
          <Table stickyHeader>
            <TableHead><TableRow>
              <FilterHead ctl={cf} k="code" label="Mã Đối Chiếu" /><FilterHead ctl={cf} k="customer" label="Khách Hàng" /><FilterHead ctl={cf} k="status" label="Trạng Thái" /><FilterHead ctl={cf} k="channel" label="Kênh Phân Phối" /><FilterHead ctl={cf} k="material" label="Loại Nguyên Liệu" /><FilterHead ctl={cf} k="uom" label="Đơn Vị Tính (ĐVT)" />
              <FilterHead ctl={cf} k="fineness" label="Tuổi Đối Chiếu Thỏa Thuận" align="right" /><FilterHead ctl={cf} k="entries" label="Số Bút Toán Sổ Cái" align="right" /><FilterHead ctl={cf} k="note" label="Ghi Chú Nghiệp Vụ" /><FilterHead ctl={cf} k="by" label="Người Cập Nhật Cuối" /><FilterHead ctl={cf} k="at" date label="Thời Điểm Cập Nhật Cuối" /><TableCell align="right" sx={{ width: 130, ...stickyEndHead }}>Thao Tác</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {shown.map((a) => (
                <TableRow hover key={a.id}>
                  <TableCell>
                    <Tooltip title="Xem lịch sử phiên bản"><Box component="button" type="button" aria-label={`Lịch sử phiên bản ${a.code}, hiện tại v${a.version}`} onClick={() => setHistId(a.id)}
                      sx={{ all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 1, '&:hover b': { textDecoration: 'underline' }, '&:focus-visible': { outline: `2px solid ${colors.primary}`, outlineOffset: 2, borderRadius: '4px' } }}>
                      <b style={{ color: colors.primary }}>{a.code}</b>
                      <StatusBadge tone={a.version > 1 ? 'green' : 'gray'}>v{a.version}</StatusBadge>
                    </Box></Tooltip>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 520 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar sx={{ width: 26, height: 26, bgcolor: colors.primary }}>{' '}</Avatar>
                      <Box sx={{ minWidth: 0 }}><Typography noWrap sx={{ fontSize: 14 }}>{a.customerCode} - {a.customerName}</Typography>
                        <Typography variant="caption" component="div" noWrap color="text.secondary" sx={{ fontWeight: 400 }}>{a.customerCompany}</Typography></Box>
                    </Stack>
                  </TableCell>
                  <TableCell><StatusBadge tone={VSTATUS[a.status][1]}>{VSTATUS[a.status][0]}</StatusBadge></TableCell>
                  <TableCell>{a.channel}</TableCell>
                  <TableCell>{MATERIAL_LABEL[a.material]}</TableCell>
                  <TableCell>{a.uom === 'LUONG' ? 'Lượng' : 'Gram'}</TableCell>
                  <TableCell align="right"><b>{a.fineness.toFixed(2)}%</b></TableCell>
                  <TableCell align="right" sx={{ color: a.journalEntryCount > 0 ? 'text.primary' : colors.muted }}>{a.journalEntryCount > 0 ? `${a.journalEntryCount} bút toán` : '0 bút toán'}</TableCell>
                  <TableCell sx={{ maxWidth: 220 }}><Typography noWrap title={a.note} sx={{ fontSize: 14 }}>{a.note || '--'}</Typography></TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}><Stack direction="row" alignItems="center" spacing={1}><Avatar sx={{ width: 26, height: 26, bgcolor: colors.primary }}>{' '}</Avatar><span>{person(a.modifiedBy)}</span></Stack></TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{dmyHm(a.modifiedAt)}</TableCell>
                  <TableCell align="right" sx={stickyEndCell}><Stack direction="row" justifyContent="flex-end">
                    {a.status !== 'SUPERSEDED' && <Tooltip title={a.isActive ? 'Tạm khóa' : 'Kích hoạt'}><IconButton size="small" aria-label={a.isActive ? 'Tạm khóa' : 'Kích hoạt'} onClick={() => setTogId(a.id)}>{mi(a.isActive ? 'lock' : 'lock_open')}</IconButton></Tooltip>}
                    <Tooltip title="Đổi tuổi đối chiếu"><IconButton size="small" aria-label="Đổi tuổi đối chiếu" onClick={() => setChangeId(a.id)}>{mi('balance')}</IconButton></Tooltip>
                    <Tooltip title="Xóa mã"><IconButton size="small" aria-label="Xóa mã" onClick={() => setDelId(a.id)}>{mi('delete')}</IconButton></Tooltip>
                  </Stack></TableCell>
                </TableRow>
              ))}
              {shown.length === 0 && <TableRow><TableCell colSpan={12} align="center" sx={{ py: 4, color: 'text.secondary' }}>Không có dữ liệu</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePager page={page} pageSize={pageSize} total={filtered.length} onPage={setPage} onPageSize={setPageSize} />
      </Card>

      <AddAccountDrawer open={addOpen} onClose={() => setAddOpen(false)} onCreated={(a) => setToast('Thành công')} />
      {hist && <VersionHistoryDialog key={hist.id + hist.version} account={hist} open onClose={() => setHistId(null)} onChangeFineness={() => { setHistId(null); setChangeId(hist.id); }} />}
      {change && <ChangeFinenessDialog key={change.id + change.version} account={change} today={today} open onClose={() => setChangeId(null)}
        onConfirm={(next, from, reason) => { upgrade(change.id, next, from, reason); setToast('Thành công'); }} />}
      {del && <DeleteBlockedDialog account={del} open onClose={() => setDelId(null)}
        onSuspend={() => { if (del.isActive) toggleAccount(del.id); setDelId(null); setToast('Thành công'); }}
        onDelete={() => { deleteAccount(del.id); setDelId(null); setToast('Thành công'); }} />}
      {tog && <ConfirmDialog danger={tog.isActive} title={tog.isActive ? `Tạm khóa mã ${tog.code}?` : `Kích hoạt mã ${tog.code}?`} confirmLabel={tog.isActive ? 'Tạm khóa' : 'Kích hoạt'} onClose={() => setTogId(null)}
        onConfirm={() => { toggleAccount(tog.id); setToast('Thành công'); setTogId(null); }}>
        {tog.isActive ? 'Kho không thể lập phiếu xuất/nhập vào mã này cho đến khi được kích hoạt lại.' : 'Các mã khác của cùng khách hàng và loại nguyên liệu sẽ chuyển sang Ngưng hoạt động.'}
      </ConfirmDialog>}
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setToast(null)}>{toast}</Alert>
      </Snackbar>
    </Box>
  );
}
