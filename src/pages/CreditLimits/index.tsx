import { useEffect, useMemo, useState } from 'react';
import { ClearFilterButton, FilterHead, useColumnFilters } from '../../components/ColumnFilter';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Avatar, Box, Button, IconButton, InputAdornment, OutlinedInput, Snackbar, Stack, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import Breadcrumb from '../../components/Breadcrumb';
import Card from '../../components/Card';
import StatusBadge, { type Tone } from '../../components/StatusBadge';
import StatusTabs from '../../components/StatusTabs';
import TablePager from '../../components/TablePager';
import { useStore } from '../../state/store';
import { creditStatus, type CreditStatus } from '../../lib/credit';
import { dmy, num } from '../../lib/format';
import type { LimitRow } from '../../lib/types';
import LimitDrawer from './LimitDrawer';
import { colors } from '../../tokens';

const STATUS: Record<CreditStatus, [string, Tone]> = {
  SAFE: ['An Toàn', 'green'], WARNING: ['Cảnh Báo', 'yellow'], OVER_GOLD: ['Vượt HM Vàng', 'red'],
  OVER_SILVER: ['Vượt HM Bạc', 'purple'], OVER_LABOR: ['Vượt HM Công', 'orange'],
};
// Khách cần xử lý (vượt hạn mức, sắp đến hạn) luôn nằm trên cùng.
const RANK: Record<CreditStatus, number> = { OVER_GOLD: 0, OVER_SILVER: 0, OVER_LABOR: 0, WARNING: 1, SAFE: 2 };
// Lý do cụ thể đứng sau mỗi badge ngoại lệ, để người dùng không phải tự suy ra.
function reasonOf(r: LimitRow, st: CreditStatus, today: string): string | null {
  if (st === 'OVER_GOLD') return `Nợ vượt ${num(r.debt.gold - (r.goldLimit ?? 0), 4)} Lượng`;
  if (st === 'OVER_SILVER') return `Nợ vượt ${num(r.debt.silver - (r.silverLimit ?? 0), 4)} Lượng`;
  if (st === 'OVER_LABOR') return `Nợ vượt ${num(r.debt.labor - (r.laborLimit ?? 0))} đ`;
  if (st === 'WARNING' && r.nextDueDate) {
    const d = Math.round((Date.parse(r.nextDueDate) - Date.parse(today)) / 86400000);
    return d < 0 ? `Quá hạn ${-d} ngày (${dmy(r.nextDueDate)})` : `Đến hạn ${dmy(r.nextDueDate)} (còn ${d} ngày)`;
  }
  return null;
}
const mi = (n: string) => <span className="material-icons" style={{ fontSize: 18 }}>{n}</span>;

