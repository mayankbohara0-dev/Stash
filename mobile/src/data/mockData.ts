// ─── Mock Data — Foundry Money Tracker ─────────────────────────────────────
// All UI data comes from here. No network calls.

// ── Types ─────────────────────────────────────────────────────────────────────

export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  merchant: string;
  category: string;
  method: string;
  amount: number;
  type: TransactionType;
  date: string; // ISO
  iconName: string; // Ionicons glyph
}

export interface InsightItem {
  id: string;
  title: string;
  subtitle: string;
  badgeCount?: number; // undefined = no badge
  iconName: string;
}

export interface Account {
  id: string;
  name: string;
  institution: string;
  last4: string;
  balance: number;
  type: 'savings' | 'current' | 'credit' | 'wallet';
  iconName: string;
}

export interface AnalyticsMonth {
  label: string;   // "Apr"
  amount: number;  // total expense
  income: number;  // total income
}

export interface CategorySpend {
  name: string;
  amount: number;
  iconName: string;
  color: string;   // monochrome shade
}

export interface BudgetCategory {
  name: string;
  spent: number;
  limit: number;
  iconName: string;
}

// ── Formatter ─────────────────────────────────────────────────────────────────
// Indian digit grouping: 1,24,580.50
export function formatIndian(value: number | string | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || value === '') {
    return decimals > 0 ? '₹0.00' : '₹0';
  }
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num) || !isFinite(num)) {
    return decimals > 0 ? '₹0.00' : '₹0';
  }

  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const fixed = absNum.toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');

  let result = '';
  const len = intPart.length;
  if (len <= 3) {
    result = intPart;
  } else {
    const last3 = intPart.slice(-3);
    const rest = intPart.slice(0, -3);
    const groups: string[] = [];
    for (let i = rest.length; i > 0; i -= 2) {
      groups.unshift(rest.slice(Math.max(0, i - 2), i));
    }
    result = [...groups, last3].join(',');
  }

  const formatted = decimals > 0 && decPart !== undefined ? `₹${result}.${decPart}` : `₹${result}`;
  return isNegative ? `−${formatted}` : formatted;
}

// ── Dashboard Data ─────────────────────────────────────────────────────────────

export const MOCK_BALANCE = 124580.50;
export const MOCK_SAFE_TO_SPEND = 640;
export const MOCK_BUDGET_USED_PCT = 72;

// ── Transactions ──────────────────────────────────────────────────────────────

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-1',
    merchant: 'Swiggy',
    category: 'Food',
    method: 'UPI',
    amount: 480.00,
    type: 'expense',
    date: new Date().toISOString(),
    iconName: 'fast-food-outline',
  },
  {
    id: 'txn-2',
    merchant: 'Uber',
    category: 'Transport',
    method: 'Card',
    amount: 212.00,
    type: 'expense',
    date: new Date().toISOString(),
    iconName: 'car-outline',
  },
  {
    id: 'txn-3',
    merchant: 'Netflix',
    category: 'Subscriptions',
    method: 'Auto-pay',
    amount: 649.00,
    type: 'expense',
    date: new Date().toISOString(),
    iconName: 'tv-outline',
  },
  {
    id: 'txn-4',
    merchant: 'Salary',
    category: 'Income',
    method: 'HDFC',
    amount: 85000.00,
    type: 'income',
    date: new Date().toISOString(),
    iconName: 'wallet-outline',
  },
  {
    id: 'txn-5',
    merchant: 'Amazon',
    category: 'Shopping',
    method: 'Card',
    amount: 1299.00,
    type: 'expense',
    date: new Date().toISOString(),
    iconName: 'bag-handle-outline',
  },
];

// ── Insights / Budget Health ──────────────────────────────────────────────────

