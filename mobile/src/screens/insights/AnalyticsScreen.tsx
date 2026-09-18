import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity,
  Dimensions, Animated, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';

import {
  Colors, Gradients, Typography, Spacing, Radius, Shadow,
} from '../../constants/theme';
import { FloatingNav, NavTab } from '../../components/ui/FloatingNav';
import {
  MOCK_ANALYTICS_MONTHS,
  MOCK_ANALYTICS_CURRENT_MONTH,
  MOCK_CATEGORY_BREAKDOWN,
  MOCK_WEEKLY_TREND,
  formatIndian,
} from '../../data/mockData';

const { width } = Dimensions.get('window');
const SIDE_PAD = Spacing.lg;
const CHART_W = width - SIDE_PAD * 2 - Spacing.xl * 2;
const BAR_H = 110;
const BAR_GAP = 6;

type Nav = NativeStackNavigationProp<RootStackParamList>;
type ViewMode = 'expense' | 'income';

// -- Mini stat card ----------------------------------------------------------
const StatCard = ({ label, value, valueColor, icon }: {
  label: string; value: string; valueColor?: string; icon: string;
}) => (
  <LinearGradient colors={Gradients.raised} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={stat.card}>
    <View style={stat.topLine} />
    <View style={stat.iconWrap}>
      <Ionicons name={icon as any} size={15} color={Colors.textSecondary} />
    </View>
    <Text style={[stat.value, valueColor ? { color: valueColor } : undefined]} numberOfLines={1} adjustsFontSizeToFit>
      {value}
    </Text>
    <Text style={stat.label}>{label}</Text>
  </LinearGradient>
);

const stat = StyleSheet.create({
  card: {
    flex: 1, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, overflow: 'hidden', gap: 4,
    ...Shadow.sm,
  },
  topLine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
    backgroundColor: Colors.highlightTop,
  },
  iconWrap: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.surfaceAlt, alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  value: {
    fontSize: Typography.md, fontWeight: Typography.bold,
    color: Colors.text, letterSpacing: -0.3, fontVariant: ['tabular-nums'],
  },
  label: { fontSize: 10, color: Colors.textMuted, fontWeight: Typography.medium },
});

// -- Category breakdown row --------------------------------------------------
const CategoryRow = ({
  name, amount, total, iconName, barColor, index,
}: {
  name: string; amount: number; total: number;
  iconName: string; barColor: string; index: number;
}) => {
  const pct = total > 0 ? (amount / total) * 100 : 0;
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: pct,
      duration: 550 + index * 80,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const animatedWidth = barAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={catRow.wrap}>
      <View style={catRow.left}>
        <View style={catRow.iconBox}>
          <Ionicons name={iconName as any} size={15} color={Colors.textSecondary} />
        </View>
        <View style={catRow.textCol}>
          <Text style={catRow.name} numberOfLines={1}>{name}</Text>
          <View style={catRow.barTrack}>
            <Animated.View style={[catRow.barFill, { width: animatedWidth, backgroundColor: barColor }]} />
          </View>
        </View>
      </View>
      <View style={catRow.right}>
        <Text style={catRow.amount}>{formatIndian(amount)}</Text>
        <Text style={catRow.pct}>{pct.toFixed(0)}%</Text>
      </View>
    </View>
  );
};

const catRow = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', gap: Spacing.md,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  iconBox: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.surfaceAlt, alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  textCol: { flex: 1, gap: 6 },
  name: { fontSize: 13, fontWeight: Typography.medium, color: Colors.text },
  barTrack: {
    height: 4, backgroundColor: Colors.surfaceAlt, borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 2 },
  right: { alignItems: 'flex-end', gap: 2, minWidth: 70 },
  amount: {
    fontSize: 13, fontWeight: Typography.semibold,
    color: Colors.text, fontVariant: ['tabular-nums'],
  },
  pct: { fontSize: 10, color: Colors.textMuted },
});

