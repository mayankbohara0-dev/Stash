import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity,
  TextInput, Modal, Switch, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  Colors, Gradients, Typography, Spacing, Radius, Shadow,
} from '../../constants/theme';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface SmartRule {
  id: string;
  keyword: string;
  category: string;
  categoryIcon: string;
  enabled: boolean;
  matchCount: number;
}

const INITIAL_RULES: SmartRule[] = [
  {
    id: 'rule-1',
    keyword: 'Swiggy, Zomato, Starbucks',
    category: 'Food',
    categoryIcon: 'fast-food-outline',
    enabled: true,
    matchCount: 42,
  },
  {
    id: 'rule-2',
    keyword: 'Uber, Ola, Rapido, Metro',
    category: 'Transport',
    categoryIcon: 'car-outline',
    enabled: true,
    matchCount: 28,
  },
  {
    id: 'rule-3',
    keyword: 'Netflix, Spotify, Prime, YouTube',
    category: 'Subscriptions',
    categoryIcon: 'tv-outline',
    enabled: true,
    matchCount: 15,
  },
  {
    id: 'rule-4',
    keyword: 'Amazon, Flipkart, Myntra, Zara',
    category: 'Shopping',
    categoryIcon: 'bag-handle-outline',
    enabled: true,
    matchCount: 19,
  },
  {
    id: 'rule-5',
    keyword: 'Salary, Payroll, TechCorp',
    category: 'Income',
    categoryIcon: 'wallet-outline',
    enabled: true,
    matchCount: 6,
  },
  {
    id: 'rule-6',
    keyword: 'Electricity, Water, Wi-Fi, Airtel',
    category: 'Bills',
    categoryIcon: 'receipt-outline',
    enabled: true,
    matchCount: 8,
  },
];

const RULE_CATEGORIES = [
  { name: 'Food', icon: 'fast-food-outline' },
  { name: 'Transport', icon: 'car-outline' },
  { name: 'Subscriptions', icon: 'tv-outline' },
  { name: 'Shopping', icon: 'bag-handle-outline' },
  { name: 'Income', icon: 'wallet-outline' },
  { name: 'Bills', icon: 'receipt-outline' },
  { name: 'Entertainment', icon: 'film-outline' },
  { name: 'Health', icon: 'heart-outline' },
];

