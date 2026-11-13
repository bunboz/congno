import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, IconButton, InputAdornment, MenuItem, OutlinedInput, Select, Snackbar, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import KpiCard from '../../components/KpiCard';
import StatusBadge from '../../components/StatusBadge';
import { useStore } from '../../state/store';
import type { Rule } from '../../lib/rules';
import { MATERIAL_LABEL } from '../../lib/types';
import RuleDialog from './RuleDialog';

const mi = (n: string) => <span className="material-icons" style={{ fontSize: 18 }}>{n}</span>;
const lossTone = (l: number) => (l > 0 ? 'yellow' : l < 0 ? 'red' : 'gray') as 'yellow' | 'red' | 'gray';

export default function Rules() {
  const nav = useNavigate();
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
      <Typography variant="caption" color="text.secondary">Quản lý công nợ / Cấu hình & Chính sách / <b>Bảng Quy Ước Tuổi Giao Hàng & Hao Lai</b></Typography>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Thiết Lập Quy Ước Tuổi Giao & Hao Lai</Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" color="inherit" onClick={() => nav('/debt-accounts')}>Quy Ước Đối Chiếu</Button>
          <Button size="small" variant="contained" onClick={() => setDlg({ rule: null })}>+ Thêm Quy Ước Mới</Button>
        </Stack>
      </Stack>
      <Alert severity="warning" icon={false} sx={{ mb: 2 }}>
        <b>Quy Chuẩn Hao Lai & Tỷ Lệ Quy Đổi Từng Khách Hàng</b><br />
        • Hao lai là % chênh lệch giữa Tuổi giao (F_delivery) và Tuổi kho (F_stock): <b>Hao lai (%) = Tuổi giao - Tuổi kho.</b><br />
        • Quản lý hiệu lực 2 chiều: Tự động đóng bản ghi cũ (Auto-closing), bảo lưu lịch sử kiểm toán bất biến, tra cứu As-Of theo ngày giao dịch.
      </Alert>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <KpiCard label="Tổng số quy ước" value={rules.length} hint={`Đang áp dụng: ${active} quy ước`} />
        <KpiCard label="Quy ước Vàng (GOLD)" value={rules.filter((r) => r.material === 'GOLD').length} hint="Quy ước tính nợ Vàng" color="#ca8a03" />
        <KpiCard label="Quy ước Bạc (SILVER)" value={rules.filter((r) => r.material === 'SILVER').length} hint="Quy ước tính nợ Bạc" color="#1570ef" />
      </Stack>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
        <OutlinedInput size="small" placeholder="Tìm theo mã/tên khách hàng, mã số đối chiếu..." value={q} onChange={(e) => setQ(e.target.value)}
          startAdornment={<InputAdornment position="start">{mi('search')}</InputAdornment>} sx={{ width: 340, borderRadius: '10px', height: 32 }} />
        <Typography variant="caption">Nguyên liệu:</Typography>
        <Select size="small" value={mat} onChange={(e) => setMat(e.target.value as typeof mat)} sx={{ height: 32 }}>
          <MenuItem value="ALL">Tất Cả Nguyên Liệu</MenuItem><MenuItem value="GOLD">Vàng</MenuItem><MenuItem value="SILVER">Bạc</MenuItem>
        </Select>
        <Typography variant="caption">Trạng thái:</Typography>
        <Select size="small" value={st} onChange={(e) => setSt(e.target.value as typeof st)} sx={{ height: 32 }}>
          <MenuItem value="ALL">Tất Cả Trạng Thái</MenuItem><MenuItem value="ON">Hiệu lực</MenuItem><MenuItem value="OFF">Hết hiệu lực</MenuItem>
        </Select>
        <Typography variant="caption" sx={{ flex: 1, textAlign: 'right' }} color="text.secondary">Hiển thị {shown.length} / {rules.length} quy ước</Typography>
      </Stack>

      <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '6px', maxHeight: 'calc(100vh - 460px)' }}>
        <Table stickyHeader size="small">
          <TableHead><TableRow>
            {['STT', 'MÃ ĐỐI CHIẾU', 'TÊN KHÁCH HÀNG', 'MÃ — TÊN CÔNG TY', 'LOẠI NL', 'TUỔI KHO (F_STOCK)', 'TUỔI GIAO (F_DELIVERY)', 'HAO LAI (%)', 'NGÀY HIỆU LỰC', 'TRẠNG THÁI', 'THAO TÁC'].map((h) => <TableCell key={h}>{h}</TableCell>)}
          </TableRow></TableHead>
          <TableBody>
            {shown.map(({ r, c }, i) => (
              <TableRow hover key={r.id} sx={{ height: 54 }}>
                <TableCell>{i + 1}</TableCell>
                <TableCell><b>{r.debtAccountCode}</b></TableCell>
                <TableCell><b>{c?.name ?? r.customerCode}</b></TableCell>
                <TableCell sx={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><b>{r.customerCode}</b> — {c?.company}</TableCell>
                <TableCell><StatusBadge tone={r.material === 'GOLD' ? 'yellow' : 'gray'}>{MATERIAL_LABEL[r.material].toUpperCase()}</StatusBadge></TableCell>
                <TableCell><b>{r.productionFineness.toFixed(2)}%</b></TableCell>
                <TableCell><b style={{ color: '#2e7d32' }}>{r.deliveryFineness.toFixed(2)}%</b></TableCell>
                <TableCell><StatusBadge tone={lossTone(r.lossRate)}>{r.lossRate > 0 ? '+' : ''}{r.lossRate.toFixed(2)}%</StatusBadge>
                  <Typography variant="caption" component="div" color="text.secondary" sx={{ fontWeight: 400 }}>{r.deliveryFineness}% - {r.productionFineness}%</Typography></TableCell>
                <TableCell>{r.effectiveFrom}{r.effectiveTo ? ` → ${r.effectiveTo}` : ''}</TableCell>
                <TableCell><StatusBadge tone={expired(r) ? 'gray' : 'green'}>{expired(r) ? 'HẾT HIỆU LỰC' : 'HIỆU LỰC'}</StatusBadge></TableCell>
                <TableCell>
                  <IconButton size="small" title="Sửa" onClick={() => setDlg({ rule: r })}>{mi('edit')}</IconButton>
                  <IconButton size="small" title="Xóa" color="error" onClick={() => { if (window.confirm(`Xóa quy ước ${r.debtAccountCode} (tuổi kho ${r.productionFineness}%)?`)) { deleteRule(r.id); setToast('Đã xóa quy ước'); } }}>{mi('delete')}</IconButton>
                </TableCell>
              </TableRow>
            ))}
            {shown.length === 0 && <TableRow><TableCell colSpan={11} align="center" sx={{ py: 4, color: 'text.secondary' }}>Không có quy ước phù hợp</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      {dlg && <RuleDialog key={dlg.rule?.id ?? 'new'} rule={dlg.rule} onClose={() => setDlg(null)} onSaved={(r) => setToast(`Đã lưu quy ước ${r.debtAccountCode}`)} />}
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setToast(null)}>{toast}</Alert>
      </Snackbar>
    </Box>
  );
}
