import { NavLink, Outlet } from 'react-router-dom';
import { Avatar, Box, Stack, Typography } from '@mui/material';

const groups = [
  { title: 'SỔ CÔNG NỢ', items: [
    { label: 'Mã Đối Chiếu (Sổ Nợ)', to: '/debt-accounts', icon: 'receipt_long' },
    { label: 'Sổ Chi Tiết Khách Hàng', to: '/customer-ledger/100003', icon: 'menu_book' },
  ] },
  { title: 'CẤU HÌNH & CHÍNH SÁCH', items: [
    { label: 'Hạn Mức & Cảnh Báo Rủi Ro', to: '/credit-limits', icon: 'shield' },
    { label: 'Quy Ước Tuổi & Hao Lai', to: '/rules-settings', icon: 'tune' },
  ] },
];

export default function Shell() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box component="nav" sx={{ width: 211, flexShrink: 0, bgcolor: 'primary.main', color: '#fff', py: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, pb: 2 }}>
          <Avatar variant="rounded" sx={{ bgcolor: '#fff', color: 'primary.main', width: 32, height: 32 }}>
            <span className="material-icons">balance</span>
          </Avatar>
          <Typography variant="subtitle1" sx={{ color: '#fff' }}>Công nợ</Typography>
        </Stack>
        {groups.map((g) => (
          <Box key={g.title} sx={{ mb: 1.5 }}>
            <Typography variant="caption" sx={{ px: 2, color: 'rgba(255,255,255,.6)', letterSpacing: 0.5 }}>{g.title}</Typography>
            {g.items.map((i) => (
              <NavLink key={i.to} to={i.to} style={{ textDecoration: 'none' }}>
                {({ isActive }) => (
                  <Stack direction="row" alignItems="center" spacing={1} sx={{
                    mx: 1, px: 1.5, height: 36, borderRadius: '6px', fontSize: 14,
                    color: isActive ? 'primary.main' : '#fff', bgcolor: isActive ? '#fff' : 'transparent',
                    '&:hover': { bgcolor: isActive ? '#fff' : 'rgba(255,255,255,.1)' },
                  }}>
                    <span className="material-icons" style={{ fontSize: 18 }}>{i.icon}</span>
                    <span>{i.label}</span>
                  </Stack>
                )}
              </NavLink>
            ))}
          </Box>
        ))}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ height: 40, px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2">Nguyễn Thị Mỹ Dung</Typography>
        </Stack>
        <Box sx={{ p: 2 }}><Outlet /></Box>
      </Box>
    </Box>
  );
}
