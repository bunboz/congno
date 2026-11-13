import { Typography } from '@mui/material';
import type { ReactNode } from 'react';

export type Tone = 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'purple' | 'orange';

// [chữ/viền, nền nhạt]; kiểu viền + nền nhạt đúng chip ERP và Figma DS Badges.
const TONES: Record<Tone, [string, string]> = {
  green: ['#069021', '#cde9d3'], yellow: ['#ca8a03', '#f4e8cd'], red: ['#ef1515', '#fcd0d0'],
  blue: ['#1570ef', '#d0e2fc'], gray: ['#6b7280', '#f3f4f6'], purple: ['#6d28d9', '#ede9fe'], orange: ['#c2410c', '#ffedd5'],
};

export default function StatusBadge({ tone, children }: { tone: Tone; children: ReactNode }) {
  const [c, bg] = TONES[tone];
  return (
    <Typography component="span" variant="caption" sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.5, px: '6px', py: '4px', borderRadius: '6px',
      border: `1px solid ${c}`, color: c, bgcolor: bg, fontWeight: 500, whiteSpace: 'nowrap',
    }}>{children}</Typography>
  );
}
