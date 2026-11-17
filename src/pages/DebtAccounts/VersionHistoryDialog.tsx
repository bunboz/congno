import { Fragment, useState } from 'react';
import { Alert, Avatar, Box, Button, Collapse, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import FormDialog from '../../components/FormDialog';
import StatusBadge from '../../components/StatusBadge';
import { dmy, person } from '../../lib/format';
import type { DebtAccount, VersionRecord } from '../../lib/types';
import { colors } from '../../tokens';


export default function VersionHistoryDialog({ account, open, onClose, onChangeFineness }: { account: DebtAccount; open: boolean; onClose: () => void; onChangeFineness: () => void }) {
  const [openV, setOpenV] = useState<number | null>(account.version);
  const last = account.history[account.history.length - 1];
  const current: VersionRecord = {
    version: account.version, code: account.code, fineness: account.fineness,
    delta: last ? Math.round((account.fineness - last.fineness) * 100) / 100 : null,
    effectiveFrom: account.effectiveFrom, effectiveTo: null, createdBy: account.modifiedBy, createdAt: account.modifiedAt,
    note: account.versionNote ?? account.note,
  };
  const rows = [current, ...[...account.history].reverse()];
  const currentBadge = account.isActive ? <StatusBadge tone="green">● Đang hoạt động</StatusBadge>
    : account.status === 'CLOSED' ? <StatusBadge tone="gray">Tạm khóa</StatusBadge> : <StatusBadge tone="gray">Ngưng hoạt động</StatusBadge>;

  return (
    <FormDialog open={open} onClose={onClose} width={880}
      title={<>Lịch Sử Phiên Bản Mã Đối Chiếu: {account.code}</>} subtitle={`${account.customerName} - ${account.customerCompany}`}
      footer={<>
        <Typography variant="caption" sx={{ flex: 1, color: 'primary.main' }}>Toàn vẹn số dư: Bút toán lịch sử bảo toàn bất biến theo tuổi từng version</Typography>
        <Button variant="contained" onClick={onChangeFineness}>Đổi Tuổi Đối Chiếu (Tạo Version Mới)</Button>
      </>}>
      <Box sx={{ p: 1, mb: 2, bgcolor: colors.white, border: '1px solid', borderColor: 'divider', borderRadius: '6px', fontSize: 13 }}>
        <Stack direction="row" spacing={3} flexWrap="wrap">
          <span>Khách hàng ERP: <b>{account.customerName}</b> (Mã: <b>{account.customerCode}</b>)</span>
          <span>Kênh: {account.channel}</span>
          <span>Phiên bản hiện tại: <b>v{account.version}</b> ({account.fineness.toFixed(2)}%)</span>
          <span>Tổng số: <b>{rows.length} phiên bản</b></span>
        </Stack>
      </Box>
      <Table size="small" sx={{ bgcolor: colors.white, '& .MuiTableCell-root': { px: 1 } }}>
        <TableHead><TableRow>
          <TableCell width={72}>Version</TableCell><TableCell>Mã Đối Chiếu</TableCell><TableCell>Tuổi Đối Chiếu</TableCell>
          <TableCell>Thời Gian Hiệu Lực</TableCell><TableCell>Người Tạo</TableCell><TableCell>Ngày Tạo</TableCell><TableCell>Trạng Thái</TableCell>
        </TableRow></TableHead>
        <TableBody>
          {rows.map((v) => {
            const isCur = v.version === account.version;
            const expanded = openV === v.version;
            return (
              <Fragment key={v.version}>
                <TableRow hover onClick={() => setOpenV(expanded ? null : v.version)} sx={{ cursor: 'pointer', bgcolor: isCur ? colors.rowTint : undefined }}>
                  <TableCell><Stack direction="row" alignItems="center">
                    <IconButton size="small"><span className="material-icons" style={{ fontSize: 18 }}>{expanded ? 'expand_more' : 'chevron_right'}</span></IconButton>
                    <StatusBadge tone={isCur ? 'green' : 'gray'}>v{v.version}</StatusBadge></Stack></TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{v.code}</TableCell>
                  <TableCell><b>{v.fineness.toFixed(2)}%</b>{v.delta !== null && v.delta !== 0 && <> <StatusBadge tone={v.delta > 0 ? 'green' : 'red'}>{v.delta > 0 ? '+' : ''}{v.delta.toFixed(2)}%</StatusBadge></>}</TableCell>
                  <TableCell>{dmy(v.effectiveFrom)} - {v.effectiveTo ? dmy(v.effectiveTo) : 'Hiện tại (Vô cực)'}</TableCell>
                  <TableCell><Stack direction="row" alignItems="center" spacing={1}><Avatar sx={{ width: 26, height: 26, flexShrink: 0, bgcolor: colors.primary }}>{' '}</Avatar><span>{person(v.createdBy)}</span></Stack></TableCell>
                  <TableCell>{dmy(v.createdAt)} {v.createdAt.slice(11, 16)}</TableCell>
                  <TableCell>{isCur ? currentBadge : <StatusBadge tone="gray">Ngưng hoạt động</StatusBadge>}</TableCell>
                </TableRow>
                <TableRow><TableCell colSpan={7} sx={{ p: 0, borderBottom: expanded ? undefined : 'none' }}>
                  <Collapse in={expanded} unmountOnExit><Box sx={{ p: 1.5 }}>
                    <Typography variant="body2"><b>Lý do thay đổi:</b> {v.note || 'Không có'}</Typography>
                    {!isCur && <Alert severity="warning" sx={{ mt: 1 }}>Khóa bất biến: Các bút toán phát sinh trong khoảng thời gian này được bảo toàn nguyên vẹn theo tuổi đối chiếu {v.fineness.toFixed(2)}%</Alert>}
                  </Box></Collapse>
                </TableCell></TableRow>
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </FormDialog>
  );
}
