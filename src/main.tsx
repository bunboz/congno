import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, MemoryRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './theme';
import Shell from './Shell';
import { StoreProvider } from './state/store';
import DebtAccounts from './pages/DebtAccounts';
import CreditLimits from './pages/CreditLimits';
import Rules from './pages/Rules';
import CustomerLedger from './pages/CustomerLedger';

// Khung xem tĩnh của app nạp file qua data: (HashRouter lỗi ở đó) nên dùng MemoryRouter cho mọi giao thức khác.
const Router = ['http:', 'https:', 'file:'].includes(location.protocol) ? HashRouter : MemoryRouter;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StoreProvider>
      <Router>
        <Routes>
          <Route element={<Shell />}>
            <Route path="/" element={<Navigate to="/debt-accounts" replace />} />
            <Route path="/debt-accounts" element={<DebtAccounts />} />
            <Route path="/credit-limits" element={<CreditLimits />} />
            <Route path="/rules-settings" element={<Rules />} />
            <Route path="/customer-ledger/:code" element={<CustomerLedger />} />
          </Route>
        </Routes>
      </Router>
      </StoreProvider>
    </ThemeProvider>
  </StrictMode>,
);
