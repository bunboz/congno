import { Tab, Tabs } from '@mui/material';

interface Props { value: string; onChange: (v: string) => void; tabs: { value: string; label: string; count: number }[] }

// Tab trạng thái có đếm, như "Tất cả (106)" ở ERP.
export default function StatusTabs({ value, onChange, tabs }: Props) {
  return (
    <Tabs value={value} onChange={(_, v) => onChange(v)} sx={{ mb: 1.5 }}>
      {tabs.map((t) => <Tab key={t.value} value={t.value} label={`${t.label} (${t.count})`} />)}
    </Tabs>
  );
}
