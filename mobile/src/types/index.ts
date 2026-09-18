// TypeScript type definitions

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  monthly_income: number;
  monthly_essential_expenses: number;
  currency: string;
  savings_target: number;
  onboarding_completed: boolean;
  financial_goals: string[];
}

export interface UserPreferences {
  theme: 'system' | 'light' | 'dark';
  currency: string;
  notifications_budget: boolean;
  notifications_recurring: boolean;
  notifications_weekly_summary: boolean;
  notifications_savings: boolean;
  ai_personalization: boolean;
  budget_alert_thresholds: number[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
  is_default: boolean;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category_id?: string;
  category?: Category;
  title: string;
  date: string;
  payment_method?: string;
  notes?: string;
  receipt_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface BudgetCategory {
  id: string;
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  amount: number;
  spent: number;
  remaining: number;
  percentage_used: number;
  status: 'safe' | 'approaching' | 'over';
}

export interface Budget {
  id: string;
  name: string;
  total_amount: number;
  period: string;
  start_date: string;
  end_date?: string;
  is_recurring: boolean;
  is_active: boolean;
  total_spent: number;
  remaining: number;
  percentage_used: number;
  categories: BudgetCategory[];
  created_at: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  icon: string;
  target_amount: number;
  current_amount: number;
  monthly_contribution: number;
  target_date?: string;
  notes?: string;
  is_completed: boolean;
  progress_percentage: number;
  remaining_amount: number;
  created_at: string;
}

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  next_payment_date: string;
  category_id?: string;
  category_name?: string;
  category_icon?: string;
  notes?: string;
  is_active: boolean;
  days_until_due: number;
  created_at: string;
}

export interface CategorySpending {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  amount: number;
  percentage: number;
}

export interface MonthlyTrend {
  year: number;
  month: number;
  month_name: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface FinancialInsight {
  type: string;
  text: string;
  value: number;
  positive: boolean;
}

export interface FinancialHealth {
  score: number;
  components: {
    savings_rate: number;
    budget_adherence: number;
    goals: number;
    stability: number;
  };
  explanation: string;
}

export interface DashboardData {
  user_name: string;
  current_month: string;
  current_date: string;
  total_balance: number;
  monthly_income: number;
  monthly_expenses: number;
  monthly_savings: number;
  savings_rate: number;
  month_comparison: {
    income_change?: number;
    expense_change?: number;
    has_previous_data: boolean;
  };
  category_spending: CategorySpending[];
  spending_trends: MonthlyTrend[];
  average_daily_spending: number;
  largest_expenses: Array<{ title: string; amount: number; category: string; date: string }>;
  budget_summary: any[];
  savings_goals: any[];
  upcoming_recurring: any[];
  recent_transactions: any[];
  financial_insights: FinancialInsight[];
  financial_health: FinancialHealth;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    full_name: string;
  };
}