export const MOCK_INSIGHTS: InsightItem[] = [
  {
    id: 'ins-1',
    title: 'Overspent categories',
    subtitle: 'Review your budgets',
    badgeCount: 2,
    iconName: 'alert-circle-outline',
  },
  {
    id: 'ins-2',
    title: 'Recurring subscriptions',
    subtitle: 'Find duplicates and unused',
    badgeCount: 5,
    iconName: 'repeat-outline',
  },
  {
    id: 'ins-3',
    title: 'Uncategorized',
    subtitle: 'Categorize in one tap',
    badgeCount: 8,
    iconName: 'help-circle-outline',
  },
  {
    id: 'ins-4',
    title: 'Unlinked accounts',
    subtitle: 'Add accounts for the full picture',
    badgeCount: undefined,
    iconName: 'link-outline',
  },
  {
    id: 'ins-5',
    title: 'Excluded from tracking',
    subtitle: 'Manage hidden transactions',
    badgeCount: undefined,
    iconName: 'eye-off-outline',
  },
];

// ── Accounts ──────────────────────────────────────────────────────────────────

export const MOCK_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    name: 'HDFC Savings',
    institution: 'HDFC Bank',
    last4: '4821',
    balance: 84320.50,
    type: 'savings',
    iconName: 'business-outline',
  },
  {
    id: 'acc-2',
    name: 'SBI Current',
    institution: 'State Bank of India',
    last4: '7743',
    balance: 32100.00,
    type: 'current',
    iconName: 'business-outline',
  },
  {
    id: 'acc-3',
    name: 'ICICI Credit',
    institution: 'ICICI Bank',
    last4: '9912',
    balance: -8160.00,
    type: 'credit',
    iconName: 'card-outline',
  },
  {
    id: 'acc-4',
    name: 'Paytm Wallet',
    institution: 'Paytm',
    last4: '',
    balance: 320.00,
    type: 'wallet',
    iconName: 'phone-portrait-outline',
  },
];

// ── Analytics ─────────────────────────────────────────────────────────────────

export const MOCK_ANALYTICS_MONTHS: AnalyticsMonth[] = [
  { label: 'Apr', amount: 14200, income: 85000 },
  { label: 'May', amount: 18500, income: 85000 },
  { label: 'Jun', amount: 12800, income: 92000 },
  { label: 'Jul', amount: 21000, income: 85000 },
  { label: 'Aug', amount: 16400, income: 95000 },
  { label: 'Sep', amount: 11250, income: 85000 },
];

export const MOCK_ANALYTICS_CURRENT_MONTH = 'Sep';