// -- Main Screen -------------------------------------------------------------
export const AnalyticsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [activeTab] = useState<NavTab>('insights');
  const [selectedMonth, setSelectedMonth] = useState(MOCK_ANALYTICS_CURRENT_MONTH);
  const [viewMode, setViewMode] = useState<ViewMode>('expense');

  const selectedData = MOCK_ANALYTICS_MONTHS.find(m => m.label === selectedMonth);
  const idx = MOCK_ANALYTICS_MONTHS.findIndex(m => m.label === selectedMonth);
  const prevData = idx > 0 ? MOCK_ANALYTICS_MONTHS[idx - 1] : null;

  const currentAmount = viewMode === 'expense'
    ? (selectedData?.amount ?? 0)
    : (selectedData?.income ?? 0);
  const prevAmount = viewMode === 'expense'
    ? (prevData?.amount ?? 0)
    : (prevData?.income ?? 0);
  const pctChange = prevAmount > 0
    ? ((currentAmount - prevAmount) / prevAmount) * 100
    : 0;
  const isUp = pctChange >= 0;
  const net = (selectedData?.income ?? 0) - (selectedData?.amount ?? 0);

  const categories = MOCK_CATEGORY_BREAKDOWN[selectedMonth] ?? [];
  const totalCatSpend = categories.reduce((s, c) => s + c.amount, 0);

  const maxVal = Math.max(...MOCK_ANALYTICS_MONTHS.map(m =>
    viewMode === 'expense' ? m.amount : m.income
  ));
  const barWidth = (CHART_W - (MOCK_ANALYTICS_MONTHS.length - 1) * BAR_GAP) / MOCK_ANALYTICS_MONTHS.length;

  const weekMax = Math.max(...MOCK_WEEKLY_TREND.map(d => d.amount));
  const weekBarW = (CHART_W - (MOCK_WEEKLY_TREND.length - 1) * BAR_GAP) / MOCK_WEEKLY_TREND.length;
  const WEEK_H = 70;
  const dayIndex = new Date().getDay();
  const todayLabel = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex];

  const expenseColor = viewMode === 'expense'
    ? (isUp ? Colors.expense : Colors.income)
    : (isUp ? Colors.income : Colors.expense);
  const expenseBg = viewMode === 'expense'
    ? (isUp ? Colors.expenseLight : Colors.incomeLight)
    : (isUp ? Colors.incomeLight : Colors.expenseLight);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe} edges={['top']}>

        {/* -- Header -- */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerLabel}>OVERVIEW</Text>
            <Text style={styles.headerTitle}>Analytics</Text>
          </View>
          <TouchableOpacity
            style={styles.shareBtn}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Report Exported', 'Detailed spending analysis report has been saved to downloads.')}
          >
            <Ionicons name="share-outline" size={18} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* -- Expense / Income Toggle -- */}
          <View style={styles.toggleRow}>
            {(['expense', 'income'] as ViewMode[]).map(mode => (
              <TouchableOpacity key={mode} onPress={() => setViewMode(mode)} activeOpacity={0.8} style={styles.toggleBtnWrap}>
                <LinearGradient
                  colors={viewMode === mode ? Gradients.silver : ['transparent', 'transparent']}
                  start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                  style={[styles.toggleBtn, viewMode === mode && styles.toggleBtnActive]}
                >
                  <Ionicons
                    name={mode === 'expense' ? 'arrow-up-circle-outline' : 'arrow-down-circle-outline'}
                    size={15}
                    color={viewMode === mode ? Colors.onSilver : Colors.textSecondary}
                  />
                  <Text style={[styles.toggleBtnText, viewMode === mode && styles.toggleBtnTextActive]}>
                    {mode === 'expense' ? 'Expenses' : 'Income'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* -- Summary Stats Row -- */}
          <View style={styles.statsRow}>
            <StatCard
              label={viewMode === 'expense' ? 'Total Spent' : 'Total Earned'}
              value={formatIndian(currentAmount, 0)}
              valueColor={viewMode === 'expense' ? Colors.expense : Colors.income}
              icon={viewMode === 'expense' ? 'arrow-up-circle-outline' : 'arrow-down-circle-outline'}
            />
            <StatCard
              label="vs Last Month"
              value={prevAmount > 0 ? `${isUp ? '+' : ''}${pctChange.toFixed(1)}%` : 'N/A'}
              valueColor={expenseColor}
              icon={isUp ? 'trending-up-outline' : 'trending-down-outline'}
            />
            <StatCard
              label="Net Savings"
              value={formatIndian(Math.abs(net), 0)}
              valueColor={net >= 0 ? Colors.income : Colors.expense}
              icon="wallet-outline"
            />
          </View>

          {/* -- Monthly Bar Chart -- */}
          <LinearGradient colors={Gradients.raised} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.chartCard}>
            <View style={styles.topHighlight} />
            <View style={styles.chartHeader}>
              <View>
                <Text style={styles.chartLabel}>{selectedMonth} 2026</Text>
                <Text style={styles.chartAmount}>{formatIndian(currentAmount)}</Text>
              </View>
              <View style={[styles.trendBadge, { backgroundColor: expenseBg }]}>
                <Ionicons name={isUp ? 'trending-up-outline' : 'trending-down-outline'} size={13} color={expenseColor} />
                <Text style={[styles.trendText, { color: expenseColor }]}>
                  {prevAmount > 0 ? `${Math.abs(pctChange).toFixed(1)}% vs prev` : 'First month'}
                </Text>
              </View>
            </View>

            {/* Interactive Month Selector Pills */}
            <View style={styles.monthPillsRow}>
              {MOCK_ANALYTICS_MONTHS.map(m => {
                const isSel = m.label === selectedMonth;
                return (
                  <TouchableOpacity
                    key={m.label}
                    onPress={() => setSelectedMonth(m.label)}
                    style={[styles.monthPill, isSel && styles.monthPillActive]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.monthPillText, isSel && styles.monthPillTextActive]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Svg width={CHART_W} height={BAR_H + 24} style={{ marginTop: Spacing.base }}>
              {[0.33, 0.66, 1].map(r => (
                <Line key={r} x1={0} y1={BAR_H * (1 - r)} x2={CHART_W} y2={BAR_H * (1 - r)}
                  stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
              ))}
              {MOCK_ANALYTICS_MONTHS.map((m, i) => {
                const val = viewMode === 'expense' ? m.amount : m.income;
                const bh = Math.max(4, (val / maxVal) * BAR_H);
                const x = i * (barWidth + BAR_GAP);
                const y = BAR_H - bh;
                const isSel = m.label === selectedMonth;
                return (
                  <React.Fragment key={m.label}>
                    <Rect x={x + 1} y={y + 2} width={barWidth - 2} height={bh} rx={barWidth / 3} fill="rgba(0,0,0,0.3)" />
                    <Rect x={x} y={y} width={barWidth} height={bh} rx={barWidth / 3}
                      fill={isSel ? '#FAFAFB' : '#2E2E33'} onPress={() => setSelectedMonth(m.label)} />
                    <Rect x={x} y={y} width={barWidth} height={Math.min(3, bh)} rx={1}
                      fill={isSel ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.10)'} />
                    <SvgText x={x + barWidth / 2} y={BAR_H + 18} textAnchor="middle"
                      fontSize={10} fontWeight="600" fill={isSel ? Colors.text : Colors.textMuted}>
                      {m.label}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
          </LinearGradient>

          {/* -- Category Breakdown (expense mode only) -- */}
          {viewMode === 'expense' && (
            <LinearGradient colors={Gradients.raised} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.sectionCard}>
              <View style={styles.topHighlight} />
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Spending Breakdown</Text>
                <Text style={styles.sectionSub}>{selectedMonth} 2026</Text>
              </View>
              <View style={styles.catList}>
                {categories.map((cat, i) => (
                  <CategoryRow
                    key={cat.name}
                    name={cat.name}
                    amount={cat.amount}
                    total={totalCatSpend}
                    iconName={cat.iconName}
                    barColor={cat.color}
                    index={i}
                  />
                ))}
              </View>
            </LinearGradient>
          )}

          {/* -- Income source breakdown (income mode) -- */}
          {viewMode === 'income' && (
            <LinearGradient colors={Gradients.raised} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.sectionCard}>
              <View style={styles.topHighlight} />
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Income Sources</Text>
                <Text style={styles.sectionSub}>{selectedMonth} 2026</Text>
              </View>
              <View style={styles.catList}>
                {[
                  { name: 'Salary',       amount: 75000, iconName: 'briefcase-outline',        color: '#FAFAFB', pct: 88 },
                  { name: 'Freelance',    amount: 8000,  iconName: 'laptop-outline',            color: '#A0A0A5', pct: 9  },
                  { name: 'Investments',  amount: 2000,  iconName: 'trending-up-outline',       color: '#6A6A6F', pct: 2  },
                  { name: 'Other',        amount: 0,     iconName: 'ellipsis-horizontal-outline', color: '#3A3A3E', pct: 0 },
                ].map((src, i) => (
                  <CategoryRow
                    key={src.name}
                    name={src.name}
                    amount={src.amount}
                    total={85000}
                    iconName={src.iconName}
                    barColor={src.color}
                    index={i}
                  />
                ))}
              </View>
            </LinearGradient>
          )}

          {/* -- Weekly Mini Chart -- */}
          <LinearGradient colors={Gradients.raised} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.sectionCard}>
            <View style={styles.topHighlight} />
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>This Week</Text>
              <View style={styles.trendBadge}>
                <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
                <Text style={[styles.trendText, { color: Colors.textSecondary }]}>Last 7 days</Text>
              </View>
            </View>
            <Svg width={CHART_W} height={WEEK_H + 20} style={{ marginTop: 8 }}>
              {MOCK_WEEKLY_TREND.map((d, i) => {
                const bh = Math.max(4, (d.amount / weekMax) * WEEK_H);
                const x = i * (weekBarW + BAR_GAP);
                const y = WEEK_H - bh;
                const isToday = d.day === todayLabel;
                return (
                  <React.Fragment key={d.day}>
                    <Rect x={x} y={y} width={weekBarW} height={bh} rx={weekBarW / 3}
                      fill={isToday ? '#FAFAFB' : '#2A2A2E'} />
                    <Rect x={x} y={y} width={weekBarW} height={Math.min(2, bh)} rx={1}
                      fill={isToday ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.08)'} />
                    <SvgText x={x + weekBarW / 2} y={WEEK_H + 16} textAnchor="middle"
                      fontSize={9} fontWeight="500" fill={isToday ? Colors.text : Colors.textMuted}>
                      {d.day}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
            <View style={styles.weekTotalsRow}>
              {[
                { label: 'This week', val: formatIndian(MOCK_WEEKLY_TREND.reduce((s, d) => s + d.amount, 0), 0), color: Colors.expense },
                null,
                { label: 'Daily avg', val: formatIndian(Math.round(MOCK_WEEKLY_TREND.reduce((s, d) => s + d.amount, 0) / 7), 0), color: Colors.text },
                null,
                { label: 'Peak day', val: MOCK_WEEKLY_TREND.reduce((a, b) => a.amount > b.amount ? a : b).day, color: Colors.warning },
              ].map((item, i) =>
                item === null
                  ? <View key={i} style={styles.weekTotalDivider} />
                  : (
                    <View key={item.label} style={styles.weekTotalItem}>
                      <Text style={styles.weekTotalLabel}>{item.label}</Text>
                      <Text style={[styles.weekTotalVal, { color: item.color }]}>{item.val}</Text>
                    </View>
                  )
              )}
            </View>
          </LinearGradient>

          {/* -- Income vs Expenses Comparison -- */}
          <LinearGradient colors={Gradients.raised} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.sectionCard}>
            <View style={styles.topHighlight} />
            <Text style={styles.sectionTitle}>Income vs Expenses</Text>
            <Text style={styles.sectionSub2}>{selectedMonth} 2026</Text>

            <View style={styles.ivsRow}>
              <View style={styles.ivsLabel}>
                <Ionicons name="arrow-down-circle-outline" size={14} color={Colors.income} />
                <Text style={styles.ivsLabelText}>Income</Text>
              </View>
              <View style={styles.ivsBarWrap}>
                <View style={styles.ivsBarTrack}>
                  <View style={[styles.ivsBarFill, { width: '100%', backgroundColor: Colors.income }]} />
                </View>
                <Text style={[styles.ivsAmt, { color: Colors.income }]}>
                  {formatIndian(selectedData?.income ?? 0, 0)}
                </Text>
              </View>
            </View>

            <View style={styles.ivsRow}>
              <View style={styles.ivsLabel}>
                <Ionicons name="arrow-up-circle-outline" size={14} color={Colors.expense} />
                <Text style={styles.ivsLabelText}>Expenses</Text>
              </View>
              <View style={styles.ivsBarWrap}>
                <View style={styles.ivsBarTrack}>
                  <View style={[
                    styles.ivsBarFill,
                    {
                      width: `${Math.min(((selectedData?.amount ?? 0) / (selectedData?.income ?? 1)) * 100, 100)}%` as any,
                      backgroundColor: Colors.expense,
                    }
                  ]} />
                </View>
                <Text style={[styles.ivsAmt, { color: Colors.expense }]}>
                  {formatIndian(selectedData?.amount ?? 0, 0)}
                </Text>
              </View>
            </View>

            <View style={styles.savingsRateRow}>
              <View>
                <Text style={styles.savingsRateLabel}>Savings Rate</Text>
                <Text style={styles.savingsRateSub}>
                  {formatIndian(net, 0)} saved this month
                </Text>
              </View>
              <View style={styles.savingsRateBadge}>
                <Text style={styles.savingsRateVal}>
                  {net >= 0
                    ? `${((net / (selectedData?.income ?? 1)) * 100).toFixed(0)}%`
                    : '0%'}
                </Text>
              </View>
            </View>
          </LinearGradient>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      <FloatingNav
        activeTab={activeTab}
        onTabPress={(tab) => {
          if (tab === 'home') navigation.navigate('Main' as any, { screen: 'Home' });
          else if (tab === 'insights') navigation.navigate('Main' as any, { screen: 'Insights' });
          else if (tab === 'accounts') navigation.navigate('Accounts' as any);
        }}
        onAddPress={() => navigation.navigate('AddTransaction' as any, {})}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgBase },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: SIDE_PAD, paddingTop: Spacing.sm, gap: Spacing.md },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SIDE_PAD, paddingTop: Spacing.sm, paddingBottom: Spacing.md, gap: Spacing.md,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  shareBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerLabel: {
    fontSize: Typography.xs, color: Colors.textMuted, fontWeight: Typography.bold, letterSpacing: 1,
  },
  headerTitle: {
    fontSize: Typography['2xl'], fontWeight: Typography.extrabold, color: Colors.text, letterSpacing: -0.5,
  },

  toggleRow: {
    flexDirection: 'row', gap: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: Radius.full, padding: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  toggleBtnWrap: { flex: 1 },
  toggleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, height: 38, borderRadius: Radius.full,
    borderWidth: 1, borderColor: 'transparent',
  },
  toggleBtnActive: { borderColor: Colors.borderAlt },
  toggleBtnText: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textSecondary },
  toggleBtnTextActive: { color: Colors.onSilver },

  statsRow: { flexDirection: 'row', gap: Spacing.sm },

  chartCard: {
    borderRadius: Radius['2xl'], borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.xl, overflow: 'hidden', ...Shadow.md,
  },
  topHighlight: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
    backgroundColor: Colors.highlightTop,
  },
  chartHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  chartLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: Typography.medium, letterSpacing: 0.5 },
  chartAmount: {
    fontSize: Typography['3xl'], fontWeight: Typography.extrabold, color: Colors.text,
    letterSpacing: -1, marginTop: 2, fontVariant: ['tabular-nums'],
  },
  trendBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceAlt, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
  },
  trendText: { fontSize: 11, fontWeight: Typography.semibold },

  sectionCard: {
    borderRadius: Radius['2xl'], borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.xl, overflow: 'hidden', gap: Spacing.base, ...Shadow.sm,
  },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.text },
  sectionSub: { fontSize: 11, color: Colors.textMuted },
  sectionSub2: { fontSize: 12, color: Colors.textSecondary, marginTop: -8 },
  catList: { gap: Spacing.base },

  weekTotalsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceAlt, borderRadius: Radius.lg,
    padding: Spacing.md, marginTop: 4,
  },
  weekTotalItem: { flex: 1, alignItems: 'center', gap: 2 },
  weekTotalLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: Typography.medium },
  weekTotalVal: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.text, fontVariant: ['tabular-nums'] },
  weekTotalDivider: { width: 1, height: 28, backgroundColor: Colors.border },

  ivsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  ivsLabel: { flexDirection: 'row', alignItems: 'center', gap: 5, width: 76 },
  ivsLabelText: { fontSize: 12, fontWeight: Typography.medium, color: Colors.textSecondary },
  ivsBarWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  ivsBarTrack: { flex: 1, height: 6, backgroundColor: Colors.surfaceAlt, borderRadius: 3, overflow: 'hidden' },
  ivsBarFill: { height: '100%', borderRadius: 3 },
  ivsAmt: { fontSize: 12, fontWeight: Typography.bold, minWidth: 60, textAlign: 'right', fontVariant: ['tabular-nums'] },

  savingsRateRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  savingsRateLabel: { fontSize: 13, fontWeight: Typography.medium, color: Colors.text },
  savingsRateSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  savingsRateBadge: {
    backgroundColor: Colors.incomeLight, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(124,224,166,0.25)',
  },
  savingsRateVal: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.income },

  monthPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  monthPill: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  monthPillActive: {
    backgroundColor: Colors.silverTop,
    borderColor: Colors.borderAlt,
  },
  monthPillText: {
    fontSize: 11,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
  },
  monthPillTextActive: {
    color: Colors.onSilver,
    fontWeight: Typography.bold,
  },
});
