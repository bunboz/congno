import { useNavigate } from 'react-router-dom';
import { Stack, Typography } from '@mui/material';

interface Item { label: string; to?: string }

// Breadcrumb đúng ERP: chữ 14px, mục cha xám #737676, mục cuối đen, ngăn cách bằng icon keyboard_arrow_right.
export default function Breadcrumb({ items }: { items: Item[] }) {
  const nav = useNavigate();
  return (
    <Stack component="nav" aria-label="Breadcrumb" direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1.5 }}>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <Stack key={it.label} direction="row" alignItems="center" spacing={0.5}>
            <Typography
              aria-current={last ? 'page' : undefined}
              onClick={it.to && !last ? () => nav(it.to!) : undefined}
              sx={{ color: last ? '#0c0c0c' : '#737676', cursor: it.to && !last ? 'pointer' : 'default', '&:hover': it.to && !last ? { color: '#07554b' } : undefined }}>
              {it.label}
            </Typography>
            {!last && <span className="material-icons" aria-hidden style={{ fontSize: 19, color: '#737676' }}>keyboard_arrow_right</span>}
          </Stack>
        );
      })}
    </Stack>
  );
}
