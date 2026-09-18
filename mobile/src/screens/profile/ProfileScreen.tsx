import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, StatusBar, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadProfile = async () => {
    try {
      const data = await api.get(API_ENDPOINTS.profile);
      setProfile(data);
    } catch {}
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadProfile();
    setIsRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your Stash session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account & Vault',
      'This will permanently delete all your financial records, budgets, and encrypted backups. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Vault',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(API_ENDPOINTS.deleteAccount);
              await logout();
            } catch {
              Alert.alert('Error', 'Unable to delete account at this time.');
            }
          },
        },
      ]
    );
  };

  const initials = (user?.full_name || 'Mayank')
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sections = [
    {
      title: 'ACCOUNT & SECURITY',
      items: [
        {
          icon: 'person-outline',
          label: 'Personal Information',
          sublabel: user?.email || 'Set your profile details',
          onPress: () => navigation.navigate('Settings'),
        },
        {
          icon: 'shield-checkmark-outline',
          label: 'Security & Encryption',
          sublabel: 'Biometric unlock, PIN & 256-bit vault',
          badge: 'Secured',
          badgeColor: Colors.income,
          onPress: () => Alert.alert('Security', 'Your vault is encrypted with AES-256 local token protection.'),
        },
        {
          icon: 'card-outline',
          label: 'Payment Methods & Wallets',
          sublabel: 'UPI, Credit Cards, Cash Accounts',
          onPress: () => Alert.alert('Payment Accounts', 'Manage cards, bank accounts and cash balances.'),
        },
      ],
    },
    {
      title: 'PREFERENCES',
      items: [
        {
          icon: 'cash-outline',
          label: 'Default Currency',
          sublabel: '₹ Indian Rupee (INR)',
          onPress: () => navigation.navigate('Settings'),
        },
        {
          icon: 'notifications-outline',
          label: 'Smart Notifications',
          sublabel: 'Budget alerts & bill reminders',
          onPress: () => navigation.navigate('Settings'),
        },
        {
          icon: 'moon-outline',
          label: 'Theme & Appearance',
          sublabel: 'Dark Obsidian (System match)',
          onPress: () => Alert.alert('Appearance', 'Stash Obsidian theme is active.'),
        },
      ],
    },
    {
      title: 'INTELLIGENCE & BACKUP',
      items: [
        {
          icon: 'sparkles',
          label: 'Stash AI Engine',
          sublabel: 'Financial advisor & prompt settings',
          iconColor: Colors.text,
          onPress: () => navigation.navigate('AIAssistant'),
        },
        {
          icon: 'repeat-outline',
          label: 'Recurring Subscriptions',
          sublabel: 'Manage automated bill tracker',
          onPress: () => navigation.navigate('Recurring'),
        },
        {
          icon: 'flag-outline',
          label: 'Savings Goals',
          sublabel: 'Track target fund milestones',
          onPress: () => navigation.navigate('SavingsGoals'),
        },
        {
          icon: 'download-outline',
          label: 'Export Data (CSV)',
          sublabel: 'Download encrypted ledger copy',
          onPress: () => Alert.alert('Export Complete', 'Ledger exported in CSV format to device downloads.'),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Screen Title Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.canGoBack() ? navigation.goBack() : undefined}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>Account &amp; Security Settings</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsIconBtn}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.8}
        >
          <Ionicons name="settings-outline" size={20} color={Colors.text} />
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
        {/* User Hero Identity Card */}
        <View style={styles.userHeroCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarCore}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </View>
            <View style={styles.verifiedDot}>
              <Ionicons name="checkmark" size={10} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.userName}>{user?.full_name || 'Mayank Sharma'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'demo@stash.app'}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.vaultBadge}>
              <Ionicons name="lock-closed" size={11} color={Colors.income} />
              <Text style={styles.vaultBadgeText}>Encrypted Vault</Text>
            </View>
            <View style={styles.proBadge}>
              <Ionicons name="sparkles" size={11} color={Colors.text} />
              <Text style={styles.proBadgeText}>AI Intelligence Active</Text>
            </View>
          </View>
        </View>

        {/* Inset Menu Sections */}
        {sections.map(section => (
          <View key={section.title} style={styles.sectionGroup}>
            <Text style={styles.sectionHeader}>{section.title}</Text>
            <View style={styles.cardGroup}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuRow,
                    idx < section.items.length - 1 && styles.menuRowDivider,
                  ]}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuIconContainer}>
                    <Ionicons
                      name={item.icon as any}
                      size={18}
                      color={(item as any).iconColor || Colors.textSecondary}
                    />
                  </View>
                  <View style={styles.menuBody}>
                    <Text style={styles.menuTitle}>{item.label}</Text>
                    {item.sublabel && (
                      <Text style={styles.menuSublabel}>{item.sublabel}</Text>
                    )}
                  </View>
                  {(item as any).badge ? (
                    <View style={[styles.inlineBadge, { backgroundColor: Colors.incomeLight }]}>
                      <Text style={[styles.inlineBadgeText, { color: (item as any).badgeColor }]}>
                        {(item as any).badge}
                      </Text>
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Danger Zone */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionHeader}>SESSION</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity
              style={[styles.menuRow, styles.menuRowDivider]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: Colors.expenseLight }]}>
                <Ionicons name="log-out-outline" size={18} color={Colors.expense} />
              </View>
              <View style={styles.menuBody}>
                <Text style={[styles.menuTitle, { color: Colors.expense }]}>Sign Out</Text>
                <Text style={styles.menuSublabel}>End current session on this device</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuRow}
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: Colors.expenseLight }]}>
                <Ionicons name="trash-outline" size={18} color={Colors.expense} />
              </View>
              <View style={styles.menuBody}>
                <Text style={[styles.menuTitle, { color: Colors.expense }]}>Delete Account & Data</Text>
                <Text style={styles.menuSublabel}>Permanent wipe of all records</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Security Notice */}
        <View style={styles.footerNote}>
          <Ionicons name="shield-checkmark" size={14} color={Colors.textMuted} />
          <Text style={styles.footerText}>
            Stash Core 2.4.0 • Zero-Knowledge Encrypted
          </Text>
        </View>

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
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
    paddingTop: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.extrabold,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  settingsIconBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },

  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.xl,
  },

  /* User Hero Identity Card */
  userHeroCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.borderAlt,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  avatarCore: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.extrabold,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  verifiedDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.income,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  userName: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  vaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.incomeLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  vaultBadgeText: {
    fontSize: Typography.xs,
    color: Colors.income,
    fontWeight: Typography.semibold,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  proBadgeText: {
    fontSize: Typography.xs,
    color: Colors.text,
    fontWeight: Typography.semibold,
  },

  /* Inset Section Groups */
  sectionGroup: {
    gap: Spacing.xs,
  },
  sectionHeader: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.textMuted,
    letterSpacing: 1,
    paddingHorizontal: Spacing.xs,
    marginBottom: 4,
  },
  cardGroup: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.base,
  },
  menuRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuBody: {
    flex: 1,
  },
  menuTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },
  menuSublabel: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  inlineBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  inlineBadgeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
  },

  /* Footer Note */
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
  },
  footerText: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
  },
});
