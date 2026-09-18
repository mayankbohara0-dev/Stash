import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform, StatusBar, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { api } from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { Category } from '../../types';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PRESET_AMOUNTS = [10000, 25000, 50000, 100000];
const PERIODS = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'yearly', label: 'Yearly' },
];

export const CreateBudgetScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [name, setName] = useState('Monthly Budget');
  const [totalAmount, setTotalAmount] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRecurring, setIsRecurring] = useState(true);

  const DEFAULT_CATEGORIES: Category[] = [
    { id: 'cat-1', name: 'Food & Dining', icon: 'fast-food-outline', color: '#FAFAFB', type: 'expense', is_default: true },
    { id: 'cat-2', name: 'Transport', icon: 'car-outline', color: '#FAFAFB', type: 'expense', is_default: true },
    { id: 'cat-3', name: 'Shopping', icon: 'bag-handle-outline', color: '#FAFAFB', type: 'expense', is_default: true },
    { id: 'cat-4', name: 'Entertainment', icon: 'tv-outline', color: '#FAFAFB', type: 'expense', is_default: true },
    { id: 'cat-5', name: 'Bills & Utilities', icon: 'receipt-outline', color: '#FAFAFB', type: 'expense', is_default: true },
    { id: 'cat-6', name: 'Health', icon: 'medkit-outline', color: '#FAFAFB', type: 'expense', is_default: true },
  ];

  useEffect(() => {
    api.get<Category[]>(API_ENDPOINTS.categories)
      .then(cats => {
        const expenseCats = cats.filter(c => c.type === 'expense');
        setCategories(expenseCats.length > 0 ? expenseCats : DEFAULT_CATEGORIES);
      })
      .catch(() => {
        setCategories(DEFAULT_CATEGORIES);
      });
  }, []);

  const handleSave = async () => {
    const numAmount = parseFloat(totalAmount);
    if (!totalAmount || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please specify a valid total budget limit.');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please provide a name for this budget.');
      return;
    }

    setIsLoading(true);
    const categoryEntries = Object.entries(categoryBudgets)
      .filter(([_, v]) => v && parseFloat(v) > 0)
      .map(([category_id, amount]) => ({ category_id, amount: parseFloat(amount) }));

    try {
      await api.post(API_ENDPOINTS.budgets, {
        name: name.trim(),
        total_amount: numAmount,
        period,
        start_date: new Date(startDate).toISOString(),
        is_recurring: isRecurring,
        categories: categoryEntries,
      });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create budget');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn} activeOpacity={0.8}>
          <Ionicons name="close" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Budget</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Amount Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroLabel}>TARGET BUDGET LIMIT</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={totalAmount}
                onChangeText={setTotalAmount}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                autoFocus
              />
            </View>

            {/* Quick preset chips */}
            <View style={styles.presetRow}>
              {PRESET_AMOUNTS.map(preset => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetChip,
                    totalAmount === preset.toString() && styles.presetChipActive,
                  ]}
                  onPress={() => setTotalAmount(preset.toString())}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.presetText,
                      totalAmount === preset.toString() && styles.presetTextActive,
                    ]}
                  >
                    ₹{(preset / 1000).toFixed(0)}k
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Period Selector Segmented Pill */}
          <View style={styles.periodCard}>
            <Text style={styles.sectionLabel}>BUDGET CYCLE</Text>
            <View style={styles.periodSelector}>
              {PERIODS.map(p => {
                const active = period === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.periodTab, active && styles.periodTabActive]}
                    onPress={() => setPeriod(p.id as any)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.periodTabText, active && styles.periodTabTextActive]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Budget Details Form */}
          <View style={styles.formCard}>
            <Text style={styles.sectionLabel}>DETAILS</Text>

            <View style={styles.inputField}>
              <Ionicons name="pricetag-outline" size={18} color={Colors.textSecondary} style={styles.fieldIcon} />
              <View style={styles.fieldBody}>
                <Text style={styles.fieldLabel}>Budget Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Living Expenses"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.inputField}>
              <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} style={styles.fieldIcon} />
              <View style={styles.fieldBody}>
                <Text style={styles.fieldLabel}>Start Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.textInput}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.switchRow}
              onPress={() => setIsRecurring(!isRecurring)}
              activeOpacity={0.8}
            >
              <View style={styles.switchLeft}>
                <Ionicons name="repeat-outline" size={18} color={Colors.textSecondary} style={styles.fieldIcon} />
                <View>
                  <Text style={styles.switchTitle}>Auto-Renew Every {period === 'monthly' ? 'Month' : period === 'weekly' ? 'Week' : 'Year'}</Text>
                  <Text style={styles.switchSubtitle}>Automatically rolls over into the next cycle</Text>
                </View>
              </View>
              <View style={[styles.togglePill, isRecurring && styles.togglePillActive]}>
                <View style={[styles.toggleThumb, isRecurring && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Category Limits Allocation */}
          {categories.length > 0 && (
            <View style={styles.formCard}>
              <View style={styles.categoryHeaderRow}>
                <View>
                  <Text style={styles.sectionLabel}>CATEGORY ALLOCATION</Text>
                  <Text style={styles.sectionSubtitle}>Optional spending caps per category</Text>
                </View>
                <View style={styles.categoryCountBadge}>
                  <Text style={styles.categoryCountText}>{categories.length} categories</Text>
                </View>
              </View>

              <View style={styles.categoryList}>
                {categories.map(cat => (
                  <View key={cat.id} style={styles.categoryRow}>
                    <View style={styles.catEmojiWrap}>
                      <Ionicons
                        name={
                          cat.icon && cat.icon.endsWith('-outline')
                            ? (cat.icon as any)
                            : cat.name.toLowerCase().includes('food')
                            ? 'fast-food-outline'
                            : cat.name.toLowerCase().includes('transport')
                            ? 'car-outline'
                            : cat.name.toLowerCase().includes('shop')
                            ? 'bag-handle-outline'
                            : cat.name.toLowerCase().includes('entertain')
                            ? 'tv-outline'
                            : cat.name.toLowerCase().includes('bill')
                            ? 'receipt-outline'
                            : 'wallet-outline'
                        }
                        size={18}
                        color={Colors.textSecondary}
                      />
                    </View>
                    <Text style={styles.catName} numberOfLines={1}>{cat.name}</Text>
                    <View style={styles.catInputWrap}>
                      <Text style={styles.catInputPrefix}>₹</Text>
                      <TextInput
                        style={styles.catAmountInput}
                        value={categoryBudgets[cat.id] || ''}
                        onChangeText={v => setCategoryBudgets(prev => ({ ...prev, [cat.id]: v }))}
                        placeholder="0"
                        placeholderTextColor={Colors.textMuted}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createBtn, isLoading && styles.createBtnDisabled]}
            onPress={handleSave}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.onSilver} />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color={Colors.onSilver} />
                <Text style={styles.createBtnText}>Save Budget</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: Spacing['3xl'] }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: {
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
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.lg,
  },

  /* Hero Section */
  heroSection: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  currencySymbol: {
    fontSize: Typography['3xl'],
    fontWeight: Typography.bold,
    color: Colors.text,
    marginRight: 6,
  },
  amountInput: {
    fontSize: 42,
    fontWeight: Typography.extrabold,
    color: Colors.text,
    minWidth: 120,
    textAlign: 'center',
  },
  presetRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
    justifyContent: 'center',
  },
  presetChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetChipActive: {
    backgroundColor: Colors.silverTop,
    borderColor: Colors.borderAlt,
  },
  presetText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.textSecondary,
  },
  presetTextActive: {
    color: Colors.onSilver,
    fontWeight: Typography.bold,
  },

  /* Period Card */
  periodCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    padding: 3,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.full,
  },
  periodTabActive: {
    backgroundColor: Colors.surfaceHigh,
  },
  periodTabText: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
  },
  periodTabTextActive: {
    color: Colors.text,
    fontWeight: Typography.bold,
  },

  /* Form Card */
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  fieldIcon: {
    marginRight: Spacing.md,
  },
  fieldBody: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  textInput: {
    fontSize: Typography.base,
    color: Colors.text,
    fontWeight: Typography.semibold,
    padding: 0,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.md,
  },
  switchTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },
  switchSubtitle: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  togglePill: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  togglePillActive: {
    backgroundColor: Colors.silverTop,
    borderColor: Colors.borderAlt,
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.onSilver,
  },

  /* Category Limits */
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionSubtitle: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  categoryCountBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceAlt,
  },
  categoryCountText: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
  },
  categoryList: {
    gap: Spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  catEmojiWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  catEmoji: {
    fontSize: 18,
  },
  catName: {
    flex: 1,
    fontSize: Typography.sm,
    color: Colors.text,
    fontWeight: Typography.medium,
  },
  catInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    width: 110,
  },
  catInputPrefix: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.bold,
    marginRight: 4,
  },
  catAmountInput: {
    flex: 1,
    fontSize: Typography.sm,
    color: Colors.text,
    fontWeight: Typography.semibold,
    padding: 0,
  },

  /* Save CTA */
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFB',
    borderRadius: Radius.full,
    paddingVertical: Spacing.base,
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  createBtnDisabled: {
    opacity: 0.6,
  },
  createBtnText: {
    color: '#0A0A0B',
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
});
