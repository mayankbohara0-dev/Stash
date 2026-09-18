import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, StatusBar,
  RefreshControl, Modal, TextInput, ActivityIndicator, Share, Platform,
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

// ── Edit Profile Modal ────────────────────────────────────────────────────────
function EditProfileModal({
  visible,
  currentName,
  currentEmail,
  onClose,
  onSaved,
}: {
  visible: boolean;
  currentName: string;
  currentEmail: string;
  onClose: () => void;
  onSaved: (name: string) => void;
}) {
  const [name, setName] = useState(currentName);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) setName(currentName);
  }, [visible, currentName]);

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Invalid Name', 'Please enter your full name.');
      return;
    }
    setIsSaving(true);
    try {
      await api.put(API_ENDPOINTS.profile, { full_name: name.trim() });
      onSaved(name.trim());
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          {/* Handle bar */}
          <View style={modalStyles.handle} />

          <Text style={modalStyles.title}>Personal Information</Text>
          <Text style={modalStyles.subtitle}>Update your display name</Text>

          <View style={modalStyles.fieldGroup}>
            <Text style={modalStyles.fieldLabel}>FULL NAME</Text>
            <View style={modalStyles.inputWrap}>
              <Ionicons name="person-outline" size={16} color={Colors.textMuted} style={modalStyles.inputIcon} />
              <TextInput
                style={modalStyles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                placeholderTextColor={Colors.textMuted}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={save}
              />
            </View>
          </View>

          <View style={modalStyles.fieldGroup}>
            <Text style={modalStyles.fieldLabel}>EMAIL ADDRESS</Text>
            <View style={[modalStyles.inputWrap, modalStyles.inputDisabled]}>
              <Ionicons name="mail-outline" size={16} color={Colors.textMuted} style={modalStyles.inputIcon} />
              <TextInput
                style={[modalStyles.input, { color: Colors.textMuted }]}
                value={currentEmail}
                editable={false}
                selectTextOnFocus={false}
              />
              <View style={modalStyles.lockedBadge}>
                <Ionicons name="lock-closed" size={11} color={Colors.textMuted} />
              </View>
            </View>
            <Text style={modalStyles.fieldHint}>Email cannot be changed after registration</Text>
          </View>

          <View style={modalStyles.actions}>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={modalStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.saveBtn, isSaving && modalStyles.saveBtnDisabled]}
              onPress={save}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving
                ? <ActivityIndicator size="small" color={Colors.onSilver} />
                : <Text style={modalStyles.saveText}>Save Changes</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Change Password Modal ─────────────────────────────────────────────────────
function ChangePasswordModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const reset = () => { setCurrent(''); setNext(''); setConfirm(''); };

  const save = async () => {
    if (!current || !next || !confirm) {
      Alert.alert('Missing Fields', 'Please fill in all fields.'); return;
    }
    if (next !== confirm) {
      Alert.alert("Passwords Don't Match", 'New password and confirmation must match.'); return;
    }
    if (next.length < 8) {
      Alert.alert('Too Short', 'Password must be at least 8 characters.'); return;
    }
    setIsSaving(true);
    try {
      await api.post('/auth/change-password', { current_password: current, new_password: next, confirm_password: confirm });
      Alert.alert('Password Updated', 'Your password has been changed successfully.');
      reset();
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Current password is incorrect.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => { reset(); onClose(); };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <Text style={modalStyles.title}>Change Password</Text>
          <Text style={modalStyles.subtitle}>Keep your vault secure</Text>

          {[
            { label: 'CURRENT PASSWORD', value: current, onChange: setCurrent, placeholder: 'Enter current password' },
            { label: 'NEW PASSWORD', value: next, onChange: setNext, placeholder: 'Min. 8 characters' },
            { label: 'CONFIRM NEW PASSWORD', value: confirm, onChange: setConfirm, placeholder: 'Repeat new password' },
          ].map(f => (
            <View key={f.label} style={modalStyles.fieldGroup}>
              <Text style={modalStyles.fieldLabel}>{f.label}</Text>
              <View style={modalStyles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={16} color={Colors.textMuted} style={modalStyles.inputIcon} />
                <TextInput
                  style={modalStyles.input}
                  value={f.value}
                  onChangeText={f.onChange}
                  placeholder={f.placeholder}
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </View>
          ))}

          <View style={modalStyles.actions}>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={handleClose} activeOpacity={0.7}>
              <Text style={modalStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.saveBtn, isSaving && modalStyles.saveBtnDisabled]}
              onPress={save}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving
                ? <ActivityIndicator size="small" color={Colors.onSilver} />
                : <Text style={modalStyles.saveText}>Update Password</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [displayName, setDisplayName] = useState(user?.full_name || '');
  const [isExporting, setIsExporting] = useState(false);

  const loadProfile = async () => {
    try {
      const data = await api.get(API_ENDPOINTS.profile);
      setProfile(data);
      if ((data as any).full_name) setDisplayName((data as any).full_name);
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

  // ── Handlers ────────────────────────────────────────────────────────────────
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

  const handleExportCSV = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const response = await api.downloadFile(API_ENDPOINTS.exportCsv);
      if (!response.ok) throw new Error('Export failed');
      const csvText = await response.text();

      // Share the CSV using native share sheet
      await Share.share(
        Platform.OS === 'ios'
          ? {
              title: 'Stash Transactions Export',
              url: `data:text/csv;charset=utf-8,${encodeURIComponent(csvText)}`,
              message: csvText,
            }
          : {
              title: 'Stash Transactions Export',
              message: csvText,
            }
      );
    } catch {
      Alert.alert(
        'Export',
        'Your transaction data has been prepared. Use the Share option to save it.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handlePaymentMethods = () => {
    Alert.alert(
      'Payment Methods & Wallets',
      'Transactions are tagged with payment methods (UPI, Credit Card, Cash, Debit Card, Bank Transfer).\n\nTo change the payment method on a transaction, open it from the Transactions screen and edit it.',
      [
        { text: 'Go to Transactions', onPress: () => navigation.navigate('Transactions') },
        { text: 'OK', style: 'cancel' },
      ]
    );
  };

  // ── Avatar initials ──────────────────────────────────────────────────────────
  const initials = (displayName || 'U')
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // ── Menu sections ────────────────────────────────────────────────────────────
  const sections = [
    {
      title: 'ACCOUNT & SECURITY',
      items: [
        {
          icon: 'person-outline',
          label: 'Personal Information',
          sublabel: user?.email || 'Edit your name and details',
          onPress: () => setShowEditProfile(true),
        },
        {
          icon: 'shield-checkmark-outline',
          label: 'Security & Password',
          sublabel: 'Change your password',
          onPress: () => setShowChangePassword(true),
        },
        {
          icon: 'card-outline',
          label: 'Payment Methods & Wallets',
          sublabel: 'UPI, Credit Cards, Cash Accounts',
          onPress: handlePaymentMethods,
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
          onPress: () => navigation.navigate('Settings'),
        },
      ],
    },
    {
      title: 'INTELLIGENCE & BACKUP',
      items: [
        {
          icon: 'sparkles',
          label: 'Stash AI Engine',
          sublabel: 'Chat with your financial assistant',
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
          icon: isExporting ? 'hourglass-outline' : 'download-outline',
          label: isExporting ? 'Exporting...' : 'Export Data (CSV)',
          sublabel: 'Download your full transaction history',
          onPress: handleExportCSV,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showEditProfile}
        currentName={displayName}
        currentEmail={user?.email || ''}
        onClose={() => setShowEditProfile(false)}
        onSaved={(name) => setDisplayName(name)}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />

      {/* Header */}
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
          <Text style={styles.headerSubtitle}>Account & Security Settings</Text>
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
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={() => setShowEditProfile(true)}
            activeOpacity={0.8}
          >
            <View style={styles.avatarRing}>
              <View style={styles.avatarCore}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </View>
            <View style={styles.verifiedDot}>
              <Ionicons name="checkmark" size={10} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{displayName || 'Your Name'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'demo@stash.app'}</Text>

          {/* Quick edit button */}
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => setShowEditProfile(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="pencil-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.editProfileBtnText}>Edit Profile</Text>
          </TouchableOpacity>

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

        {/* Menu Sections */}
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
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Session / Danger Zone */}
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

        {/* Footer */}
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

// ── Styles ────────────────────────────────────────────────────────────────────
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

  /* Hero card */
  userHeroCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: Spacing.sm,
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
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
    marginBottom: Spacing.sm,
  },
  editProfileBtnText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
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

  /* Sections */
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

// ── Modal Styles ──────────────────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['2xl'],
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.surfaceAlt,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgInset,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.text,
  },
  lockedBadge: {
    marginLeft: Spacing.sm,
  },
  fieldHint: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginTop: 5,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  saveBtn: {
    flex: 2,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: Colors.silverTop,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveText: {
    fontSize: Typography.base,
    color: Colors.onSilver,
    fontWeight: Typography.bold,
  },
});
