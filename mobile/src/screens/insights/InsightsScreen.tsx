import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, StatusBar, Animated, Alert, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { AppLogo } from '../../components/ui/AppLogo';
import { HeroInfoCard } from '../../components/ui/HeroInfoCard';
import { FeaturedPill } from '../../components/ui/FeaturedPill';
import { InsightRow } from '../../components/ui/InsightRow';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { FloatingNav, NavTab } from '../../components/ui/FloatingNav';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { MOCK_INSIGHTS, MOCK_BUDGET_USED_PCT } from '../../data/mockData';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const InsightsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [activeTab, setActiveTab] = useState<NavTab>('insights');

  useFocusEffect(
    useCallback(() => {
      setActiveTab('insights');
    }, [])
  );

  const rowAnims = useRef(
    MOCK_INSIGHTS.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(20),
    }))
  ).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.stagger(
        40,
        rowAnims.map(({ opacity, translateY }) =>
          Animated.parallel([
            Animated.timing(opacity,    { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
          ])
        )
      ).start();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleTabPress = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'home') navigation.navigate('Home' as any);
    else if (tab === 'accounts') navigation.navigate('Accounts' as any);
  };

  const routes: Record<string, keyof RootStackParamList> = {
    'ins-1': 'Budgets',
    'ins-2': 'Recurring',
    'ins-3': 'Transactions',
    'ins-4': 'Accounts',
    'ins-5': 'Transactions',
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Top Header Row */}
        <View style={styles.header}>
          <AppLogo />
          <TouchableOpacity
            style={styles.analyticsBtn}
            onPress={() => navigation.navigate('Analytics' as any)}
            activeOpacity={0.8}
            accessibilityLabel="Analytics"
            accessibilityRole="button"
          >
            <Ionicons name="bar-chart-outline" size={18} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Display title */}
          <View style={styles.titleBlock}>
            <Text style={styles.headerLabel}>OVERVIEW</Text>
            <Text style={styles.headerTitle}>Budget Health</Text>
          </View>

          {/* 1. HeroInfoCard */}
          <HeroInfoCard
            title="Budget Alerts"
            body="Get notified before you overspend on food, travel or shopping."
            pillLabel="Enable"
            onPillPress={() =>
              Alert.alert('Budget Alerts Enabled', 'You will now receive notifications before approaching category limits.')
            }
          />

          {/* 2. FeaturedPill: Smart Rules */}
          <FeaturedPill
            title="Smart Rules"
            subtitle="Auto-categorize your transactions"
            iconName="sparkles-outline"
            onPress={() => navigation.navigate('SmartRules' as any)}
          />

          {/* 3. Label row: "Budget Health" left, "72% used" right (caption, secondary), then ProgressBar at 72% */}
          <View style={styles.budgetHealthBlock}>
            <View style={styles.labelRow}>
              <Text style={styles.labelTitle}>Budget Health</Text>
              <Text style={styles.labelPct}>{MOCK_BUDGET_USED_PCT}% used</Text>
            </View>
            <ProgressBar value={MOCK_BUDGET_USED_PCT} animated />
          </View>

          {/* 4. Exactly 5 InsightRows */}
          <View style={styles.insightList}>
            {MOCK_INSIGHTS.map((item, i) => (
              <Animated.View
                key={item.id}
                style={{
                  opacity: rowAnims[i] ? rowAnims[i].opacity : 1,
                  transform: [{ translateY: rowAnims[i] ? rowAnims[i].translateY : 0 }],
                }}
              >
                <InsightRow
                  title={item.title}
                  subtitle={item.subtitle}
                  badgeCount={item.badgeCount}
                  iconName={item.iconName as any}
                  onPress={() => {
                    const target = routes[item.id] || 'Analytics';
                    navigation.navigate(target as any);
                  }}
                />
              </Animated.View>
            ))}
          </View>

          {/* 120px bottom padding so content clears FloatingNav */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      {/* FloatingNav with Insights active */}
      <FloatingNav
        activeTab={activeTab}
        onTabPress={handleTabPress}
        onAddPress={() => navigation.navigate('AddTransaction' as any, {})}
      />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  analyticsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.base,
  },
  titleBlock: {
    gap: 2,
    marginBottom: 4,
  },
  headerLabel: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontWeight: Typography.bold,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: Typography.bold,
    color: Colors.text,
    letterSpacing: -0.6,
  },
  budgetHealthBlock: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  labelTitle: {
    fontSize: 16,
    fontWeight: Typography.semibold,
    color: Colors.text,
    letterSpacing: -0.2,
  },
  labelPct: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
  },
  insightList: {
    gap: Spacing.sm,
  },
});