// Per-month category breakdown (for the selected month card)
export const MOCK_CATEGORY_BREAKDOWN: Record<string, CategorySpend[]> = {
  Apr: [
    { name: 'Food & Dining',  amount: 4200,  iconName: 'fast-food-outline',    color: '#FAFAFB' },
    { name: 'Transport',      amount: 2100,  iconName: 'car-outline',           color: '#A0A0A5' },
    { name: 'Shopping',       amount: 5200,  iconName: 'bag-handle-outline',    color: '#6A6A6F' },
    { name: 'Entertainment',  amount: 1800,  iconName: 'tv-outline',            color: '#4A4A4F' },
    { name: 'Bills & Utilities', amount: 900, iconName: 'receipt-outline',      color: '#3A3A3E' },
  ],
  May: [
    { name: 'Food & Dining',  amount: 5800,  iconName: 'fast-food-outline',    color: '#FAFAFB' },
    { name: 'Shopping',       amount: 7200,  iconName: 'bag-handle-outline',    color: '#A0A0A5' },
    { name: 'Transport',      amount: 2400,  iconName: 'car-outline',           color: '#6A6A6F' },
    { name: 'Entertainment',  amount: 2100,  iconName: 'tv-outline',            color: '#4A4A4F' },
    { name: 'Bills & Utilities', amount: 1000, iconName: 'receipt-outline',    color: '#3A3A3E' },
  ],
  Jun: [
    { name: 'Food & Dining',  amount: 3900,  iconName: 'fast-food-outline',    color: '#FAFAFB' },
    { name: 'Transport',      amount: 2800,  iconName: 'car-outline',           color: '#A0A0A5' },
    { name: 'Health',         amount: 2200,  iconName: 'medkit-outline',        color: '#6A6A6F' },
    { name: 'Bills & Utilities', amount: 2400, iconName: 'receipt-outline',    color: '#4A4A4F' },
    { name: 'Entertainment',  amount: 1500,  iconName: 'tv-outline',            color: '#3A3A3E' },
  ],
  Jul: [
    { name: 'Shopping',       amount: 8200,  iconName: 'bag-handle-outline',    color: '#FAFAFB' },
    { name: 'Food & Dining',  amount: 5600,  iconName: 'fast-food-outline',    color: '#A0A0A5' },
    { name: 'Transport',      amount: 3200,  iconName: 'car-outline',           color: '#6A6A6F' },
    { name: 'Entertainment',  amount: 2500,  iconName: 'tv-outline',            color: '#4A4A4F' },
    { name: 'Bills & Utilities', amount: 1500, iconName: 'receipt-outline',    color: '#3A3A3E' },
  ],
  Aug: [
    { name: 'Food & Dining',  amount: 5200,  iconName: 'fast-food-outline',    color: '#FAFAFB' },
    { name: 'Transport',      amount: 4100,  iconName: 'car-outline',           color: '#A0A0A5' },
    { name: 'Shopping',       amount: 3800,  iconName: 'bag-handle-outline',    color: '#6A6A6F' },
    { name: 'Bills & Utilities', amount: 2200, iconName: 'receipt-outline',    color: '#4A4A4F' },
    { name: 'Health',         amount: 1100,  iconName: 'medkit-outline',        color: '#3A3A3E' },
  ],
  Sep: [
    { name: 'Food & Dining',  amount: 4250,  iconName: 'fast-food-outline',    color: '#FAFAFB' },
    { name: 'Transport',      amount: 1800,  iconName: 'car-outline',           color: '#A0A0A5' },
    { name: 'Shopping',       amount: 3000,  iconName: 'bag-handle-outline',    color: '#6A6A6F' },
    { name: 'Entertainment',  amount: 1200,  iconName: 'tv-outline',            color: '#4A4A4F' },
    { name: 'Bills & Utilities', amount: 1000, iconName: 'receipt-outline',    color: '#3A3A3E' },
  ],
};

// Weekly spend trend (last 7 days relative amounts)
export const MOCK_WEEKLY_TREND = [
  { day: 'Mon', amount: 480  },
  { day: 'Tue', amount: 1200 },
  { day: 'Wed', amount: 320  },
  { day: 'Thu', amount: 850  },
  { day: 'Fri', amount: 2100 },
  { day: 'Sat', amount: 3400 },
  { day: 'Sun', amount: 1100 },
];

// ── Category Chips (Add Transaction) ─────────────────────────────────────────

export const MOCK_CATEGORIES = [
  { id: 'cat-1', label: 'Food',          iconName: 'fast-food-outline' },
  { id: 'cat-2', label: 'Transport',     iconName: 'car-outline' },
  { id: 'cat-3', label: 'Shopping',      iconName: 'bag-handle-outline' },
  { id: 'cat-4', label: 'Entertainment', iconName: 'tv-outline' },
  { id: 'cat-5', label: 'Health',        iconName: 'medkit-outline' },
  { id: 'cat-6', label: 'Bills',         iconName: 'receipt-outline' },
  { id: 'cat-7', label: 'Income',        iconName: 'wallet-outline' },
  { id: 'cat-8', label: 'Other',         iconName: 'ellipsis-horizontal-outline' },
] as const;

export function addMockTransaction(data: {
  merchant: string;
  category: string;
  amount: number;
  type: TransactionType;
  iconName: string;
}): Transaction {
  const newTxn: Transaction = {
    id: `txn-${Date.now()}`,
    merchant: data.merchant,
    category: data.category,
    method: 'UPI',
    amount: data.amount,
    type: data.type,
    date: new Date().toISOString(),
    iconName: data.iconName,
  };
  MOCK_TRANSACTIONS.unshift(newTxn);
  return newTxn;
}

