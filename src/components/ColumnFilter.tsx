import { Box, Button, Checkbox, Collapse, IconButton, MenuItem, OutlinedInput, Popover, Select, Stack, TableCell, Tooltip, Typography, type TableCellProps } from '@mui/material';
import { useMemo, useState } from 'react';
import { colors } from '../tokens';

const mi = (n: string, size = 16) => <span className="material-icons" style={{ fontSize: size }}>{n}</span>;

type Cond = { op: string; val: string };
type ColState = { picked: string[] | null; cond: Cond | null }; // picked null = không lọc theo giá trị
const OPS: [string, string][] = [['contains', 'Chứa'], ['not', 'Không chứa'], ['eq', 'Bằng'], ['starts', 'Bắt đầu bằng'], ['ends', 'Kết thúc bằng']];
const test = (v: string, c: Cond) => {
  const a = v.toLowerCase(), b = c.val.trim().toLowerCase();
  return !b || (c.op === 'contains' ? a.includes(b) : c.op === 'not' ? !a.includes(b) : c.op === 'eq' ? a === b : c.op === 'starts' ? a.startsWith(b) : a.endsWith(b));
};
// dd/mm/yyyy [hh:mm] -> yyyy-mm-dd [hh:mm] để so sánh đúng thứ tự thời gian
const key = (s: string) => s.replace(/^(\d\d)\/(\d\d)\/(\d{4})/, '$3-$2-$1');
const cmp = (a: string, b: string) => key(a).localeCompare(key(b), 'vi', { numeric: true });

// Bộ lọc theo cột kiểu ERP: sắp xếp, lọc theo điều kiện, tích chọn giá trị. toRow trả về chữ hiển thị của từng cột.
export function useColumnFilters<T>(items: T[], toRow: (t: T) => Record<string, string>) {
  const [cols, setCols] = useState<Record<string, ColState>>({});
  const [sort, setSort] = useState<{ k: string; dir: 1 | -1 } | null>(null);
  const rows = useMemo(() => items.map((t) => ({ t, r: toRow(t) })), [items]); // eslint-disable-line react-hooks/exhaustive-deps
  const on = (k: string) => { const c = cols[k]; return !!c && (c.picked !== null || (c.cond !== null && c.cond.val.trim() !== '')); };
  const view = useMemo(() => {
    const out = rows.filter(({ r }) => Object.entries(cols).every(([k, c]) => (c.picked === null || c.picked.includes(r[k] ?? '')) && (!c.cond || test(r[k] ?? '', c.cond))));
    if (sort) out.sort((a, b) => sort.dir * cmp(a.r[sort.k] ?? '', b.r[sort.k] ?? ''));
    return out.map((x) => x.t);
  }, [rows, cols, sort]);
  return {
    view, on, rows, sort, setSort, cols,
    active: Object.keys(cols).some(on) || !!sort,
    setCol: (k: string, c: ColState | null) => setCols((o) => { const n = { ...o }; if (c) n[k] = c; else delete n[k]; return n; }),
    clear: () => { setCols({}); setSort(null); },
  };
}
type Ctl = ReturnType<typeof useColumnFilters<any>>; // eslint-disable-line @typescript-eslint/no-explicit-any

export function ClearFilterButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <Tooltip title="Xóa bộ lọc cột"><span>
      <IconButton aria-label="Xóa bộ lọc cột" disabled={!active} onClick={onClick} sx={{ border: '1px solid', borderColor: colors.inputBorder, borderRadius: '6px', height: 32, width: 32, color: active ? 'primary.main' : undefined }}>{mi('filter_alt_off', 18)}</IconButton>
    </span></Tooltip>
  );
}

