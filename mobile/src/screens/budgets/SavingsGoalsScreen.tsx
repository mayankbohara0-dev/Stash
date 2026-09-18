import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, Alert, StatusBar, TextInput, ActivityIndicator, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Gradients, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { api } from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { SavingsGoal } from '../../types';
import { formatCurrency } from '../../utils/formatting';
import { MOCK_SAVINGS_GOALS, MockSavingsGoal, formatIndian } from '../../data/mockData';

const GOAL_ICON_OPTIONS: Array<{ icon: keyof typeof Ionicons.glyphMap; label: string }> = [
  { icon: 'shield-checkmark-outline', label: 'Safety' },
  { icon: 'laptop-outline', label: 'Tech' },
  { icon: 'airplane-outline', label: 'Travel' },
  { icon: 'home-outline', label: 'Home' },
  { icon: 'car-outline', label: 'Vehicle' },
  { icon: 'school-outline', label: 'Education' },
  { icon: 'diamond-outline', label: 'Luxury' },
  { icon: 'flag-outline', label: 'Goal' },
];

export const SavingsGoalsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [goals, setGoals] = useState<MockSavingsGoal[]>(MOCK_SAVINGS_GOALS);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<keyof typeof Ionicons.glyphMap>('shield-checkmark-outline');
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.get<SavingsGoal[]>(API_ENDPOINTS.goals);
      if (Array.isArray(data) && data.length > 0) {
        setGoals(
          data.map(g => ({
            id: String(g.id),
            name: g.name || 'Goal',
            targetAmount: Number((g as any).target_amount ?? (g as any).targetAmount) || 0,
            currentAmount: Number((g as any).current_amount ?? (g as any).currentAmount) || 0,
            targetDate: g.target_date || '2026-12-31',
            iconName: 'flag-outline',
          }))
        );
      }
    } catch {
      // Offline fallback: keep MOCK_SAVINGS_GOALS
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  };

  const handleAddGoal = async () => {
    const target = parseFloat(targetAmount);
    if (!name.trim() || isNaN(target) || target <= 0) {
      Alert.alert('Required', 'Please enter a goal name and valid target amount.');
      return;
    }
    setIsSaving(true);
    const newGoal: MockSavingsGoal = {
      id: `goal-${Date.now()}`,
      name: name.trim(),
      targetAmount: target,
      currentAmount: parseFloat(currentAmount || '0') || 0,
      targetDate: '2027-01-01',
      iconName: selectedIcon,
    };
    setGoals(prev => [newGoal, ...prev]);
    setShowAdd(false);
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setIsSaving(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Goal', 'Remove this savings goal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setGoals(prev => prev.filter(g => g.id !== id)),
      },
    ]);
  };

  const totalTarget = goals.reduce((s, g) => s + (Number(g?.targetAmount) || 0), 0);
  const totalSaved = goals.reduce((s, g) => s + (Number(g?.currentAmount) || 0), 0);
  const overallPct = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgBase} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBackBtn}
          activeOpacity={0.8}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={18} color={Colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, paddingHorizontal: Spacing.md }}>
          <Text style={styles.headerLabel}>TARGETS</Text>
          <Text style={styles.headerTitle}>Savings Goals</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowAdd(true)}
          style={[styles.headerBackBtn, { backgroundColor: Colors.silverTop }]}
          activeOpacity={0.8}
          accessibilityLabel="Add Goal"
        >
          <Ionicons name="add" size={20} color={Colors.onSilver} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.textSecondary} />}
      >
        {/* Summary Card */}
        <LinearGradient
          colors={Gradients.raised}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.summaryCard}
        >
          <View style={styles.topHighlight} />

          <View style={styles.summaryRow}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Total Saved</Text>
              <Text style={[styles.summaryValue, { color: Colors.income }]}>
                {formatIndian(totalSaved)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Total Target</Text>
              <Text style={styles.summaryValue}>{formatIndian(totalTarget)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Overall</Text>
              <Text style={styles.summaryValue}>{overallPct.toFixed(0)}%</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Goals list */}
        <View style={styles.goalsList}>
          {goals.map(goal => {
            const pct = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
            const remaining = goal.targetAmount - goal.currentAmount;

            return (
              <LinearGradient
                key={goal.id}
                colors={Gradients.raised}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.goalCard}
              >
                <View style={styles.topHighlight} />

                <View style={styles.goalTop}>
                  <View style={styles.goalIconWrap}>
                    <Ionicons name={goal.iconName as any} size={20} color={Colors.text} />
                  </View>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <Text style={styles.goalDate}>Target: {goal.targetDate}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(goal.id)} activeOpacity={0.7}>
                    <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {/* Amounts */}
                <View style={styles.goalAmounts}>
                  <View>
                    <Text style={styles.goalAmountLabel}>Saved</Text>
                    <Text style={[styles.goalAmountVal, { color: Colors.income }]}>
                      {formatIndian(goal.currentAmount)}
                    </Text>
                  </View>
                  <View style={styles.pctBadge}>
                    <Text style={styles.pctText}>{pct.toFixed(0)}%</Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.goalBarTrack}>
                  <View style={[styles.goalBarFill, { width: `${pct}%` as any }]} />
                </View>

                <View style={styles.goalBottom}>
                  <Text style={styles.goalRemain}>
                    {remaining > 0 ? `₹${remaining.toLocaleString('en-IN')} to go` : 'Goal Reached! 🎉'}
                  </Text>
                  <Text style={styles.goalTarget}>Target: {formatIndian(goal.targetAmount)}</Text>
                </View>
              </LinearGradient>
            );
          })}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal visible={showAdd} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <LinearGradient
            colors={Gradients.raised}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.modalCard}
          >
            <View style={styles.topHighlight} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Savings Goal</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)} style={styles.modalClose}>
                <Ionicons name="close" size={18} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Goal Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Emergency Fund, New Laptop"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Target Amount (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="100000"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                value={targetAmount}
                onChangeText={setTargetAmount}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Current Saved (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                value={currentAmount}
                onChangeText={setCurrentAmount}
              />
            </View>

            {/* Icon Picker */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Choose Icon</Text>
              <View style={styles.iconRow}>
                {GOAL_ICON_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.icon}
                    style={[styles.iconChoice, selectedIcon === opt.icon && styles.iconChoiceActive]}
                    onPress={() => setSelectedIcon(opt.icon)}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={18}
                      color={selectedIcon === opt.icon ? Colors.onSilver : Colors.textSecondary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleAddGoal} activeOpacity={0.85}>
              <LinearGradient colors={Gradients.silver} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.saveBtnInner}>
                <Text style={styles.saveBtnText}>Create Goal</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
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
  headerTitle: {
    fontSize: 26,
    fontWeight: Typography.bold,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerBackBtn: {
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
  summaryCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryCol: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: Typography.xs, color: Colors.textMuted, marginBottom: 4 },
  summaryValue: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.text },
  summaryDivider: { width: 1, height: 28, backgroundColor: Colors.border },

  goalsList: { gap: Spacing.md },
  goalCard: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    gap: Spacing.md,
    ...Shadow.sm,
  },
  goalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  goalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goalInfo: { flex: 1 },
  goalName: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.text },
  goalDate: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  goalAmounts: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalAmountLabel: { fontSize: Typography.xs, color: Colors.textMuted },
  goalAmountVal: { fontSize: Typography.base, fontWeight: Typography.bold },
  pctBadge: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pctText: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.text },

  goalBarTrack: {
    height: 8,
    backgroundColor: Colors.bgInset,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goalBarFill: {
    height: '100%',
    backgroundColor: Colors.silverTop,
    borderRadius: 4,
  },
  goalBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalRemain: { fontSize: Typography.xs, color: Colors.textSecondary },
  goalTarget: { fontSize: Typography.xs, color: Colors.textMuted },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
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
  },
  modalTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.text },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: { gap: 6 },
  fieldLabel: { fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: Typography.medium },
  input: {
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgInset,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    color: Colors.text,
    fontSize: Typography.base,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  iconChoice: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconChoiceActive: {
    backgroundColor: Colors.silverTop,
    borderColor: Colors.silverTop,
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
