import { colors } from '../tokens';
import { Box, TextField, Typography, type TextFieldProps } from '@mui/material';

// Ô nhập kiểu ERP / Figma DS: nhãn nằm trên ô (không nhãn nổi), dấu * đỏ khi bắt buộc.
export default function Field({ label, required, fullWidth = true, sx, ...rest }: TextFieldProps) {
  return (
    <Box sx={{ flex: fullWidth ? 1 : undefined, minWidth: 0, ...(sx as object) }}>
      {label && (
        <Typography variant="subtitle1" component="label" sx={{ display: 'block', color: colors.label }}>
          {label}{required && <span style={{ color: colors.error }}> *</span>}
        </Typography>
      )}
      <TextField size="small" fullWidth {...rest} InputLabelProps={undefined} />
    </Box>
  );
}
