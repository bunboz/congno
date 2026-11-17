import { Box, Typography, createFilterOptions } from '@mui/material';
import type { Customer } from '../lib/types';

// Dùng chung cho mọi ô chọn khách hàng: ô hiện "mã - tên công ty", danh sách hiện 2 dòng, tìm theo mã/tên/công ty.
export const customerPicker = {
  getOptionLabel: (c: Customer) => `${c.code} - ${c.company}`,
  isOptionEqualToValue: (a: Customer, b: Customer) => a.code === b.code,
  filterOptions: createFilterOptions<Customer>({ stringify: (c) => `${c.code} ${c.name} ${c.company}` }),
  renderOption: (props: React.HTMLAttributes<HTMLLIElement>, c: Customer) => (
    <li {...props} key={c.code}>
      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap sx={{ fontSize: 14 }}>{c.code} - {c.name}</Typography>
        <Typography noWrap variant="caption" color="text.secondary" sx={{ fontWeight: 400 }}>{c.company}</Typography>
      </Box>
    </li>
  ),
};
