import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, StatusBar, Animated,
  TouchableOpacity, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { AppLogo } from '../../components/ui/AppLogo';
import { GlossyChip } from '../../components/ui/GlossyChip';
import { SearchBar } from '../../components/ui/SearchBar';
import { FeaturedPill } from '../../components/ui/FeaturedPill';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { TransactionRow } from '../../components/ui/TransactionRow';
import { FloatingNav, NavTab } from '../../components/ui/FloatingNav';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { MOCK_TRANSACTIONS, MOCK_BALANCE, MOCK_SAFE_TO_SPEND, formatIndian } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// Animated balance count-up
function BalanceDisplay({ value }: { value: number }) {
  const animValue = useRef(new Animated.Value(0)).current;
  const [displayText, setDisplayText] = useState('₹0.00');

  useEffect(() => {
    const listener = animValue.addListener(({ value: v }) => {
      setDisplayText(formatIndian(v));
    });
    Animated.timing(animValue, {
      toValue: value,
      duration: 800,
      useNativeDriver: false,
    }).start();
    return () => animValue.removeListener(listener);
  }, [value]);

  return <Text style={styles.balanceText}>{displayText}</Text>;
}

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [searchText, setSearchText] = useState('');
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [menuVisible, setMenuVisible] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');

  useFocusEffect(
    useCallback(() => {
      setActiveTab('home');
      setTransactions([...MOCK_TRANSACTIONS]);
    }, [])
  );

  // Stagger animation for rows
  const rowAnims = useRef(
    MOCK_TRANSACTIONS.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(20),
    }))
  ).current;

  useEffect(() => {
    Animated.stagger(
      40,
      rowAnims.map(({ opacity, translateY }) =>
        Animated.parallel([
          Animated.timing(opacity,     { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY,  { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      )
    ).start();
  }, []);

  const handleTabPress = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'insights') {
      navigation.navigate('Insights' as any);
    } else if (tab === 'accounts') {
      navigation.navigate('Accounts' as any);
    }
  };

  const handleFilterToggle = () => {
    setFilterType(prev => {
      if (prev === 'all') return 'expense';
      if (prev === 'expense') return 'income';
      return 'all';
    });
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch =
      !searchText.trim() ||
      t.merchant.toLowerCase().includes(searchText.toLowerCase()) ||
      t.category.toLowerCase().includes(searchText.toLowerCase());
    const matchesFilter = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Top row: logo + menu ── */}
          <View style={styles.topRow}>
            <AppLogo />
            <TouchableOpacity
              style={styles.menuBtn}
              activeOpacity={0.8}
              accessibilityLabel="Open menu"
              accessibilityRole="button"
              onPress={() => setMenuVisible(true)}
            >
              <Ionicons name="menu-outline" size={22} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* ── Display headline with GlossyChips inline ── */}
          <View style={styles.headlineBlock}>
            {/* Line 1: "Keep [coin chip]" */}
            <View style={styles.headlineLine}>
              <Text style={styles.headlinePrimary}>Keep </Text>
              <View style={styles.chipWrapper}>
                <GlossyChip icon="coin" rotation={6} />
              </View>
            </View>

            {/* Line 2: "Your Money [chart chip]" */}
            <View style={styles.headlineLine}>
              <Text style={styles.headlineSecondary}>Your Money </Text>
              <View style={styles.chipWrapper}>
                <GlossyChip icon="chart" rotation={-5} />
              </View>
            </View>

            {/* Line 3: "Simple" */}
            <Text style={styles.headlinePrimary}>Simple</Text>
          </View>

          {/* ── SearchBar ── */}
          <View style={styles.section}>
            <SearchBar
              value={searchText}
              onChangeText={setSearchText}
              onFilterPress={handleFilterToggle}
            />
          </View>

          {/* ── FeaturedPill: Balance (tappable -> Accounts) ── */}
          <View style={styles.section}>
            <FeaturedPill
              title={`Balance ${formatIndian(MOCK_BALANCE)}`}
              subtitle={`${formatIndian(MOCK_SAFE_TO_SPEND, 0)} safe to spend today`}
              iconName="wallet-outline"
              onPress={() => navigation.navigate('Accounts' as any)}
            />
          </View>

          {/* ── Section header: Today ── */}
          <View style={[styles.section, styles.sectionHeaderWrapper]}>
            <SectionHeader
              title={filterType === 'all' ? 'Today' : filterType === 'expense' ? 'Today (Expenses)' : 'Today (Income)'}
              action="See All"
              onActionPress={() => navigation.navigate('Transactions' as any)}
            />
          </View>

          {/* ── Transaction rows with stagger ── */}
          <View style={styles.transactionList}>
            {filteredTransactions.map((txn, i) => (
              <Animated.View
                key={txn.id}
                style={rowAnims[i] ? {
                  opacity: rowAnims[i].opacity,
                  transform: [{ translateY: rowAnims[i].translateY }],
                } : undefined}
              >
                <TransactionRow
                  merchant={txn.merchant}
                  category={txn.category}
                  method={txn.method}
                  amount={txn.amount}
                  type={txn.type}
                  iconName={txn.iconName as any}
                  onPress={() =>
                    navigation.navigate('TransactionDetail', {
                      transactionId: txn.id,
                      iconName: txn.iconName,
                    })
                  }
                />
              </Animated.View>
            ))}
          </View>

          {/* 120px bottom pad so last row clears FloatingNav */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Floating Nav */}
      <FloatingNav
        activeTab={activeTab}
        onTabPress={handleTabPress}
        onAddPress={() => navigation.navigate('AddTransaction' as any, {})}
      />

      {/* ── Quick Navigation Menu Modal ── */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuCard}>
            <View style={styles.menuTopHighlight} />

            <View style={styles.menuHeader}>
              <View>
                <Text style={styles.menuTitle}>Menu</Text>
                <Text style={styles.menuSubtitle}>Stash Finance</Text>
              </View>
              <TouchableOpacity
                onPress={() => setMenuVisible(false)}
                style={styles.menuCloseBtn}
                accessibilityLabel="Close menu"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
              {[
                { label: 'Analytics & Trends', icon: 'bar-chart-outline', route: 'Analytics' },
                { label: 'Budgets & Planning', icon: 'pie-chart-outline', route: 'Budgets' },
                { label: 'Savings Goals',      icon: 'flag-outline',      route: 'SavingsGoals' },
                { label: 'Recurring Bills',    icon: 'repeat-outline',    route: 'Recurring' },
                { label: 'AI Assistant',       icon: 'sparkles-outline',  route: 'AIAssistant' },
                { label: 'Linked Accounts',    icon: 'layers-outline',    route: 'Accounts' },
                { label: 'Profile',            icon: 'person-outline',    route: 'Profile' },
                { label: 'Settings',           icon: 'settings-outline',  route: 'Settings' },
              ].map(item => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.menuRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    setMenuVisible(false);
                    navigation.navigate(item.route as any);
                  }}
                >
                  <View style={styles.menuRowIconWrap}>
                    <Ionicons name={item.icon as any} size={18} color={Colors.text} />
                  </View>
                  <Text style={styles.menuRowText}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[styles.menuRow, styles.logoutRow]}
                activeOpacity={0.7}
                onPress={() => {
                  setMenuVisible(false);
                  logout();
                }}
              >
                <View style={[styles.menuRowIconWrap, { backgroundColor: 'rgba(255,122,114,0.15)' }]}>
                  <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
                </View>
                <Text style={[styles.menuRowText, { color: Colors.danger }]}>Sign Out</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.base,
  },

  // Top row
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    minHeight: 44,
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Display headline
  headlineBlock: {
    marginBottom: Spacing.xl,
    gap: 2,
  },
  headlineLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chipWrapper: {
    marginTop: -4,
  },
  headlinePrimary: {
    fontFamily: Typography.fontHighlight,
    fontSize: 42,
    lineHeight: 46,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headlineSecondary: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.display,
    lineHeight: Typography.displayLineHeight,
    color: Colors.textSecondary,
    letterSpacing: Typography.display * Typography.displayTracking,
  },
  balanceText: {
    fontSize: Typography.display,
    fontWeight: Typography.bold,
    color: Colors.text,
    fontVariant: ['tabular-nums'],
    letterSpacing: -1.2,
  },

  // Sections
  section: {
    marginBottom: Spacing.base,
  },
  sectionHeaderWrapper: {
    marginBottom: Spacing.sm,
  },
  transactionList: {
    gap: Spacing.sm,
  },

  // Menu Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 56,
    paddingRight: Spacing.base,
  },
  menuCard: {
    width: 270,
    maxHeight: '82%',
    backgroundColor: '#1E1E22',
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: Colors.borderAlt,
    overflow: 'hidden',
    ...Shadow.lg,
    elevation: 30,
  },
  menuTopHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.highlightTop,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  menuSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  menuCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuScroll: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
  },
  menuRowIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  menuRowText: {
    flex: 1,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.text,
  },
  logoutRow: {
    marginTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
});
