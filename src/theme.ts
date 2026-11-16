import { createTheme } from '@mui/material/styles';
import { colors } from './tokens';

// Token đo trực tiếp từ ERP Mua hàng (develop.admin.purchase.sevago.local): nền trắng, phẳng, không bóng đổ.
const theme = createTheme({
  palette: {
    primary: { main: colors.primary, light: colors.primaryLight, dark: colors.primaryDark, contrastText: colors.onPrimary },
    error: { main: colors.error, light: colors.errorLight, dark: colors.errorDark, contrastText: colors.onPrimary },
    success: { main: colors.success, light: colors.successLight, dark: colors.successDark, contrastText: colors.onPrimary },
    info: { main: colors.info, light: colors.infoLight, dark: colors.infoDark, contrastText: colors.onPrimary },
    warning: { main: colors.warning, light: colors.warningLight, dark: colors.warningDark, contrastText: colors.onPrimary },
    text: { primary: colors.text, secondary: colors.textSecondary, disabled: colors.disabled },
    background: { default: colors.white, paper: colors.white },
    divider: colors.line,
  },
  shape: { borderRadius: 4 },
  spacing: 8,
  typography: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    body1: { fontSize: 14, fontWeight: 400, lineHeight: 1.5 },
    body2: { fontSize: 14, fontWeight: 500, lineHeight: 1.43 },
    subtitle1: { fontSize: 14, fontWeight: 550, lineHeight: 1.75 },
    subtitle2: { fontSize: 15, fontWeight: 550, lineHeight: 1.57 },
    h6: { fontSize: 18, fontWeight: 550, lineHeight: 1.6 },
    caption: { fontSize: 12, fontWeight: 500, lineHeight: 1.66 },
    button: { fontSize: '0.875rem', fontWeight: 550, textTransform: 'none' },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 6, minHeight: 34, padding: '6px 16px', whiteSpace: 'nowrap' },
        outlined: { borderColor: colors.inputLine, color: colors.buttonText, '&:hover': { background: colors.headBg, borderColor: colors.muted } },
        containedPrimary: { boxShadow: '0 2px 12px rgba(0,0,0,.08)' },
      },
    },
    MuiIconButton: { styleOverrides: { root: { color: colors.muted, '&:hover': { color: colors.primary, background: colors.hoverTint } } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 6, fontSize: 14, '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.inputLine } },
        input: { padding: '7px 12px', height: 20 },
      },
    },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', minHeight: 34, padding: 8, fontSize: 14, fontWeight: 400, '&.Mui-selected': { fontWeight: 600, color: colors.black } } } },
    MuiTabs: { styleOverrides: { root: { minHeight: 34, borderBottom: `1px solid ${colors.line}` } } },
    MuiTableContainer: { styleOverrides: { root: { border: `1px solid ${colors.line}`, borderRadius: 4 } } },
    MuiTableCell: {
      styleOverrides: {
        root: { padding: '10px 12px', fontSize: 14, borderBottom: `1px solid ${colors.lineSoft}` },
        head: { background: colors.headBg, fontWeight: 550, '&:not(:last-of-type)': { borderRight: `1px solid ${colors.lineHead}` }, borderTop: 0, borderBottom: `1px solid ${colors.line}`, whiteSpace: 'nowrap' },
      },
    },
    MuiPaginationItem: { styleOverrides: { root: { borderRadius: 6 } } },
  },
});

export default theme;