// ── Budget Categories (Matches 2 Overspent Categories in Screen C) ─────────────

export interface MockBudgetCategory {
  id: string;
  name: string;
  category: string;
  spent: number;
  limit: number;
  iconName: string;
  isOverspent: boolean;
}

export const MOCK_BUDGET_ITEMS: MockBudgetCategory[] = [
  {
    id: 'mb-1',
    name: 'Dining & Food',
    category: 'Food',
    spent: 9800,
    limit: 8000,
    iconName: 'fast-food-outline',
    isOverspent: true,
  },
  {
    id: 'mb-2',
    name: 'Shopping & Retail',
    category: 'Shopping',
    spent: 6500,
    limit: 6000,
    iconName: 'bag-handle-outline',
    isOverspent: true,
  },
  {
    id: 'mb-3',
    name: 'Groceries & Household',
    category: 'Groceries',
    spent: 4500,
    limit: 6000,
    iconName: 'cart-outline',
    isOverspent: false,
  },
  {
    id: 'mb-4',
    name: 'Transport & Commute',
    category: 'Transport',
    spent: 2200,
    limit: 4000,
    iconName: 'car-outline',
    isOverspent: false,
  },
  {
    id: 'mb-5',
    name: 'Entertainment & Fun',
    category: 'Entertainment',
    spent: 1800,
    limit: 3000,
    iconName: 'tv-outline',
    isOverspent: false,
  },
];

// ── Recurring Subscriptions (Matches 5 Subscriptions in Screen C) ──────────────

export interface MockRecurringItem {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  nextDate: string;
  category: string;
  iconName: string;
  daysUntil: number;
}

export const MOCK_RECURRING_ITEMS: MockRecurringItem[] = [
  {
    id: 'rec-1',
    name: 'Netflix Premium',
    amount: 649,
    frequency: 'monthly',
    nextDate: '2026-09-21',
    category: 'Entertainment',
    iconName: 'tv-outline',
    daysUntil: 3,
  },
  {
    id: 'rec-2',
    name: 'Spotify Family',
    amount: 179,
    frequency: 'monthly',
    nextDate: '2026-09-26',
    category: 'Entertainment',
    iconName: 'musical-notes-outline',
    daysUntil: 8,
  },
  {
    id: 'rec-3',
    name: 'Amazon Prime',
    amount: 149,
    frequency: 'monthly',
    nextDate: '2026-09-30',
    category: 'Shopping',
    iconName: 'bag-handle-outline',
    daysUntil: 12,
  },
  {
    id: 'rec-4',
    name: 'Gold\'s Gym Membership',
    amount: 1500,
    frequency: 'monthly',
    nextDate: '2026-10-03',
    category: 'Health',
    iconName: 'barbell-outline',
    daysUntil: 15,
  },
  {
    id: 'rec-5',
    name: 'iCloud+ 200GB',
    amount: 219,
    frequency: 'monthly',
    nextDate: '2026-10-10',
    category: 'Bills',
    iconName: 'cloud-outline',
    daysUntil: 22,
  },
];

// ── Savings Goals ─────────────────────────────────────────────────────────────

export interface MockSavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  iconName: string;
}

export const MOCK_SAVINGS_GOALS: MockSavingsGoal[] = [
  {
    id: 'goal-1',
    name: 'Emergency Fund',
    targetAmount: 150000,
    currentAmount: 108000,
    targetDate: '2026-12-31',
    iconName: 'shield-checkmark-outline',
  },
  {
    id: 'goal-2',
    name: 'MacBook Pro M3 Max',
    targetAmount: 199000,
    currentAmount: 142000,
    targetDate: '2026-11-20',
    iconName: 'laptop-outline',
  },
  {
    id: 'goal-3',
    name: 'Tokyo Trip 2027',
    targetAmount: 220000,
    currentAmount: 75000,
    targetDate: '2027-04-15',
    iconName: 'airplane-outline',
  },
];


