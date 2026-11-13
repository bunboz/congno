import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Customer, DebtAccount, LimitRow } from '../lib/types';
import type { Rule } from '../lib/rules';
import { addRule } from '../lib/rules';
import { toggleActive } from '../lib/account';
import { upgradeVersion } from '../lib/fineness';
import * as seed from '../data/mock';

interface AuditEntry { at: string; action: 'CREATED' | 'VERSION_UPGRADED' | 'STATUS_CHANGED' | 'DELETED'; code: string }

interface Store {
  accounts: DebtAccount[]; limits: LimitRow[]; rules: Rule[]; customers: Customer[]; audit: AuditEntry[]; today: string;
  createAccount(a: DebtAccount): void;
  toggleAccount(id: string): void;
  deleteAccount(id: string): void;
  upgrade(id: string, next: number, from: string, reason: string): void;
  saveLimit(l: LimitRow): void;
  saveRule(r: Rule): string | null;
  deleteRule(id: string): void;
}

const Ctx = createContext<Store | null>(null);
export const useStore = () => {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore ngoài StoreProvider');
  return s;
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState(seed.accounts);
  const [limits, setLimits] = useState(seed.limits);
  const [rules, setRules] = useState(seed.rules);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const log = (action: AuditEntry['action'], code: string) => setAudit((a) => [...a, { at: new Date().toISOString(), action, code }]);

  const store: Store = {
    accounts, limits, rules, customers: seed.customers, audit, today: seed.TODAY,
    createAccount(a) { setAccounts((l) => [a, ...l]); log('CREATED', a.code); },
    toggleAccount(id) { setAccounts((l) => toggleActive(l, id)); log('STATUS_CHANGED', id); },
    deleteAccount(id) { setAccounts((l) => l.filter((a) => a.id !== id)); log('DELETED', id); },
    upgrade(id, next, from, reason) {
      setAccounts((l) => l.map((a) => (a.id === id ? upgradeVersion(a, next, from, reason, seed.CURRENT_USER, new Date().toISOString()) : a)));
      log('VERSION_UPGRADED', id);
    },
    saveLimit(row) {
      setLimits((l) => (l.some((x) => x.customerCode === row.customerCode) ? l.map((x) => (x.customerCode === row.customerCode ? row : x)) : [row, ...l]));
    },
    saveRule(r) {
      const rest = rules.filter((x) => x.id !== r.id);
      const res = addRule(rest, r);
      if ('error' in res) return res.error;
      setRules(res.rules);
      return null;
    },
    deleteRule(id) { setRules((l) => l.filter((r) => r.id !== id)); },
  };
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}
