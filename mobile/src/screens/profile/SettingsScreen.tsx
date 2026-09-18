import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { api } from '../../services/api';
import { API_ENDPOINTS, CURRENCIES } from '../../constants/api';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [prefs, setPrefs] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get<any>(API_ENDPOINTS.profile)
      .then(data => setPrefs(data.preferences || {}))
      .catch(() => setPrefs({}))
      .finally(() => setIsLoading(false));
  }, []);

  const updatePref = async (key: string, value: any) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    try {
      await api.put(API_ENDPOINTS.profilePreferences, { [key]: value });
    } catch {}
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bgBase} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.text} />
          <Text style={styles.loadingText}>Loading Preferences...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.circleBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Preferences</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Currency Section */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionTitle}>BASE CURRENCY</Text>
          <View style={styles.cardGroup}>
            {CURRENCIES.map((c, i) => {
              const isSelected = (prefs?.currency || 'INR') === c.value;
              return (
                <TouchableOpacity
                  key={c.value}
                  style={[styles.row, i < CURRENCIES.length - 1 && styles.rowBorder]}
                  onPress={() => updatePref('currency', c.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.currencyIconWrap}>
                    <Text style={styles.currencySymbol}>{c.symbol}</Text>
                  </View>
                  <Text style={styles.rowLabel}>{c.label}</Text>
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                    {isSelected && <Ionicons name="checkmark" size={14} color={Colors.onSilver} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionTitle}>THEME & PALETTE</Text>
          <View style={styles.cardGroup}>
            {[
              { id: 'dark', label: 'Dark Obsidian (Recommended)', icon: 'moon' },
              { id: 'system', label: 'System Default', icon: 'phone-portrait-outline' },
              { id: 'light', label: 'Light Mode', icon: 'sunny-outline' },
            ].map((t, i) => {
              const isSelected = (prefs?.theme || 'dark') === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.row, i < 2 && styles.rowBorder]}
                  onPress={() => updatePref('theme', t.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.currencyIconWrap}>
                    <Ionicons name={t.icon as any} size={16} color={Colors.textSecondary} />
                  </View>
                  <Text style={styles.rowLabel}>{t.label}</Text>
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                    {isSelected && <Ionicons name="checkmark" size={14} color={Colors.onSilver} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionTitle}>PUSH NOTIFICATIONS</Text>
          <View style={styles.cardGroup}>
            {[
              { key: 'notifications_budget', label: 'Budget Limits & Overspending', sub: 'Receive warnings when exceeding 80% and 100%' },
              { key: 'notifications_recurring', label: 'Subscription Reminders', sub: 'Get notified 2 days before bills are due' },
              { key: 'notifications_weekly_summary', label: 'Weekly Summary Digest', sub: 'Overview of spending every Sunday evening' },
              { key: 'notifications_savings', label: 'Savings Milestones & Nudges', sub: 'Celebrations and tips on your savings progress' },
            ].map((item, i) => (
              <View key={item.key} style={[styles.switchRow, i < 3 && styles.rowBorder]}>
                <View style={styles.switchTextCol}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <Text style={styles.rowSublabel}>{item.sub}</Text>
                </View>
                <Switch
                  value={!!prefs?.[item.key]}
                  onValueChange={v => updatePref(item.key, v)}
                  trackColor={{ false: Colors.surfaceAlt, true: Colors.silverTop }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </View>
        </View>

        {/* Security & Biometrics */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionTitle}>SECURITY & PRIVACY</Text>
          <View style={styles.cardGroup}>
            <View style={[styles.switchRow, styles.rowBorder]}>
              <View style={styles.switchTextCol}>
                <Text style={styles.rowLabel}>Require FaceID / Biometrics</Text>
                <Text style={styles.rowSublabel}>Lock app immediately upon exiting</Text>
              </View>
              <Switch
                value={true}
                disabled
                trackColor={{ false: Colors.surfaceAlt, true: Colors.income }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchTextCol}>
                <Text style={styles.rowLabel}>Zero-Telemetry Mode</Text>
                <Text style={styles.rowSublabel}>Disable analytics logging entirely</Text>
              </View>
              <Switch
                value={true}
                disabled
                trackColor={{ false: Colors.surfaceAlt, true: Colors.silverTop }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
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
  title: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.xl,
  },

  sectionGroup: {
    gap: Spacing.xs,
  },
  sectionTitle: {
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.base,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  currencyIconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  currencySymbol: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  rowLabel: {
    flex: 1,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.text,
  },
  rowSublabel: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    backgroundColor: Colors.silverTop,
    borderColor: Colors.borderAlt,
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: Spacing.base,
  },
  switchTextCol: {
    flex: 1,
    marginRight: Spacing.md,
  },
});
