import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { API_ENDPOINTS } from '../constants/api';
import { Transaction, PaginatedTransactions } from '../types';
import { MOCK_TRANSACTIONS } from '../data/mockData';

interface UseTransactionsOptions {
  type?: 'income' | 'expense';
  category_id?: string;
  search?: string;
  sort_by?: string;
  start_date?: string;
  end_date?: string;
}

const fallbackMockList: Transaction[] = MOCK_TRANSACTIONS.map(m => ({
  id: m.id,
  user_id: 'user-1',
  amount: m.amount,
  type: m.type,
  category: { id: 'cat-1', name: m.category, icon: m.iconName, color: '#FAFAFB', type: m.type, is_default: true },
  date: m.date,
  description: `${m.category} · ${m.method}`,
  title: m.merchant,
  payment_method: m.method,
  notes: `${m.category} via ${m.method}`,
  created_at: m.date,
  updated_at: m.date,
}));

export const useTransactions = (options: UseTransactionsOptions = {}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const buildQuery = (pageNum: number) => {
    const params = new URLSearchParams();
    const opts = optionsRef.current;
    if (opts.type) params.set('type', opts.type);
    if (opts.category_id) params.set('category_id', opts.category_id);
    if (opts.search) params.set('search', opts.search);
    if (opts.sort_by) params.set('sort_by', opts.sort_by);
    if (opts.start_date) params.set('start_date', opts.start_date);
    if (opts.end_date) params.set('end_date', opts.end_date);
    params.set('page', String(pageNum));
    params.set('page_size', '20');
    return `${API_ENDPOINTS.transactions}?${params}`;
  };

  const load = useCallback(async (pageNum = 1, append = false) => {
    try {
      setError(null);
      if (!append) setIsLoading(true);

      const result = await api.get<PaginatedTransactions>(buildQuery(pageNum));
      if (result && Array.isArray(result.transactions) && result.transactions.length > 0) {
        setTransactions(prev => append ? [...prev, ...result.transactions] : result.transactions);
        setTotal(result.total);
        setTotalPages(result.total_pages);
      } else {
        setTransactions(fallbackMockList);
        setTotal(fallbackMockList.length);
        setTotalPages(1);
      }
      setPage(pageNum);
    } catch (err: any) {
      setError(err.message);
      setTransactions(fallbackMockList);
      setTotal(fallbackMockList.length);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    load(1, false);
  }, [options.type, options.search, options.sort_by, options.category_id, options.start_date, options.end_date]);

  const refresh = useCallback(() => load(1, false), [load]);

  const loadMore = useCallback(() => {
    if (page < totalPages) {
      load(page + 1, true);
    }
  }, [page, totalPages, load]);

  const deleteTransaction = useCallback(async (id: string) => {
    await api.delete(API_ENDPOINTS.transaction(id));
    setTransactions(prev => prev.filter(t => t.id !== id));
    setTotal(prev => prev - 1);
  }, []);

  return {
    transactions,
    isLoading,
    hasMore: page < totalPages,
    loadMore,
    refresh,
    total,
    error,
    deleteTransaction,
  };
};
