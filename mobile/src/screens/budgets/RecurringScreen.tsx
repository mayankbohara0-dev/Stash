import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl,
  StatusBar, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Gradients, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { api } from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { RecurringExpense } from '../../types';
import { formatCurrency } from '../../utils/formatting';
import { MOCK_RECURRING_ITEMS, MockRecurringItem, formatIndian } from '../../data/mockData';

export const RecurringScreen: React.FC = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState<MockRecurringItem[]>(MOCK_RECURRING_ITEMS);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Entertainment');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const recurringData = await api.get<RecurringExpense[]>(API_ENDPOINTS.recurring);
      if (Array.isArray(recurringData) && recurringData.length > 0) {
        setItems(
          recurringData.map(r => ({
            id: String(r.id),
            name: r.name || 'Subscription',
            amount: Number(r.amount) || 0,
            frequency: r.frequency || 'monthly',
            nextDate: r.next_payment_date ? r.next_payment_date.split('T')[0] : '2026-10-01',
            category: r.category_name || 'General',
            iconName: 'receipt-outline',
            daysUntil: Number(r.days_until_due) || 7,
          }))
        );
      }
    } catch {
      // Offline fallback: keep MOCK_RECURRING_ITEMS
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleCreateRecurring = async () => {
    const numAmount = parseFloat(amount);
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please specify a subscription name (e.g., Netflix, Gym).');
      return;
    }
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please provide a valid recurring cost.');
      return;
    }

    setIsSubmitting(true);
    const newItem: MockRecurringItem = {
      id: `rec-${Date.now()}`,
      name: name.trim(),
      amount: numAmount,
      frequency: 'monthly',
      nextDate: '2026-10-15',
      category: category,
      iconName: category === 'Entertainment' ? 'tv-outline' : category === 'Health' ? 'barbell-outline' : 'receipt-outline',
      daysUntil: 27,
    };
    setItems(prev => [newItem, ...prev]);
    setModalVisible(false);
    setName('');
    setAmount('');
    setIsSubmitting(false);
  };

  const monthlyTotal = items.reduce((sum, r) => sum + (Number(r?.amount) || 0), 0);

  const getDueColor = (days: number) => {
    if (days <= 3) return Colors.expense;
    if (days <= 7) return Colors.warning;
    return Colors.income;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgBase} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.circleBtn}
          activeOpacity={0.8}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={18} color={Colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, paddingHorizontal: Spacing.md }}>
          <Text style={styles.headerLabel}>SUBSCRIPTIONS</Text>
          <Text style={styles.title}>Recurring Bills</Text>
        </View>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={[styles.circleBtn, styles.addBtnHighlight]}
          activeOpacity={0.8}
          accessibilityLabel="Add subscription"
        >
          <Ionicons name="add" size={20} color={Colors.onSilver} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Colors.textSecondary}
            colors={[Colors.textSecondary]}
          />
        }
      >
        {/* Monthly Commitment Hero Card */}
        <LinearGradient
          colors={Gradients.raised}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.topHighlight} />

          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>MONTHLY SUBSCRIPTIONS</Text>
              <Text style={styles.heroAmount}>{formatIndian(monthlyTotal)}</Text>
            </View>
            <View style={styles.heroIconWrap}>
              <Ionicons name="repeat-outline" size={22} color={Colors.text} />
            </View>
          </View>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{items.length}</Text>
              <Text style={styles.heroStatLabel}>Active Subscriptions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, { color: Colors.warning }]}>
                {items.filter(i => i.daysUntil <= 7).length}
              </Text>
              <Text style={styles.heroStatLabel}>Due Within 7 Days</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Section Heading */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>ALL RECURRING BILLS</Text>
          <Text style={styles.sectionCount}>{items.length} Tracked</Text>
        </View>

        {/* List of Recurring Expenses */}
        <View style={styles.itemList}>
          {items.map(item => {
            const dueColor = getDueColor(item.daysUntil);
            return (
              <LinearGradient
                key={item.id}
                colors={Gradients.raised}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.itemCard}
              >
                <View style={styles.topHighlight} />

                <View style={styles.itemTopRow}>
                  <View style={styles.catIconWrap}>
                    <Ionicons name={item.iconName as any} size={20} color={Colors.text} />
                  </View>
                  <View style={styles.itemMainInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemCategory}>{item.category} · {item.frequency}</Text>
                  </View>
                  <View style={styles.itemAmountCol}>
                    <Text style={styles.itemAmount}>{formatIndian(item.amount)}</Text>
                    <Text style={styles.itemFrequency}>/mo</Text>
                  </View>
                </View>

                <View style={styles.itemDivider} />

                <View style={styles.itemBottomRow}>
                  <View style={[styles.dueBadge, { backgroundColor: `${dueColor}18` }]}>
                    <Ionicons name="time-outline" size={13} color={dueColor} />
                    <Text style={[styles.dueText, { color: dueColor }]}>
                      Due in {item.daysUntil} days · {item.nextDate}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert('Remove Subscription', `Delete ${item.name} from tracking?`, [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => setItems(prev => prev.filter(r => r.id !== item.id)),
                        },
                      ]);
                    }}
                    activeOpacity={0.7}
                    style={styles.deleteActionBtn}
                    accessibilityLabel="Delete subscription"
                  >
                    <Ionicons name="trash-outline" size={15} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            );
          })}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Add Subscription Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            style={{ width: '100%', maxWidth: 440 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <LinearGradient
              colors={Gradients.raised}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.modalSheet}
            >
              <View style={styles.topHighlight} />

              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Subscription</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={20} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Subscription Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Netflix, Spotify, Gym"
                  placeholderTextColor={Colors.textMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Monthly Amount (₹)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="649"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleCreateRecurring}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={Gradients.silver}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.saveBtnInner}
                >
                  <Text style={styles.saveBtnText}>Save Subscription</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
  title: {
    fontSize: 26,
    fontWeight: Typography.bold,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnHighlight: {
    backgroundColor: Colors.silverTop,
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

  heroCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.md,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  heroLabel: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  heroAmount: {
    fontSize: 28,
    fontWeight: Typography.bold,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  heroStat: { flex: 1 },
  heroStatValue: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.text },
  heroStatLabel: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 26, backgroundColor: Colors.border, marginHorizontal: Spacing.md },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  sectionCount: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },
  itemList: {
    gap: Spacing.md,
  },
  itemCard: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    gap: Spacing.md,
    ...Shadow.sm,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  catIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemMainInfo: { flex: 1 },
  itemName: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.text },
  itemCategory: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  itemAmountCol: { alignItems: 'flex-end' },
  itemAmount: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.text },
  itemFrequency: { fontSize: Typography.xs, color: Colors.textMuted },
  itemDivider: { height: 1, backgroundColor: Colors.border },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  dueText: { fontSize: Typography.xs, fontWeight: Typography.medium },
  deleteActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceAlt,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalSheet: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  modalTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.text },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: Typography.medium },
  textInput: {
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgInset,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    color: Colors.text,
    fontSize: Typography.base,
  },
  saveBtn: {
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  saveBtnInner: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  saveBtnText: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.onSilver,
  },
});
