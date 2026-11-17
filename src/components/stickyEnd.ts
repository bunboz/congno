import { colors } from '../tokens';

// Cột Thao Tác ghim bên phải: bảng cuộn ngang thì cột này đứng yên.
const base = { position: 'sticky', right: 0, boxShadow: `-1px 0 0 ${colors.line}` } as const;
export const stickyEndHead = { ...base, zIndex: 3, bgcolor: colors.headBg };
export const stickyEndCell = { ...base, zIndex: 1, bgcolor: colors.white, '.MuiTableRow-hover:hover &': { bgcolor: colors.hoverTint } };