export function FilterHead({ label, k, ctl, date, ...rest }: { label: string; k: string; ctl: Ctl; date?: boolean } & TableCellProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [op, setOp] = useState('contains');
  const [val, setVal] = useState('');
  const [open, setOpen] = useState(false);
  const on = ctl.on(k);
  const counts = useMemo(() => { const m = new Map<string, number>(); ctl.rows.forEach(({ r }) => m.set(r[k] ?? '', (m.get(r[k] ?? '') ?? 0) + 1)); return [...m.entries()].sort((a, b) => cmp(a[0], b[0])); }, [ctl.rows, k]);
  const show = (e: HTMLElement) => { const c = ctl.cols[k]; setPicked(c?.picked ?? counts.map(([v]) => v)); setOp(c?.cond?.op ?? 'contains'); setVal(c?.cond?.val ?? ''); setOpen(!!c?.cond); setAnchor(e); };
  const close = () => setAnchor(null);
  const apply = () => { ctl.setCol(k, { picked: picked.length === counts.length ? null : picked, cond: val.trim() ? { op, val } : null }); close(); };
  const sortBtn = (dir: 1 | -1, text: string) => (
    <MenuItem dense selected={ctl.sort?.k === k && ctl.sort.dir === dir} onClick={() => { ctl.setSort(ctl.sort?.k === k && ctl.sort.dir === dir ? null : { k, dir }); close(); }}>
      <Box sx={{ mr: 1, display: 'flex' }}>{mi(dir === 1 ? 'arrow_upward' : 'arrow_downward')}</Box>{text}
    </MenuItem>);
  return (
    <TableCell {...rest}>
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        {label}
        <IconButton size="small" aria-label={`Lọc cột ${label}`} onClick={(e) => show(e.currentTarget)} sx={{ p: 0.25, color: on || ctl.sort?.k === k ? 'primary.main' : colors.disabled }}>{mi(on ? 'filter_alt' : 'filter_list')}</IconButton>
      </Box>
      <Popover open={!!anchor} anchorEl={anchor} onClose={close} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} slotProps={{ paper: { sx: { width: 292, borderRadius: '6px', boxShadow: `0 4px 20px ${colors.line}` } } }}>
        {sortBtn(1, date ? 'Sắp xếp cũ đến mới' : 'Sắp xếp A đến Z')}
        {sortBtn(-1, date ? 'Sắp xếp mới đến cũ' : 'Sắp xếp Z đến A')}
        <MenuItem dense disabled={!on} onClick={() => { ctl.setCol(k, null); close(); }}><Box sx={{ mr: 1, display: 'flex' }}>{mi('filter_alt_off')}</Box>Xóa bộ lọc khỏi cột</MenuItem>
        <MenuItem dense onClick={() => setOpen(!open)} sx={{ justifyContent: 'space-between', bgcolor: colors.headBg }}>Lọc theo điều kiện{mi(open ? 'keyboard_arrow_up' : 'keyboard_arrow_down', 18)}</MenuItem>
        <Collapse in={open}><Stack spacing={1} sx={{ p: 1.5 }}>
          <Select size="small" value={op} onChange={(e) => setOp(e.target.value)}>{OPS.map(([v, t]) => <MenuItem key={v} value={v}>{t}</MenuItem>)}</Select>
          <Typography variant="caption" color="text.secondary">Giá trị</Typography>
          <OutlinedInput size="small" value={val} onChange={(e) => setVal(e.target.value)} />
        </Stack></Collapse>
        <Stack direction="row" justifyContent="space-around" sx={{ py: 0.5 }}>
          <Button size="small" variant="text" sx={{ color: colors.text }} onClick={() => setPicked(counts.map(([v]) => v))}>Chọn tất cả</Button>
          <Button size="small" variant="text" sx={{ color: colors.text }} onClick={() => setPicked([])}>Bỏ chọn tất cả</Button>
        </Stack>
        <Box sx={{ maxHeight: 140, overflowY: 'auto', px: 1 }}>
          {counts.map(([v, n]) => (
            <Stack key={v} direction="row" alignItems="center" sx={{ pr: 1 }}>
              <Checkbox size="small" checked={picked.includes(v)} onChange={(e) => setPicked(e.target.checked ? [...picked, v] : picked.filter((x) => x !== v))} />
              <Typography noWrap sx={{ flex: 1, fontSize: 14 }}>{v || '(Trống)'}</Typography>
              <Typography variant="caption" color="text.secondary">({n})</Typography>
            </Stack>))}
        </Box>
        <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ p: 1.5 }}>
          <Button variant="contained" color="inherit" onClick={close}>Hủy</Button>
          <Button variant="contained" onClick={apply}>Đồng ý</Button>
        </Stack>
      </Popover>
    </TableCell>
  );
}
