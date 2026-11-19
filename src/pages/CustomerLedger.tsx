import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, Box, Button, Stack, Typography } from '@mui/material';
import Breadcrumb from '../components/Breadcrumb';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { useStore } from '../state/store';
import { colors } from '../tokens';

// US-03 AC-04: màn đích của "Mã Khách / Tên Khách Hàng / Xem Chi Tiết", tự chọn đúng khách và mã đối chiếu.
// Nội dung bảng bút toán thuộc màn Sổ Chi Tiết Khách Hàng, ngoài 4 US và BA chưa mô tả nên chưa dựng.
export default function CustomerLedger() {
  const { code } = useParams();
  const nav = useNavigate();
  const { customers, accounts } = useStore();
  const c = customers.find((x) => x.code === code);
  const mine = accounts.filter((a) => a.customerCode === code);
  const selected = (mine.find((a) => a.isActive) ?? mine[0])?.code;
  return (
    <Box>
      <Breadcrumb items={[{ label: 'Quản lý công nợ', to: '/credit-limits' }, { label: 'Sổ Chi Tiết Khách Hàng' }]} />
      <Card>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: colors.primary }}>{' '}</Avatar>
            <Box>
              <Typography sx={{ fontWeight: 600 }}>{code}{c ? ` - ${c.name}` : ''}</Typography>
              {c && <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 400 }}>{c.company}</Typography>}
            </Box>
          </Stack>
          <Button variant="contained" color="inherit" onClick={() => nav(-1)}>Quay lại</Button>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
          <Typography variant="subtitle1" sx={{ color: colors.label }}>Mã Đối Chiếu</Typography>
          {mine.map((a) => <StatusBadge key={a.id} tone={a.code === selected ? 'green' : 'gray'}>{a.code} v{a.version}</StatusBadge>)}
        </Stack>
      </Card>
    </Box>
  );
}