export const SmartRulesScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [rules, setRules] = useState<SmartRule[]>(INITIAL_RULES);
  const [modalVisible, setModalVisible] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [selectedCat, setSelectedCat] = useState(RULE_CATEGORIES[0]);
  const [activeTab, setActiveTab] = useState<'all' | 'active'>('all');

  const toggleRule = (id: string) => {
    setRules(prev =>
      prev.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const deleteRule = (id: string, name: string) => {
    Alert.alert('Delete Rule', `Remove rule for "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setRules(prev => prev.filter(r => r.id !== id)),
      },
    ]);
  };

  const handleAddRule = () => {
    if (!keywordInput.trim()) {
      Alert.alert('Error', 'Please enter at least one merchant keyword.');
      return;
    }

    const newRule: SmartRule = {
      id: `rule-${Date.now()}`,
      keyword: keywordInput.trim(),
      category: selectedCat.name,
      categoryIcon: selectedCat.icon,
      enabled: true,
      matchCount: 0,
    };

    setRules(prev => [newRule, ...prev]);
    setKeywordInput('');
    setModalVisible(false);
  };

  const displayedRules = rules.filter(r => (activeTab === 'active' ? r.enabled : true));
  const activeCount = rules.filter(r => r.enabled).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgBase} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.circleBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, paddingHorizontal: Spacing.md }}>
          <Text style={styles.headerLabel}>AUTOMATION</Text>
          <Text style={styles.headerTitle}>Smart Rules</Text>
        </View>
        <TouchableOpacity
          style={[styles.circleBtn, styles.addBtnHighlight]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color={Colors.onSilver} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Automation Hero Card */}
        <LinearGradient
          colors={Gradients.raised}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.topHighlight} />
          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroLabel}>AI AUTO-CATEGORIZATION</Text>
              <Text style={styles.heroTitle}>{activeCount} Active Rules</Text>
              <Text style={styles.heroSubtitle}>
                Transactions are instantly organized using pattern matching.
              </Text>
            </View>
            <View style={styles.heroIconWrap}>
              <Ionicons name="sparkles" size={20} color={Colors.text} />
            </View>
          </View>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>98.4%</Text>
              <Text style={styles.heroStatLabel}>Accuracy</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatVal, { color: Colors.income }]}>
                {rules.reduce((acc, r) => acc + r.matchCount, 0)}
              </Text>
              <Text style={styles.heroStatLabel}>Auto-Tagged</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>Instant</Text>
              <Text style={styles.heroStatLabel}>Execution</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, activeTab === 'all' && styles.filterChipActive]}
            onPress={() => setActiveTab('all')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, activeTab === 'all' && styles.filterTextActive]}>
              All Rules ({rules.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, activeTab === 'active' && styles.filterChipActive]}
            onPress={() => setActiveTab('active')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, activeTab === 'active' && styles.filterTextActive]}>
              Active ({activeCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Rule Cards List */}
        <View style={styles.rulesList}>
          {displayedRules.map(rule => (
            <LinearGradient
              key={rule.id}
              colors={Gradients.raised}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[styles.ruleCard, !rule.enabled && { opacity: 0.6 }]}
            >
              <View style={styles.topHighlight} />

              <View style={styles.ruleTopRow}>
                <View style={styles.ruleIconWrap}>
                  <Ionicons name={rule.categoryIcon as any} size={18} color={Colors.text} />
                </View>
                <View style={styles.ruleMeta}>
                  <View style={styles.conditionRow}>
                    <Text style={styles.ifBadge}>IF</Text>
                    <Text style={styles.ruleKeyword} numberOfLines={1}>
                      {rule.keyword}
                    </Text>
                  </View>
                  <View style={styles.targetRow}>
                    <Text style={styles.thenBadge}>THEN</Text>
                    <Text style={styles.ruleTargetCategory}>
                      Tag as {rule.category}
                    </Text>
                    <Text style={styles.matchCountBadge}>
                      · {rule.matchCount} tagged
                    </Text>
                  </View>
                </View>

                <Switch
                  value={rule.enabled}
                  onValueChange={() => toggleRule(rule.id)}
                  trackColor={{ false: Colors.surfaceAlt, true: Colors.silverTop }}
                  thumbColor={rule.enabled ? Colors.onSilver : Colors.textMuted}
                />
              </View>

              <View style={styles.ruleDivider} />

              <View style={styles.ruleBottomRow}>
                <Text style={styles.ruleStatusText}>
                  {rule.enabled ? '● Active rule' : '○ Disabled'}
                </Text>
                <TouchableOpacity
                  onPress={() => deleteRule(rule.id, rule.keyword)}
                  style={styles.deleteBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={15} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          ))}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Add Rule Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <SafeAreaView style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            style={{ flex: 1, justifyContent: 'flex-end' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>New Smart Rule</Text>
                  <Text style={styles.modalSubtitle}>Auto-categorize matching expenses</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.modalCloseBtn}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={20} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Keywords Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>Merchant Keywords (comma-separated)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={keywordInput}
                    onChangeText={setKeywordInput}
                    placeholder="e.g. Swiggy, Zomato, Starbucks"
                    placeholderTextColor={Colors.textMuted}
                    autoFocus
                  />
                  <Text style={styles.helperText}>
                    Transactions containing any of these keywords will be tagged automatically.
                  </Text>
                </View>

                {/* Target Category Selector */}
                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>Assign To Category</Text>
                  <View style={styles.catGrid}>
                    {RULE_CATEGORIES.map(cat => {
                      const active = selectedCat.name === cat.name;
                      return (
                        <TouchableOpacity
                          key={cat.name}
                          style={[styles.catOption, active && styles.catOptionActive]}
                          onPress={() => setSelectedCat(cat)}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name={cat.icon as any}
                            size={16}
                            color={active ? Colors.onSilver : Colors.text}
                          />
                          <Text style={[styles.catOptionText, active && styles.catOptionTextActive]}>
                            {cat.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Submit CTA */}
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleAddRule}
                  activeOpacity={0.85}
                >
                  <Ionicons name="sparkles" size={18} color={Colors.onSilver} />
                  <Text style={styles.submitBtnText}>Create Smart Rule</Text>
                </TouchableOpacity>

                <View style={{ height: Spacing.xl }} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
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
  addBtnHighlight: {
    backgroundColor: Colors.silverTop,
    borderColor: Colors.borderAlt,
  },
  headerLabel: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontWeight: Typography.bold,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.extrabold,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.base,
  },

  /* Hero Card */
  heroCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.highlightTop,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  heroLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.extrabold,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  heroIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatVal: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  heroStatLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },

  /* Filter Row */
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.surfaceAlt,
    borderColor: Colors.borderAlt,
  },
  filterText: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.text,
    fontWeight: Typography.bold,
  },

  /* Rules List */
  rulesList: {
    gap: Spacing.md,
  },
  ruleCard: {
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  ruleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ruleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ruleMeta: {
    flex: 1,
    gap: 4,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ifBadge: {
    fontSize: 10,
    fontWeight: Typography.extrabold,
    color: Colors.textMuted,
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  ruleKeyword: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.text,
    flex: 1,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  thenBadge: {
    fontSize: 10,
    fontWeight: Typography.extrabold,
    color: Colors.income,
    backgroundColor: 'rgba(124,224,166,0.12)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  ruleTargetCategory: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },
  matchCountBadge: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  ruleDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  ruleBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ruleStatusText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  deleteBtn: {
    padding: 4,
  },

  /* Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.base,
  },
  modalTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  modalSubtitle: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: Spacing.base,
  },
  fieldLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: Typography.sm,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  helperText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 5,
    lineHeight: 16,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  catOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catOptionActive: {
    backgroundColor: Colors.silverTop,
    borderColor: Colors.borderAlt,
  },
  catOptionText: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
    color: Colors.text,
  },
  catOptionTextActive: {
    color: Colors.onSilver,
    fontWeight: Typography.bold,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.silverTop,
    borderRadius: Radius.full,
    paddingVertical: Spacing.base,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  submitBtnText: {
    color: Colors.onSilver,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
});
