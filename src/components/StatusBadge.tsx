import { Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { colors } from '../tokens';

export type Tone = 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'purple' | 'orange';

// [chữ/viền, nền nhạt]; kiểu viền + nền nhạt đúng chip ERP và Figma DS Badges.
const TONES: Record<Tone, [string, string]> = {
  green: [colors.chipGreenFg, colors.chipGreenBg], yellow: [colors.chipYellowFg, colors.chipYellowBg], red: [colors.chipRedFg, colors.chipRedBg],
  blue: [colors.link, colors.chipBlueBg], gray: [colors.chipGrayFg, colors.chipGrayBg], purple: [colors.chipPurpleFg, colors.chipPurpleBg], orange: [colors.chipOrangeFg, colors.chipOrangeBg],
};

// solid = kiểu Badge đặc của Figma DS (nền đậm, chữ trắng) cho trạng thái cần chú ý.
export default function StatusBadge({ tone, children, solid }: { tone: Tone; children: ReactNode; solid?: boolean }) {
  const [c, bg] = TONES[tone];
  return (
    <Typography component="span" variant="caption" sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.5, px: '6px', py: '4px', borderRadius: '6px',
      border: `1px solid ${c}`, color: solid ? colors.white : c, bgcolor: solid ? c : bg, fontWeight: 500, whiteSpace: 'nowrap',
    }}>{children}</Typography>
  );
}

