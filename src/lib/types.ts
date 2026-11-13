export type Material = 'GOLD' | 'SILVER' | 'PLATINUM';
export type Channel = 'B2B' | 'B2B2C' | 'Doanh nghiệp' | 'Vãng lai';

export interface Balance { goldDelivered: number; goldPending: number; labor: number }

export interface VersionRecord {
  version: number; code: string; fineness: number; delta: number | null;
  effectiveFrom: string; effectiveTo: string | null;
  createdBy: string; createdAt: string; note: string;
}

export interface DebtAccount {
  id: string; code: string; customerCode: string; customerName: string; customerCompany: string;
  channel: Channel; material: Material; uom: 'LUONG' | 'GRAM';
  fineness: number; version: number;
  status: 'ACTIVE' | 'SUPERSEDED' | 'CLOSED'; isActive: boolean;
  journalEntryCount: number; note: string; effectiveFrom: string;
  history: VersionRecord[]; balance: Balance; modifiedBy: string; modifiedAt: string;
}

export interface Customer { code: string; name: string; company: string; channel: Channel }

export interface LimitRow {
  customerCode: string;
  goldLimit: number | null; silverLimit: number | null; laborLimit: number | null;
  termDays: number; approvalNote: string;
  debt: { gold: number; silver: number; labor: number };
  nextDueDate: string | null;
}

export const MATERIAL_LABEL: Record<Material, string> = { GOLD: 'Vàng', SILVER: 'Bạc', PLATINUM: 'Bạch kim' };
