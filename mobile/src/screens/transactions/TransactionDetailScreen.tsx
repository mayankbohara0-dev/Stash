import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { api } from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { Transaction } from '../../types';
import { formatCurrency, formatDateFull, formatTime, getPaymentMethodLabel } from '../../utils/formatting';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { MOCK_TRANSACTIONS } from '../../data/mockData';

type Route = RouteProp<RootStackParamList, 'TransactionDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const resolveCategoryIcon = (
  paramIcon?: string,
  categoryIcon?: string,
  categoryName?: string,
  title?: string
): any => {
  if (paramIcon && paramIcon.endsWith('-outline')) return paramIcon;
  if (categoryIcon && categoryIcon.endsWith('-outline')) return categoryIcon;

  const target = `${categoryName || ''} ${title || ''}`.toLowerCase();
  if (target.includes('food') || target.includes('swiggy') || target.includes('zomato') || target.includes('dining') || target.includes('cafe') || target.includes('burger')) {
    return 'fast-food-outline';
  }
  if (target.includes('transport') || target.includes('travel') || target.includes('car') || target.includes('uber') || target.includes('ola') || target.includes('vehic') || target.includes('ride') || target.includes('fuel')) {
    return 'car-outline';
  }
  if (target.includes('subscript') || target.includes('netflix') || target.includes('spotify') || target.includes('prime') || target.includes('tv') || target.includes('stream')) {
    return 'tv-outline';
  }
  if (target.includes('shop') || target.includes('amazon') || target.includes('flipkart') || target.includes('myntra') || target.includes('store') || target.includes('bag')) {
    return 'bag-handle-outline';
  }
  if (target.includes('salary') || target.includes('income') || target.includes('freelance') || target.includes('earning')) {
    return 'wallet-outline';
  }
  if (target.includes('bill') || target.includes('electric') || target.includes('water') || target.includes('utility') || target.includes('recharge') || target.includes('wifi')) {
    return 'receipt-outline';
  }
  if (target.includes('entertain') || target.includes('movie') || target.includes('cinema')) {
    return 'film-outline';
  }
  if (target.includes('health') || target.includes('med') || target.includes('doctor') || target.includes('gym')) {
    return 'heart-outline';
  }
  if (target.includes('educat') || target.includes('book') || target.includes('tuition')) {
    return 'book-outline';
  }
  return 'receipt-outline';
};

export const TransactionDetailScreen: React.FC = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadTransaction();
  }, [route.params.transactionId]);

  const loadTransaction = async () => {
    // Check mock transactions first
    const mock = MOCK_TRANSACTIONS.find(t => t.id === route.params.transactionId);
    if (mock) {
      setTransaction({
        id: mock.id,
        user_id: 'mock-user',
        amount: mock.amount,
        type: mock.type,
        category: { id: 'cat-1', name: mock.category, icon: mock.iconName, color: Colors.primary },
        date: mock.date,
        description: mock.merchant,
        title: mock.merchant,
        payment_method: mock.method,
        notes: `${mock.category} payment via ${mock.method}`,
        created_at: mock.date,
        updated_at: mock.date,
      } as any);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.get<Transaction>(API_ENDPOINTS.transaction(route.params.transactionId));
      setTransaction(data);
    } catch (err) {
      if (MOCK_TRANSACTIONS.length > 0) {
        const fallback = MOCK_TRANSACTIONS[0];
        setTransaction({
          id: fallback.id,
          user_id: 'mock-user',
          amount: fallback.amount,
          type: fallback.type,
          category: { id: 'cat-1', name: fallback.category, icon: fallback.iconName, color: Colors.primary },
          date: fallback.date,
          description: fallback.merchant,
          title: fallback.merchant,
          payment_method: fallback.method,
          notes: `${fallback.category} payment via ${fallback.method}`,
          created_at: fallback.date,
          updated_at: fallback.date,
        } as any);
      } else {
        navigation.goBack();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete transaction?',
      'Are you sure you want to permanently delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            const idx = MOCK_TRANSACTIONS.findIndex(t => t.id === route.params.transactionId);
            if (idx >= 0) {
              MOCK_TRANSACTIONS.splice(idx, 1);
            }
            try {
              await api.delete(API_ENDPOINTS.transaction(route.params.transactionId));
            } catch {
              // local deletion done
            }
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (isLoading || !transaction) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loading}>Loading details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isIncome = transaction.type === 'income';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.circleBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddTransaction', { transactionId: transaction.id })}
          style={styles.circleBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="pencil" size={18} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Amount Hero */}
        <View style={styles.heroCard}>
          <View style={[styles.categoryBadge, { backgroundColor: isIncome ? 'rgba(124,224,166,0.15)' : 'rgba(255,255,255,0.08)' }]}>
            <Ionicons
              name={resolveCategoryIcon(
                route.params.iconName,
                transaction.category?.icon,
                transaction.category?.name,
                transaction.title || (transaction as any).description
              )}
              size={32}
              color={isIncome ? Colors.income : Colors.text}
            />
          </View>
          <Text style={[styles.amount, { color: isIncome ? Colors.income : '#FFFFFF' }]}>
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
          </Text>
          <Text style={styles.categoryName}>{transaction.category?.name || 'Uncategorized'}</Text>
          <View style={[styles.typeBadge, { backgroundColor: isIncome ? 'rgba(48,209,88,0.15)' : 'rgba(255,69,58,0.15)' }]}>
            <Text style={[styles.typeBadgeText, { color: isIncome ? Colors.income : Colors.expense }]}>
              {isIncome ? 'INCOME' : 'EXPENSE'}
            </Text>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <DetailRow icon="document-text-outline" label="Title" value={transaction.title} />
          <DetailRow icon="calendar-outline" label="Date" value={formatDateFull(transaction.date)} />
          <DetailRow icon="time-outline" label="Time" value={formatTime(transaction.date)} />
          {transaction.payment_method && (
            <DetailRow icon="card-outline" label="Payment Method" value={getPaymentMethodLabel(transaction.payment_method)} />
          )}
          {transaction.notes && (
            <DetailRow icon="information-circle-outline" label="Notes" value={transaction.notes} isLast />
          )}
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDelete}
          disabled={isDeleting}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={18} color={Colors.expense} />
          <Text style={styles.deleteBtnText}>{isDeleting ? 'Deleting...' : 'Delete Transaction'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailRow = ({ icon, label, value, isLast }: { icon: any; label: string; value: string; isLast?: boolean }) => (
  <View style={[styles.detailRow, isLast && { borderBottomWidth: 0 }]}>
    <View style={styles.detailIcon}>
      <Ionicons name={icon} size={16} color={Colors.textSecondary} />
    </View>
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    color: Colors.textSecondary,
    fontSize: Typography.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.lg,
  },

  heroCard: {
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  amount: {
    fontSize: 38,
    fontWeight: Typography.extrabold,
    letterSpacing: -0.5,
  },
  categoryName: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  typeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginTop: Spacing.md,
  },
  typeBadgeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    letterSpacing: 1,
  },

  detailsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },

  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    borderRadius: Radius.full,
    paddingVertical: Spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.25)',
  },
  deleteBtnText: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.expense,
  },
});
