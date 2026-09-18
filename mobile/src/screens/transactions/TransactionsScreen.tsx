import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, RefreshControl, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { EmptyState } from '../../components/common/EmptyState';
import { TransactionSkeleton } from '../../components/common/LoadingSkeleton';
import { useTransactions } from '../../hooks/useTransactions';
import { formatCurrency, formatDate } from '../../utils/formatting';
import { Transaction } from '../../types';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Filter = 'all' | 'income' | 'expense';

const CATEGORY_ICONS: Record<string, string> = {
  food: 'fast-food-outline',
  dining: 'restaurant-outline',
  travel: 'car-outline',
  transport: 'car-outline',
  vehicle: 'car-outline',
  shopping: 'bag-handle-outline',
  bills: 'receipt-outline',
  entertainment: 'film-outline',
  health: 'heart-outline',
  salary: 'briefcase-outline',
  income: 'arrow-down-circle-outline',
};

const getCategoryIcon = (name: string): any => {
  const lower = name?.toLowerCase() || '';
  for (const key of Object.keys(CATEGORY_ICONS)) {
    if (lower.includes(key)) return CATEGORY_ICONS[key];
  }
  return 'wallet-outline';
};

export const TransactionsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const { transactions, isLoading, hasMore, loadMore, refresh, total } = useTransactions({
    type: filter === 'all' ? undefined : filter,
    search,
    sort_by: 'date_desc',
  });

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  }, [refresh]);

  const getGroupHeader = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return 'TODAY';
    const y = new Date(now);
    y.setDate(now.getDate() - 1);
    if (d.toDateString() === y.toDateString()) return 'YESTERDAY';
    return d.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();
  };

  const renderTransaction = useCallback(({ item, index }: { item: Transaction; index: number }) => {
    const prevItem = index > 0 ? transactions[index - 1] : null;
    const currentGroup = getGroupHeader(item.date);
    const prevGroup = prevItem ? getGroupHeader(prevItem.date) : null;
    const showHeader = currentGroup !== prevGroup;
    const isIncome = item.type === 'income';
    const icon = getCategoryIcon(item.category?.name || '');

    return (
      <View>
        {showHeader && (
          <View style={styles.groupHeader}>
            <Text style={styles.groupHeaderText}>{currentGroup}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.txnRow}
          onPress={() => navigation.navigate('TransactionDetail', { transactionId: item.id, iconName: icon })}
          activeOpacity={0.7}
        >
          <View style={[styles.txnIconWrap, { backgroundColor: isIncome ? Colors.incomeLight : Colors.surfaceAlt }]}>
            <Ionicons name={icon as any} size={18} color={isIncome ? Colors.income : Colors.textSecondary} />
          </View>
          <View style={styles.txnMeta}>
            <Text style={styles.txnTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.txnSubtitle}>{item.category?.name || 'General'}</Text>
          </View>
          <View style={styles.txnRight}>
            <Text style={[styles.txnAmount, { color: isIncome ? Colors.income : Colors.text }]}>
              {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
            </Text>
            <Text style={styles.txnDate}>{formatDate(item.date)}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }, [transactions, navigation]);

  if (isLoading && transactions.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transactions</Text>
        </View>
        <TransactionSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate('Home' as any);
          }}
          activeOpacity={0.8}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: Spacing.sm }}>
          <Text style={styles.headerLabel}>HISTORY</Text>
          <Text style={styles.headerTitle}>Transactions</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddTransaction' as any, {})}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#0A0A0B" />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, searchFocused && styles.searchBarFocused]}>
          <Ionicons name="search-outline" size={17} color={Colors.textSecondary} style={{ marginRight: Spacing.sm }} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search transactions..."
            placeholderTextColor={Colors.textMuted}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {(['all', 'income', 'expense'] as Filter[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.75}
          >
            {filter === f && f !== 'all' && (
              <View style={[styles.filterDot, { backgroundColor: f === 'income' ? Colors.income : Colors.expense }]} />
            )}
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f === 'all' ? 'All' : f === 'income' ? 'Income' : 'Expenses'}
            </Text>
          </TouchableOpacity>
        ))}
        {total > 0 && (
          <View style={styles.totalPill}>
            <Text style={styles.totalText}>{total} total</Text>
          </View>
        )}
      </View>

      {/* List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.textSecondary} colors={[Colors.textSecondary]} />
        }
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <EmptyState
            emoji="💳"
            title="No transactions yet"
            subtitle="Add your first transaction to start tracking your spending."
            actionLabel="Add Transaction"
            onAction={() => navigation.navigate('AddTransaction', {})}
          />
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddTransaction', {})}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={24} color={Colors.onSilver} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.base,
  },
  headerLabel: { fontSize: Typography.xs, color: Colors.textMuted, fontWeight: Typography.bold, letterSpacing: 1, marginBottom: 2 },
  headerTitle: { fontSize: Typography['3xl'], fontWeight: Typography.extrabold, color: Colors.text, letterSpacing: -0.5 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FAFAFB',
    alignItems: 'center', justifyContent: 'center',
  },

  searchSection: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.full,
    paddingHorizontal: Spacing.base, height: 46,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchBarFocused: { borderColor: Colors.borderAlt },
  searchInput: { flex: 1, fontSize: Typography.base, color: Colors.text },

  filterRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, marginBottom: Spacing.base,
  },
  filterTab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.base, height: 34, borderRadius: Radius.full,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  filterTabActive: { backgroundColor: Colors.surfaceAlt, borderColor: Colors.borderAlt },
  filterDot: { width: 6, height: 6, borderRadius: 3 },
  filterTabText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  filterTabTextActive: { color: Colors.text, fontWeight: Typography.bold },
  totalPill: { marginLeft: 'auto', paddingHorizontal: Spacing.sm, paddingVertical: 4, backgroundColor: Colors.surface, borderRadius: Radius.full },
  totalText: { fontSize: Typography.xs, color: Colors.textMuted },

  listContent: { paddingHorizontal: Spacing.xl },

  groupHeader: { paddingVertical: Spacing.md, paddingTop: Spacing.lg },
  groupHeaderText: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.textMuted, letterSpacing: 1.2 },

  txnRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  txnIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  txnMeta: { flex: 1 },
  txnTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.text, marginBottom: 2 },
  txnSubtitle: { fontSize: Typography.sm, color: Colors.textMuted },
  txnRight: { alignItems: 'flex-end' },
  txnAmount: { fontSize: Typography.base, fontWeight: Typography.bold },
  txnDate: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },

  fab: {
    position: 'absolute', bottom: 100, right: Spacing.xl,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.silverTop,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 14, elevation: 10,
    borderWidth: 1, borderColor: Colors.borderAlt,
  },
});
