import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import Breadcrumb from '../components/Breadcrumb';
import Card from '../components/Card';
import { useStore } from '../state/store';
import { colors } from '../tokens';

// Ngoài phạm vi 4 US: chỉ là trang đích của liên kết từ màn Hạn mức.
export default function CustomerLedger() {
  const { code } = useParams();
  const nav = useNavigate();
  const { customers } = useStore();
  const c = customers.find((x) => x.code === code);
  return (
    <Box>
      <Breadcrumb items={[{ label: 'Quản lý công nợ', to: '/debt-accounts' }, { label: 'Sổ chi tiết khách hàng' }]} />
      <Card>
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <span className="material-icons" aria-hidden style={{ fontSize: 40, color: colors.muted }}>menu_book</span>
          <Typography variant="h6" sx={{ mt: 1 }}>{code}{c ? ` - ${c.name}` : ''}</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Sổ chi tiết khách hàng nằm ngoài phạm vi 4 màn công nợ này.</Typography>
          <Button variant="outlined" onClick={() => nav(-1)}>Quay lại</Button>
        </Box>
      </Card>
    </Box>
  );
}
