// Formatting utilities

export const formatCurrency = (amount: number, currency = 'INR'): string => {
  const absAmount = Math.abs(amount);
  if (currency === 'INR') {
    if (absAmount >= 10000000) {
      return `₹${(absAmount / 10000000).toFixed(2)}Cr`;
    }
    if (absAmount >= 100000) {
      return `₹${(absAmount / 100000).toFixed(2)}L`;
    }
    if (absAmount >= 1000) {
      return `₹${absAmount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `₹${absAmount.toFixed(0)}`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(absAmount);
};

export const formatCurrencyFull = (amount: number, currency = 'INR'): string => {
  return `₹${Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const txDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (txDate.getTime() === today.getTime()) return 'Today';
  if (txDate.getTime() === yesterday.getTime()) return 'Yesterday';

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

export const formatDateFull = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const formatMonthYear = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const formatDaysUntil = (days: number): string => {
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days < 0) return 'Overdue';
  return `Due in ${days} days`;
};

export const getPaymentMethodLabel = (method?: string): string => {
  const methods: Record<string, string> = {
    cash: 'Cash',
    upi: 'UPI',
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    bank_transfer: 'Bank Transfer',
    other: 'Other',
  };
  return methods[method || ''] || method || '';
};
