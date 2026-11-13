import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, InputAdornment, LinearProgress, MenuItem, OutlinedInput, Select, Snackbar, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import KpiCard from '../../components/KpiCard';
import StatusBadge, { type Tone } from '../../components/StatusBadge';
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

function Cell({ debt, limit, digits, unit, color }: { debt: number; limit: number | null; digits: number; unit: string; color: string }) {
  const unlimited = !limit;
  const p = unlimited ? 0 : (debt / limit) * 100;
  return (
    <Box sx={{ minWidth: 150, textAlign: 'right' }}>
      <Typography variant="body2" sx={{ color, fontWeight: 600 }}>{unlimited ? 'Không giới hạn' : `${num(limit, digits)} ${unit}`}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 400 }}>Nợ: {num(debt, digits)} {unit}{unlimited ? '' : ` (${Math.round(p)}%)`}</Typography>
      {!unlimited && <LinearProgress variant="determinate" value={Math.min(100, p)} color={p > 100 ? 'error' : 'primary'} sx={{ height: 4, borderRadius: 2, mt: 0.5 }} />}
    </Box>
  );
}

export default function CreditLimits() {
  const nav = useNavigate();
  const { limits, customers, today } = useStore();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<CreditStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [drawer, setDrawer] = useState<{ row: LimitRow | null } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const rows = useMemo(() => limits.map((r) => {
    const c = customers.find((x) => x.code === r.customerCode);
    const st = creditStatus({ limits: { gold: r.goldLimit, silver: r.silverLimit, labor: r.laborLimit }, debt: r.debt, nextDueDate: r.nextDueDate, today });
    return { r, name: c?.company ?? r.customerCode, st };
  }), [limits, customers, today]);

  const filtered = rows.filter((x) => (filter === 'ALL' || x.st === filter) && (!q.trim() || `${x.r.customerCode} ${x.name}`.toLowerCase().includes(q.trim().toLowerCase())));
  const shown = pageSize === 0 ? filtered : filtered.slice((page - 1) * pageSize, page * pageSize);
  const n = (f: (s: CreditStatus) => boolean) => rows.filter((x) => f(x.st)).length;

  return (
    <Box>
      <Typography variant="caption" color="text.secondary">Quản lý công nợ / <b>Hạn Mức Tín Dụng & Kỳ Hạn Nợ</b></Typography>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Quản Lý Hạn Mức Tín Dụng 3 Trục & Thời Hạn Thanh Toán</Typography>
        <Button size="small" variant="contained" onClick={() => setDrawer({ row: null })}>+ Tạo Mới Hạn Mức</Button>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <KpiCard label="Tổng khách đã cấp hạn mức" value={`${rows.length} Đối tác`} hint="Kiểm soát 3 trục Vàng, Bạc, Tiền trên Ví KD" />
        <KpiCard label="An Toàn" value={`${n((s) => s === 'SAFE')} Khách`} hint="Trong hạn mức, chưa đến hạn thanh toán" />
        <KpiCard label="Cảnh Báo" value={`${n((s) => s === 'WARNING')} Khách`} hint="Có chứng từ đến hạn trong 3 ngày tới" color="#ca8a03" />
        <KpiCard label="Vượt hạn mức" value={`${n((s) => s.startsWith('OVER'))} Khách`} hint="Vượt hạn mức Vàng, Bạc hoặc Tiền công" color="#bb0000" />
      </Stack>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
        <OutlinedInput size="small" placeholder="Tìm theo mã khách, tên tiệm vàng..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }}
          startAdornment={<InputAdornment position="start"><span className="material-icons" style={{ fontSize: 18 }}>search</span></InputAdornment>} sx={{ width: 310, borderRadius: '10px', height: 32 }} />
        <Typography variant="caption">Trạng thái:</Typography>
        <Select size="small" value={filter} onChange={(e) => { setFilter(e.target.value as CreditStatus | 'ALL'); setPage(1); }} sx={{ height: 32, minWidth: 180 }}>
          <MenuItem value="ALL">Tất cả ({rows.length})</MenuItem>
          {(Object.keys(STATUS) as CreditStatus[]).map((k) => <MenuItem key={k} value={k}>{STATUS[k][0]}</MenuItem>)}
        </Select>
        <Typography variant="caption" sx={{ flex: 1, textAlign: 'right' }} color="text.secondary">Hiển thị: {filtered.length} / {rows.length} khách hàng</Typography>
      </Stack>

      <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '6px', maxHeight: 'calc(100vh - 380px)' }}>
        <Table stickyHeader size="small">
          <TableHead><TableRow>
            <TableCell>MÃ KHÁCH</TableCell><TableCell>TÊN KHÁCH HÀNG / TIỆM VÀNG</TableCell>
            <TableCell align="right">HẠN MỨC VÀNG (LƯỢNG)</TableCell><TableCell align="right">HẠN MỨC BẠC (LƯỢNG)</TableCell><TableCell align="right">HẠN MỨC TIỀN (VNĐ)</TableCell>
            <TableCell>KỲ HẠN NỢ</TableCell><TableCell>TRẠNG THÁI NỢ</TableCell><TableCell>THAO TÁC</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {shown.map(({ r, name, st }) => (
              <TableRow hover key={r.customerCode} sx={{ height: 60 }}>
                <TableCell><Typography component="a" onClick={() => nav(`/customer-ledger/${r.customerCode}`)} sx={{ fontWeight: 600, cursor: 'pointer' }}>{r.customerCode}</Typography></TableCell>
                <TableCell><Typography component="a" variant="body2" onClick={() => nav(`/customer-ledger/${r.customerCode}`)} sx={{ color: 'primary.main', cursor: 'pointer' }}>{name}</Typography></TableCell>
                <TableCell><Cell debt={r.debt.gold} limit={r.goldLimit} digits={4} unit="Lượng" color="#9a3412" /></TableCell>
                <TableCell><Cell debt={r.debt.silver} limit={r.silverLimit} digits={4} unit="Lượng" color="#4b5563" /></TableCell>
                <TableCell><Cell debt={r.debt.labor} limit={r.laborLimit} digits={0} unit="đ" color="#0c0c0c" /></TableCell>
                <TableCell>{r.termDays === 0 ? 'Thanh toán ngay' : `Net ${r.termDays} ngày`}</TableCell>
                <TableCell><StatusBadge tone={STATUS[st][1]}>{STATUS[st][0]}</StatusBadge></TableCell>
                <TableCell><Stack direction="row" spacing={1}>
                  <Button size="small" variant="outlined" color="inherit" onClick={() => setDrawer({ row: r })}>Chỉnh Sửa</Button>
                  <Button size="small" variant="outlined" color="inherit" onClick={() => nav(`/customer-ledger/${r.customerCode}`)}>Xem Chi Tiết</Button>
                </Stack></TableCell>
              </TableRow>
            ))}
            {shown.length === 0 && <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>Không có khách hàng phù hợp</TableCell></TableRow>}
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
