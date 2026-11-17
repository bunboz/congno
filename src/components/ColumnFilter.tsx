import { Box, IconButton, OutlinedInput, Popover, TableCell, Tooltip, type TableCellProps } from '@mui/material';
import { useState } from 'react';
import { colors } from '../tokens';

const mi = (n: string, size = 16) => <span className="material-icons" style={{ fontSize: size }}>{n}</span>;

// Bộ lọc theo cột kiểu ERP: icon cạnh tiêu đề cột mở ô nhập; cột đang lọc đổi màu xanh.
export function useColumnFilters() {
  const [f, setF] = useState<Record<string, string>>({});
  const active = Object.values(f).some((v) => v.trim() !== '');
  return {
    f, active,
    set: (k: string, v: string) => setF((o) => ({ ...o, [k]: v })),
    clear: () => setF({}),
    // Dòng thỏa khi mọi cột đang lọc đều chứa chuỗi nhập (không phân biệt hoa thường).
    match: (row: Record<string, string>) => Object.entries(f).every(([k, v]) => !v.trim() || (row[k] ?? '').toLowerCase().includes(v.trim().toLowerCase())),
  };
}

export function ClearFilterButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <Tooltip title="Xóa bộ lọc cột"><span>
      <IconButton aria-label="Xóa bộ lọc cột" disabled={!active} onClick={onClick} sx={{ border: '1px solid', borderColor: colors.inputBorder, borderRadius: '6px', height: 32, width: 32, color: active ? 'primary.main' : undefined }}>{mi('filter_alt_off', 18)}</IconButton>
    </span></Tooltip>
  );
}

export function FilterHead({ label, k, ctl, ...rest }: { label: string; k: string; ctl: ReturnType<typeof useColumnFilters> } & TableCellProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const on = (ctl.f[k] ?? '').trim() !== '';
  return (
    <TableCell {...rest}>
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        {label}
        <IconButton size="small" aria-label={`Lọc cột ${label}`} onClick={(e) => setAnchor(e.currentTarget)} sx={{ p: 0.25, color: on ? 'primary.main' : colors.disabled }}>{mi(on ? 'filter_alt' : 'filter_list')}</IconButton>
      </Box>
      <Popover open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <OutlinedInput autoFocus size="small" placeholder="Nhập để lọc..." value={ctl.f[k] ?? ''} onChange={(e) => ctl.set(k, e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') setAnchor(null); }} sx={{ m: 1, width: 220 }}
          endAdornment={on ? <IconButton size="small" aria-label="Xóa lọc cột" onClick={() => ctl.set(k, '')}>{mi('close')}</IconButton> : undefined} />
      </Popover>
    </TableCell>
  );
}
