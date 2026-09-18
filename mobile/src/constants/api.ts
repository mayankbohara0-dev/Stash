// API base URL - uses local network IP so physical devices can connect
// Change this if your PC's IP changes (run ipconfig to check)
export const API_BASE_URL = 'http://14.28.52.123:8000';

export const API_ENDPOINTS = {
  // Auth
  register: '/auth/register',
  login: '/auth/login',
  refresh: '/auth/refresh',
  changePassword: '/auth/change-password',
  me: '/auth/me',

  // Transactions
  transactions: '/transactions',
  transaction: (id: string) => `/transactions/${id}`,

  // Budgets
  budgets: '/budgets',
  budget: (id: string) => `/budgets/${id}`,

  // Goals
  goals: '/goals',
  goal: (id: string) => `/goals/${id}`,

  // Recurring
  recurring: '/recurring',
  recurringItem: (id: string) => `/recurring/${id}`,

  // Dashboard
  dashboard: '/dashboard',

  // Insights
  insights: '/insights',
  categories: '/insights/categories',

  // AI
  aiChat: '/ai/chat',
  aiConversations: '/ai/conversations',

  // Profile
  profile: '/profile',
  profilePreferences: '/profile/preferences',
  exportCsv: '/profile/export/csv',
  deleteAccount: '/profile/account',
} as const;

export const CURRENCY_SYMBOL = '₹';

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'upi', label: 'UPI', icon: '📲' },
  { value: 'credit_card', label: 'Credit Card', icon: '💳' },
  { value: 'debit_card', label: 'Debit Card', icon: '🏧' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'other', label: 'Other', icon: '💰' },
] as const;

export const CURRENCIES = [
  { value: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
] as const;
