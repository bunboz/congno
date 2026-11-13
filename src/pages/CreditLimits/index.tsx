import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, IconButton, InputAdornment, OutlinedInput, Snackbar, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import Breadcrumb from '../../components/Breadcrumb';
import StatusBadge, { type Tone } from '../../components/StatusBadge';
import StatusTabs from '../../components/StatusTabs';
import TablePager from '../../components/TablePager';
import { useStore } from '../../state/store';
import { creditStatus, type CreditStatus } from '../../lib/credit';
import { num } from '../../lib/format';
import type { LimitRow } from '../../lib/types';
import LimitDrawer from './LimitDrawer';

const STATUS: Record<CreditStatus, [string, Tone]> = {
  SAFE: ['An Toàn', 'green'], WARNING: ['Cảnh Báo', 'yellow'], OVER_GOLD: ['Vượt HM Vàng', 'red'],
  OVER_SILVER: ['Vượt HM Bạc', 'purple'], OVER_LABOR: ['Vượt HM Công', 'orange'],
};
const mi = (n: string) => <span className="material-icons" style={{ fontSize: 18 }}>{n}</span>;

// Một ô hạn mức: hạn mức ở trên, dư nợ (và % đã dùng) ở dưới; đỏ khi vượt.
function LimitCell({ debt, limit, digits, unit }: { debt: number; limit: number | null; digits: number; unit: string }) {
  const unlimited = !limit;
  const over = !unlimited && debt > limit;
  return (
    <Box sx={{ textAlign: 'right' }}>
      <b>{unlimited ? 'Không giới hạn' : `${num(limit, digits)} ${unit}`}</b>
      <Typography variant="caption" component="div" sx={{ fontWeight: 400, color: over ? 'error.main' : 'text.secondary' }}>
        Nợ: {num(debt, digits)} {unit}{unlimited ? '' : ` (${Math.round((debt / limit) * 100)}%)`}
      </Typography>
    </Box>
  );
}

export default function CreditLimits() {
  const nav = useNavigate();
  const { limits, customers, today } = useStore();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<CreditStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [drawer, setDrawer] = useState<{ row: LimitRow | null } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const rows = useMemo(() => limits.map((r) => {
    const c = customers.find((x) => x.code === r.customerCode);
    const st = creditStatus({ limits: { gold: r.goldLimit, silver: r.silverLimit, labor: r.laborLimit }, debt: r.debt, nextDueDate: r.nextDueDate, today });
    return { r, name: c?.company ?? r.customerCode, st };
  }), [limits, customers, today]);

  const filtered = rows.filter((x) => (filter === 'ALL' || x.st === filter) && (!q.trim() || `${x.r.customerCode} ${x.name}`.toLowerCase().includes(q.trim().toLowerCase())));
  const shown = pageSize === 0 ? filtered : filtered.slice((page - 1) * pageSize, page * pageSize);
  const ledger = (code: string) => nav(`/customer-ledger/${code}`);

  return (
    <Box>
      <Breadcrumb items={[{ label: 'Quản lý công nợ', to: '/debt-accounts' }, { label: 'Hạn Mức Tín Dụng & Kỳ Hạn Nợ' }]} />
      <StatusTabs value={filter} onChange={(v) => { setFilter(v as CreditStatus | 'ALL'); setPage(1); }} tabs={[
        { value: 'ALL', label: 'Tất cả', count: rows.length },
        ...(Object.keys(STATUS) as CreditStatus[]).map((k) => ({ value: k, label: STATUS[k][0], count: rows.filter((x) => x.st === k).length })),
      ]} />
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <OutlinedInput size="small" placeholder="Tìm mã hoặc tên khách hàng..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }}
          startAdornment={<InputAdornment position="start">{mi('search')}</InputAdornment>} sx={{ width: 300, borderRadius: '10px', height: 32 }} />
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" startIcon={mi('add')} onClick={() => setDrawer({ row: null })}>Tạo Mới Hạn Mức</Button>
      </Stack>

      <TableContainer sx={{ maxHeight: 'calc(100vh - 230px)' }}>
        <Table stickyHeader size="small">
          <TableHead><TableRow>
            <TableCell>Khách Hàng</TableCell>
            <TableCell align="right">Hạn Mức Vàng</TableCell><TableCell align="right">Hạn Mức Bạc</TableCell><TableCell align="right">Hạn Mức Tiền Công</TableCell>
            <TableCell>Kỳ Hạn Nợ</TableCell><TableCell>Trạng Thái Nợ</TableCell><TableCell>Thao Tác</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {shown.map(({ r, name, st }) => (
              <TableRow hover key={r.customerCode} sx={{ height: 60 }}>
                <TableCell sx={{ maxWidth: 340 }}>
                  <Typography component="a" onClick={() => ledger(r.customerCode)} sx={{ fontWeight: 600, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>{r.customerCode}</Typography>
                  <Typography variant="caption" component="div" noWrap color="text.secondary" sx={{ fontWeight: 400 }}>{name}</Typography>
                </TableCell>
                <TableCell><LimitCell debt={r.debt.gold} limit={r.goldLimit} digits={4} unit="Lượng" /></TableCell>
                <TableCell><LimitCell debt={r.debt.silver} limit={r.silverLimit} digits={4} unit="Lượng" /></TableCell>
                <TableCell><LimitCell debt={r.debt.labor} limit={r.laborLimit} digits={0} unit="đ" /></TableCell>
                <TableCell>{r.termDays === 0 ? 'Thanh toán ngay' : `Net ${r.termDays} ngày`}</TableCell>
                <TableCell><StatusBadge tone={STATUS[st][1]}>{STATUS[st][0]}</StatusBadge></TableCell>
                <TableCell><Stack direction="row">
                  <IconButton size="small" title="Chỉnh sửa" aria-label="Chỉnh sửa" onClick={() => setDrawer({ row: r })}>{mi('edit')}</IconButton>
                  <IconButton size="small" title="Xem chi tiết" aria-label="Xem chi tiết" onClick={() => ledger(r.customerCode)}>{mi('description')}</IconButton>
                </Stack></TableCell>
              </TableRow>
            ))}
            {shown.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>Không có khách hàng phù hợp</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePager page={page} pageSize={pageSize} total={filtered.length} onPage={setPage} onPageSize={setPageSize} />

      {drawer && <LimitDrawer key={drawer.row?.customerCode ?? 'new'} open row={drawer.row} onClose={() => setDrawer(null)} onSaved={(c) => setToast(`Đã lưu cấu hình hạn mức cho ${c.code}`)} />}
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setToast(null)}>{toast}</Alert>
      </Snackbar>
    </Box>
  );
}
