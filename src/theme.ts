import { createTheme } from '@mui/material/styles';

// Token đo trực tiếp từ ERP Mua hàng (develop.admin.purchase.sevago.local).
const theme = createTheme({
  palette: {
    primary: { main: '#07554b', light: '#018775', dark: '#043731', contrastText: '#fdfdfd' },
    error: { main: '#bb0000', light: '#dd0000', dark: '#9a0000', contrastText: '#fdfdfd' },
    success: { main: '#2e7d32', light: '#428a46', dark: '#29702d', contrastText: '#fdfdfd' },
    info: { main: '#105089', light: '#276194', dark: '#0e487b', contrastText: '#fdfdfd' },
    warning: { main: '#ffc107', light: '#ffc71f', dark: '#e5ad06', contrastText: '#fdfdfd' },
    text: { primary: '#0c0c0c', secondary: '#242424', disabled: '#a7a7a7' },
    background: { default: '#ffffff', paper: '#fafafa' },
    divider: '#e4e6e6',
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
      styleOverrides: { root: { borderRadius: 6, minHeight: 32, padding: '6px 16px' } },
    },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 6, fontSize: 14 }, input: { padding: '6px 12px', height: 20 } } },
    MuiTableCell: {
      styleOverrides: {
        root: { padding: 8, fontSize: 14, borderBottom: '1px solid #e4e6e6' },
        head: { background: '#f9fafb', fontWeight: 550, borderTop: '1px solid #e4e6e6', whiteSpace: 'nowrap' },
      },
    },
  },
});

export default theme;
