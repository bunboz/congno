import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';

export default function CustomerLedger() {
  const { code } = useParams();
  return (
    <>
      <Typography variant="h6">Sổ Chi Tiết Khách Hàng — {code}</Typography>
      <Typography color="text.secondary">Màn Sổ Chi Tiết Khách Hàng nằm ngoài phạm vi 4 US này.</Typography>
    </>
  );
}