// Hạn mức ở trên, dư nợ ở dưới: xám khi ổn, cam khi dùng từ 80%, đỏ khi vượt.
function LimitCell({ debt, limit, digits, unit }: { debt: number; limit: number | null; digits: number; unit: string }) {
  const unlimited = !limit;
  const ratio = unlimited ? 0 : debt / limit;
  const color = ratio > 1 ? 'error.main' : ratio >= 0.8 ? colors.amber : 'text.secondary';
  return (
    <Box sx={{ textAlign: 'right' }}>
      <b>{unlimited ? 'Không giới hạn' : `${num(limit, digits)} ${unit}`}</b>
      <Typography variant="caption" component="div" sx={{ fontWeight: ratio >= 0.8 ? 600 : 400, color }}>
        {debt === 0 ? 'Nợ: 0' : `Nợ: ${num(debt, digits)} ${unit}${unlimited ? '' : ` (${Math.round(ratio * 100)}%)`}`}
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
    return { r, name: c?.company ?? r.customerCode, short: c?.name ?? r.customerCode, st, why: reasonOf(r, st, today) };
  }).sort((a, b) => RANK[a.st] - RANK[b.st]), [limits, customers, today]);

  const cf = useColumnFilters();
  useEffect(() => setPage(1), [cf.f]);
  const lim = (v: number | null, d: number) => (v ? num(v, d) : 'Không giới hạn');
  const filtered = rows.filter((x) => cf.match({ customer: `${x.r.customerCode} ${x.short} ${x.name}`, gold: lim(x.r.goldLimit, 4), silver: lim(x.r.silverLimit, 4), labor: lim(x.r.laborLimit, 0), term: x.r.termDays === 0 ? 'Thanh toán ngay' : `${x.r.termDays} ngày`, status: STATUS[x.st][0] }) && (filter === 'ALL' || x.st === filter) && (!q.trim() || `${x.r.customerCode} ${x.name}`.toLowerCase().includes(q.trim().toLowerCase())));
  const shown = pageSize === 0 ? filtered : filtered.slice((page - 1) * pageSize, page * pageSize);
  const ledger = (code: string) => nav(`/customer-ledger/${code}`);

  return (
    <Box>
      <Breadcrumb items={[{ label: 'Quản lý công nợ', to: '/debt-accounts' }, { label: 'Hạn Mức Tín Dụng & Kỳ Hạn Nợ' }]} />
      <Card>
        <StatusTabs value={filter} onChange={(v) => { setFilter(v as CreditStatus | 'ALL'); setPage(1); }} tabs={[
          { value: 'ALL', label: 'Tất cả', count: rows.length },
          ...(Object.keys(STATUS) as CreditStatus[]).map((k) => ({ value: k, label: STATUS[k][0], count: rows.filter((x) => x.st === k).length })),
        ]} />
        <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
          <OutlinedInput placeholder="Tìm mã hoặc tên khách hàng..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }}
            startAdornment={<InputAdornment position="start">{mi('search')}</InputAdornment>} sx={{ width: 320 }} />
          <Box sx={{ flex: 1 }} />
          <ClearFilterButton active={cf.active} onClick={cf.clear} />
          <Button variant="contained" startIcon={mi('add')} onClick={() => setDrawer({ row: null })}>Tạo Mới Hạn Mức</Button>
        </Stack>

        <TableContainer sx={{ maxHeight: 'calc(100vh - 340px)' }}>
          <Table stickyHeader>
            <TableHead><TableRow>
              <FilterHead ctl={cf} k="customer" label="Khách Hàng" />
              <FilterHead ctl={cf} k="gold" label="Hạn Mức Nợ Vàng Tối Đa (Lượng)" align="right" /><FilterHead ctl={cf} k="silver" label="Hạn Mức Nợ Bạc Tối Đa (Lượng)" align="right" /><FilterHead ctl={cf} k="labor" label="Hạn Mức Nợ Tiền Công Tối Đa (VNĐ)" align="right" />
              <FilterHead ctl={cf} k="term" label="Kỳ Hạn Nợ" sx={{ pl: 4 }} /><FilterHead ctl={cf} k="status" label="Trạng Thái Tín Dụng" /><TableCell align="right" sx={{ width: 100 }}>Thao Tác</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {shown.map(({ r, name, short, st, why }) => (
                <TableRow hover key={r.customerCode}>
                  <TableCell sx={{ maxWidth: 380 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar sx={{ width: 26, height: 26, bgcolor: colors.primary }}>{' '}</Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography component="a" onClick={() => ledger(r.customerCode)} sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>{r.customerCode} - {short}</Typography>
                        <Typography variant="caption" component="div" noWrap color="text.secondary" sx={{ fontWeight: 400 }}>{name}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell><LimitCell debt={r.debt.gold} limit={r.goldLimit} digits={4} unit="Lượng" /></TableCell>
                  <TableCell><LimitCell debt={r.debt.silver} limit={r.silverLimit} digits={4} unit="Lượng" /></TableCell>
                  <TableCell><LimitCell debt={r.debt.labor} limit={r.laborLimit} digits={0} unit="đ" /></TableCell>
                  <TableCell sx={{ pl: 4 }}>{r.termDays === 0 ? 'Thanh toán ngay' : `${r.termDays} ngày`}</TableCell>
                  <TableCell><Tooltip title={why ?? ''} arrow><span><StatusBadge tone={STATUS[st][1]}>{STATUS[st][0]}</StatusBadge></span></Tooltip></TableCell>
                  <TableCell align="right"><Stack direction="row" justifyContent="flex-end">
                    <IconButton size="small" title="Chỉnh sửa" aria-label="Chỉnh sửa" onClick={() => setDrawer({ row: r })}>{mi('edit')}</IconButton>
                    <IconButton size="small" title="Xem chi tiết" aria-label="Xem chi tiết" onClick={() => ledger(r.customerCode)}>{mi('description')}</IconButton>
                  </Stack></TableCell>
                </TableRow>
              ))}
              {shown.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>Không có dữ liệu</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePager page={page} pageSize={pageSize} total={filtered.length} onPage={setPage} onPageSize={setPageSize} />
      </Card>

      {drawer && <LimitDrawer key={drawer.row?.customerCode ?? 'new'} open row={drawer.row} onClose={() => setDrawer(null)} onSaved={(c) => setToast(`Đã lưu cấu hình hạn mức cho ${c.code}`)} />}
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setToast(null)}>{toast}</Alert>
      </Snackbar>
    </Box>
  );
}
