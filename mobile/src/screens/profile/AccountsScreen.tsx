import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

import {
  Colors, Gradients, Typography, Spacing, Radius, Shadow,
} from '../../constants/theme';
import { FloatingNav, NavTab } from '../../components/ui/FloatingNav';
import { MOCK_ACCOUNTS, formatIndian } from '../../data/mockData';

const TYPE_LABELS = {
  savings: 'Savings',
  current: 'Current',
  credit:  'Credit Card',
  wallet:  'Wallet',
};

function AccountCard({ account }: { account: typeof MOCK_ACCOUNTS[number] }) {
  const isNegative = account.balance < 0;

  return (
    <LinearGradient
      colors={Gradients.raised}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.accountCard}
    >
      <View style={styles.topHighlight} />

      {/* Top row */}
      <View style={styles.cardTopRow}>
        <View style={styles.bankIconWrap}>
          <Ionicons name={account.iconName as any} size={20} color={Colors.text} />
        </View>
        <View style={styles.bankInfo}>
          <Text style={styles.bankName}>{account.name}</Text>
          <Text style={styles.bankInstitution}>{account.institution}</Text>
        </View>
        {account.last4 ? (
          <Text style={styles.last4}>·· {account.last4}</Text>
        ) : null}
      </View>

      {/* Balance */}
      <View style={styles.balanceRow}>
        <View>
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text
            style={[
              styles.balanceAmount,
              isNegative && { color: Colors.danger },
            ]}
          >
            {isNegative ? '−' : ''}{formatIndian(Math.abs(account.balance))}
          </Text>
        </View>

        {/* Type pill */}
        <View style={styles.typePill}>
          <Text style={styles.typePillText}>{TYPE_LABELS[account.type]}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const AccountsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [activeTab, setActiveTab] = useState<NavTab>('accounts');

  useFocusEffect(
    useCallback(() => {
      setActiveTab('accounts');
    }, [])
  );

  const totalBalance = MOCK_ACCOUNTS.reduce((acc, a) => acc + a.balance, 0);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home' as any)}
            style={styles.backBtn}
            accessibilityLabel="Go to Home"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Accounts</Text>
            <Text style={styles.headerSub}>{MOCK_ACCOUNTS.length} linked accounts</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Net worth summary pill */}
          <LinearGradient
            colors={['#2C2C30', '#1A1A1D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.netWorthCard}
          >
            <View style={styles.topHighlight} />
            <Text style={styles.netWorthLabel}>Net Worth</Text>
            <Text style={styles.netWorthAmount}>{formatIndian(totalBalance)}</Text>
            <Text style={styles.netWorthSub}>Across all linked accounts</Text>
          </LinearGradient>

          {/* Account cards — stacked */}
          <View style={styles.cardList}>
            {MOCK_ACCOUNTS.map(acc => (
              <AccountCard key={acc.id} account={acc} />
            ))}
          </View>

          {/* Add account button */}
          <TouchableOpacity
            style={styles.addAccountBtn}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Link Financial Account', 'Select your bank or payment app to securely link it with Stash.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Connect Bank', onPress: () => {} },
            ])}
          >
            <LinearGradient
              colors={Gradients.raised}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.addAccountInner}
            >
              <View style={styles.topHighlight} />
              <View style={styles.addAccountIcon}>
                <Ionicons name="add" size={20} color={Colors.textSecondary} />
              </View>
              <Text style={styles.addAccountText}>Add Account</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      <FloatingNav
        activeTab={activeTab}
        onTabPress={(tab) => {
          if (tab === 'home') navigation.navigate('Home' as any);
          else if (tab === 'insights') navigation.navigate('Insights' as any);
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
  content: { paddingHorizontal: Spacing.lg, gap: Spacing.base, paddingTop: Spacing.base },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.base, paddingBottom: Spacing.base, gap: Spacing.md,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: Typography.xl, fontWeight: Typography.semibold, color: Colors.text, letterSpacing: -0.3 },
  headerSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  netWorthCard: {
    borderRadius: Radius['2xl'], borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.xl, overflow: 'hidden', ...Shadow.md,
  },
  topHighlight: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: Colors.highlightTop },
  netWorthLabel: { fontSize: 12, fontWeight: Typography.medium, color: Colors.textSecondary, marginBottom: 6 },
  netWorthAmount: { fontSize: Typography['4xl'], fontWeight: Typography.bold, color: Colors.text, letterSpacing: -1.5, fontVariant: ['tabular-nums'] },
  netWorthSub: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },

  cardList: { gap: Spacing.sm },
  accountCard: {
    borderRadius: Radius['2xl'], borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.xl, overflow: 'hidden', ...Shadow.sm,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xl },
  bankIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surfaceAlt, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  bankInfo: { flex: 1 },
  bankName: { fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.text },
  bankInstitution: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  last4: { fontSize: Typography.base, color: Colors.textMuted, fontVariant: ['tabular-nums'] },

  balanceRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  balanceLabel: { fontSize: 11, fontWeight: Typography.medium, color: Colors.textMuted, marginBottom: 4, letterSpacing: 0.5 },
  balanceAmount: { fontSize: Typography['3xl'], fontWeight: Typography.bold, color: Colors.text, letterSpacing: -0.8, fontVariant: ['tabular-nums'] },
  typePill: {
    backgroundColor: Colors.surfaceAlt, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full,
  },
  typePillText: { fontSize: 11, fontWeight: Typography.semibold, color: Colors.textSecondary },

  addAccountBtn: { borderRadius: Radius.row, overflow: 'hidden' },
  addAccountInner: {
    height: 72, borderRadius: Radius.row, borderWidth: 1, borderColor: Colors.border,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base, gap: Spacing.md, overflow: 'hidden',
  },
  addAccountIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceAlt,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center',
  },
  addAccountText: { flex: 1, fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.textSecondary },
});
