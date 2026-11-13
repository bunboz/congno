import { NavLink, Outlet } from 'react-router-dom';
import { Avatar, Badge, Box, Divider, Stack, Typography } from '@mui/material';

const groups = [
  [
    { label: 'Mã Đối Chiếu (Sổ Nợ)', to: '/debt-accounts', icon: 'receipt_long' },
    { label: 'Sổ Chi Tiết Khách Hàng', to: '/customer-ledger/100003', icon: 'menu_book' },
  ],
  [
    { label: 'Hạn Mức & Cảnh Báo Rủi Ro', to: '/credit-limits', icon: 'shield' },
    { label: 'Quy Ước Tuổi & Hao Lai', to: '/rules-settings', icon: 'tune' },
  ],
];

const mi = (n: string, size = 18) => <span className="material-icons" style={{ fontSize: size }}>{n}</span>;

// Bố cục theo ERP Mua hàng: header trắng trên cùng, sidebar xanh đậm phẳng bên dưới.
export default function Shell() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
      <Stack component="header" direction="row" alignItems="center" justifyContent="space-between" sx={{ height: 48, px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box aria-hidden sx={{ display: 'grid', placeItems: 'center', color: '#111' }}>{mi('apps', 26)}</Box>
          <Avatar variant="rounded" sx={{ bgcolor: '#f5c443', color: '#07554b', width: 32, height: 32, borderRadius: '8px' }}>{mi('balance')}</Avatar>
          <Typography sx={{ fontWeight: 600, fontSize: 15 }}>Công nợ</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Badge badgeContent="99+" color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 18, height: 16 } }}>
            <span className="material-icons" aria-label="Thông báo" style={{ fontSize: 20, color: '#07554b' }}>notifications_none</span>
          </Badge>
          <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: 12, fontWeight: 600 }}>MD</Avatar>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>Nguyễn Thị Mỹ Dung</Typography>
            <Typography sx={{ fontSize: 11, color: '#1570ef', lineHeight: 1.2 }}>BA · Business Analyst</Typography>
          </Box>
        </Stack>
      </Stack>
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Box component="nav" sx={{ width: 252, flexShrink: 0, bgcolor: 'primary.main', color: '#fff', pt: 1 }}>
          {groups.map((g, gi) => (
            <Box key={gi}>
              {gi > 0 && <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,.18)' }} />}
              {g.map((i) => (
                <NavLink key={i.to} to={i.to} style={{ textDecoration: 'none' }}>
                  {({ isActive }) => (
                    <Stack direction="row" alignItems="center" spacing={1.25} sx={{
                      height: 36, px: 2, fontSize: 14, whiteSpace: 'nowrap', color: '#fff', cursor: 'pointer',
                      bgcolor: isActive ? 'rgba(255,255,255,.16)' : 'transparent', fontWeight: isActive ? 600 : 400,
                      '&:hover': { bgcolor: 'rgba(255,255,255,.1)' },
                    }}>
                      <Box aria-hidden sx={{ display: 'grid', placeItems: 'center', opacity: 0.9 }}>{mi(i.icon)}</Box>
                      <span>{i.label}</span>
                    </Stack>
                  )}
                </NavLink>
              ))}
            </Box>
          ))}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, p: 2 }}><Outlet /></Box>
      </Box>
    </Box>
  );
}
