import { MenuItem, Pagination, Select, Stack, Typography } from '@mui/material';

interface Props { page: number; pageSize: number; total: number; onPage: (p: number) => void; onPageSize: (s: number) => void }

const SIZES = [25, 50, 100, 130, 200, 0]; // 0 = Tất cả

export default function TablePager({ page, pageSize, total, onPage, onPageSize }: Props) {
  const pages = pageSize === 0 ? 1 : Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : pageSize === 0 ? 1 : (page - 1) * pageSize + 1;
  const to = pageSize === 0 ? total : Math.min(total, page * pageSize);
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.5 }}>
      <Typography variant="caption" color="text.secondary">Hiển thị {from}–{to} trên tổng số {total} dòng</Typography>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Typography variant="caption" color="text.secondary">Số dòng/trang:</Typography>
        <Select size="small" value={pageSize} onChange={(e) => { onPageSize(Number(e.target.value)); onPage(1); }} sx={{ height: 32, fontSize: 14 }}>
          {SIZES.map((s) => <MenuItem key={s} value={s}>{s === 0 ? `Tất cả (${total} dòng)` : s}</MenuItem>)}
        </Select>
        <Pagination variant="outlined" shape="rounded" count={pages} page={Math.min(page, pages)} onChange={(_, p) => onPage(p)} />
      </Stack>
    </Stack>
  );
}
