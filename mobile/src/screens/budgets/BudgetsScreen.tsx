import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Gradients, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { api } from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { Budget } from '../../types';
import { formatCurrency } from '../../utils/formatting';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { MOCK_BUDGET_ITEMS, MockBudgetCategory, formatIndian } from '../../data/mockData';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const BudgetsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [mockItems, setMockItems] = useState<MockBudgetCategory[]>(MOCK_BUDGET_ITEMS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'overspent' | 'ontrack'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.get<Budget[]>(API_ENDPOINTS.budgets);
      if (Array.isArray(data) && data.length > 0) {
        setBudgets(data);
      }
    } catch {
      // Offline fallback: keep mockItems
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  };

  // Compute totals from mockItems if no API budgets
  const totalBudget = budgets.length > 0
    ? budgets.reduce((s, b) => s + (Number(b?.total_amount) || 0), 0)
    : mockItems.reduce((s, b) => s + (Number(b?.limit) || 0), 0);

  const totalSpent = budgets.length > 0
    ? budgets.reduce((s, b) => s + (Number(b?.total_spent) || 0), 0)
    : mockItems.reduce((s, b) => s + (Number(b?.spent) || 0), 0);

  const totalRemaining = Math.max(totalBudget - totalSpent, 0);
  const overallPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const overallColor = overallPct >= 100 ? Colors.expense : overallPct >= 80 ? Colors.warning : Colors.income;

  const filteredItems = mockItems.filter(item => {
    if (activeFilter === 'overspent') return item.isOverspent;
    if (activeFilter === 'ontrack') return !item.isOverspent;
    return true;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgBase} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.canGoBack() && navigation.goBack()}
          activeOpacity={0.8}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={18} color={Colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, paddingHorizontal: Spacing.md }}>
          <Text style={styles.headerLabel}>PLANNING</Text>
          <Text style={styles.headerTitle}>Budgets</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('SavingsGoals' as any)}
            activeOpacity={0.8}
            accessibilityLabel="Savings Goals"
          >
            <Ionicons name="flag-outline" size={18} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('Recurring' as any)}
            activeOpacity={0.8}
            accessibilityLabel="Recurring Subscriptions"
          >
            <Ionicons name="repeat-outline" size={18} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Colors.textSecondary}
            colors={[Colors.textSecondary]}
          />
        }
      >
        {/* Monthly Summary Card */}
        <LinearGradient
          colors={Gradients.raised}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.summaryCard}
        >
          <View style={styles.topHighlight} />

          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryLabel}>Monthly Budget</Text>
              <Text style={styles.summaryTotal}>{formatIndian(totalBudget)}</Text>
            </View>
            <View
              style={[
                styles.summaryBadge,
                {
                  backgroundColor:
                    overallPct >= 100
                      ? Colors.expenseLight
                      : overallPct >= 80
                      ? Colors.warningLight
                      : Colors.incomeLight,
                  borderColor: overallColor,
                },
              ]}
            >
              <Text style={[styles.summaryBadgeText, { color: overallColor }]}>
                {overallPct.toFixed(0)}% used
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.bigBar}>
            <View
              style={[
                styles.bigBarFill,
                { width: `${overallPct}%` as any, backgroundColor: overallColor },
              ]}
            />
          </View>

          <View style={styles.summaryStats}>
            <View>
              <Text style={styles.summaryStatLabel}>Total Spent</Text>
              <Text style={[styles.summaryStatVal, { color: Colors.expense }]}>
                {formatIndian(totalSpent)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View>
              <Text style={styles.summaryStatLabel}>Remaining Safe</Text>
              <Text style={[styles.summaryStatVal, { color: Colors.income }]}>
                {formatIndian(Math.max(totalRemaining, 0))}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'all' && styles.filterPillActive]}
            onPress={() => setActiveFilter('all')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'all' && styles.filterPillTextActive,
              ]}
            >
              All ({mockItems.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'overspent' && styles.filterPillActive]}
            onPress={() => setActiveFilter('overspent')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'overspent' && styles.filterPillTextActive,
                { color: activeFilter === 'overspent' ? Colors.onSilver : Colors.expense },
              ]}
            >
              Overspent (2)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'ontrack' && styles.filterPillActive]}
            onPress={() => setActiveFilter('ontrack')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'ontrack' && styles.filterPillTextActive,
              ]}
            >
              On Track (3)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category budgets list */}
        <View style={styles.budgetsList}>
          <Text style={styles.sectionTitle}>Category Budgets</Text>

          {filteredItems.map(item => {
            const pct = Math.min((item.spent / item.limit) * 100, 100);
            const isOver = item.spent > item.limit;
            const remaining = item.limit - item.spent;
            const barColor = isOver ? Colors.expense : pct >= 80 ? Colors.warning : Colors.income;

            return (
              <LinearGradient
                key={item.id}
                colors={Gradients.raised}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.budgetCard}
              >
                <View style={styles.topHighlight} />

                <View style={styles.budgetCardTop}>
                  <View style={styles.budgetLeft}>
                    <View
                      style={[
                        styles.budgetIconWrap,
                        { backgroundColor: isOver ? Colors.expenseLight : Colors.surfaceAlt },
                      ]}
                    >
                      <Ionicons
                        name={item.iconName as any}
                        size={20}
                        color={isOver ? Colors.expense : Colors.textSecondary}
                      />
                    </View>
                    <View>
                      <Text style={styles.budgetName}>{item.name}</Text>
                      <Text style={styles.budgetMeta}>Monthly limit · {item.category}</Text>
                    </View>
                  </View>

                  {isOver ? (
                    <View style={styles.overspentBadge}>
                      <Ionicons name="warning-outline" size={12} color={Colors.expense} />
                      <Text style={styles.overspentBadgeText}>Overspent</Text>
                    </View>
                  ) : (
                    <Text style={styles.pctText}>{pct.toFixed(0)}%</Text>
                  )}
                </View>

                {/* Bar */}
                <View style={styles.budgetBarBg}>
                  <View style={[styles.budgetBarFill, { width: `${pct}%` as any, backgroundColor: barColor }]} />
                </View>

                {/* Bottom line */}
                <View style={styles.budgetCardBottom}>
                  <Text style={styles.budgetSpent}>{formatIndian(item.spent)}</Text>
                  <Text style={styles.budgetOf}>of {formatIndian(item.limit)}</Text>
                  {isOver ? (
                    <Text style={[styles.budgetRemain, { color: Colors.expense }]}>
                      +₹{(item.spent - item.limit).toLocaleString('en-IN')} over
                    </Text>
                  ) : (
                    <Text style={[styles.budgetRemain, { color: Colors.income }]}>
                      ₹{remaining.toLocaleString('en-IN')} left
                    </Text>
                  )}
                </View>
              </LinearGradient>
            );
          })}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Silver FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateBudget' as any)}
        activeOpacity={0.85}
        accessibilityLabel="Create new budget"
        accessibilityRole="button"
      >
        <LinearGradient
          colors={Gradients.silver}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.fabInner}
        >
          <Ionicons name="add" size={26} color={Colors.onSilver} />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgBase },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  headerLabel: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontWeight: Typography.bold,
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: Typography.bold,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    gap: Spacing.base,
  },

  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.highlightTop,
  },

  // Summary card
  summaryCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.md,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  summaryLabel: { fontSize: Typography.xs, color: Colors.textSecondary, marginBottom: 4 },
  summaryTotal: {
    fontSize: 26,
    fontWeight: Typography.bold,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  summaryBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
  },
  summaryBadgeText: { fontSize: Typography.xs, fontWeight: Typography.bold },

  bigBar: {
    height: 8,
    backgroundColor: Colors.bgInset,
    borderRadius: 4,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bigBarFill: { height: '100%', borderRadius: 4 },

  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryStatLabel: { fontSize: Typography.xs, color: Colors.textMuted, marginBottom: 2 },
  summaryStatVal: { fontSize: Typography.sm, fontWeight: Typography.bold },
  summaryDivider: { width: 1, height: 28, backgroundColor: Colors.border },

  // Filters
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  filterPillText: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
  },
  filterPillTextActive: {
    color: Colors.onSilver,
    fontWeight: Typography.bold,
  },

  sectionTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  budgetsList: { gap: Spacing.md },

  budgetCard: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  budgetCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  budgetLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  budgetIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  budgetName: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.text },
  budgetMeta: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 1 },

  overspentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.expenseLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  overspentBadgeText: {
    fontSize: Typography.xs,
    color: Colors.expense,
    fontWeight: Typography.bold,
  },
  pctText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.semibold,
  },

  budgetBarBg: {
    height: 6,
    backgroundColor: Colors.bgInset,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  budgetBarFill: { height: '100%', borderRadius: 3 },

  budgetCardBottom: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  budgetSpent: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.text },
  budgetOf: { fontSize: Typography.xs, color: Colors.textMuted, flex: 1 },
  budgetRemain: { fontSize: Typography.xs, fontWeight: Typography.semibold },

  fab: {
    position: 'absolute',
    bottom: 90,
    right: Spacing.lg,
    borderRadius: Radius.full,
    ...Shadow.lg,
  },
  fabInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
