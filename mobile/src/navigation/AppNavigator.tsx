import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Radius } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

// ── Screens ───────────────────────────────────────────────────────────────────
import { HomeScreen } from '../screens/home/HomeScreen';
import { TransactionsScreen } from '../screens/transactions/TransactionsScreen';
import { TransactionDetailScreen } from '../screens/transactions/TransactionDetailScreen';
import { AddTransactionScreen } from '../screens/transactions/AddTransactionScreen';
import { BudgetsScreen } from '../screens/budgets/BudgetsScreen';
import { CreateBudgetScreen } from '../screens/budgets/CreateBudgetScreen';
import { InsightsScreen } from '../screens/insights/InsightsScreen';
import { AnalyticsScreen } from '../screens/insights/AnalyticsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { AccountsScreen } from '../screens/profile/AccountsScreen';
import { AIScreen } from '../screens/ai/AIScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { SavingsGoalsScreen } from '../screens/budgets/SavingsGoalsScreen';
import { RecurringScreen } from '../screens/budgets/RecurringScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { PreviewScreen } from '../screens/preview/PreviewScreen';
import { SmartRulesScreen } from '../screens/insights/SmartRulesScreen';

// ── Param lists ───────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Main: undefined;
  Preview: undefined;
  AddTransaction: { type?: 'income' | 'expense'; transactionId?: string };
  TransactionDetail: { transactionId: string; iconName?: string };
  CreateBudget: { budgetId?: string };
  SavingsGoals: undefined;
  Recurring: undefined;
  Settings: undefined;
  AIAssistant: undefined;
  Analytics: undefined;
  SmartRules: undefined;
  Accounts: undefined;
  Transactions: undefined;
  Profile: undefined;
  Budgets: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// ── Tab Navigator ─────────────────────────────────────────────────────────────
// NOTE: The tab bar is intentionally hidden — each screen renders its own
// FloatingNav component for the premium floating-pill design.
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // hidden — FloatingNav handles this
      }}
    >
      <Tab.Screen name="Home"         component={HomeScreen} />
      <Tab.Screen name="Insights"     component={InsightsScreen} />
      <Tab.Screen name="Accounts"     component={AccountsScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Budgets"      component={BudgetsScreen} />
      <Tab.Screen name="Profile"      component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ── Root Navigator ────────────────────────────────────────────────────────────
export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Onboarding"     component={OnboardingScreen} />
          <Stack.Screen name="Login"          component={LoginScreen} />
          <Stack.Screen name="Register"       component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="Preview"        component={PreviewScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main"    component={TabNavigator} />

          {/* Preview — accessible from anywhere */}
          <Stack.Screen
            name="Preview"
            component={PreviewScreen}
            options={{ presentation: 'modal' }}
          />

          {/* Modal sheets */}
          <Stack.Screen
            name="AddTransaction"
            component={AddTransactionScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="CreateBudget"
            component={CreateBudgetScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="AIAssistant"
            component={AIScreen}
            options={{ presentation: 'modal' }}
          />

          {/* Push screens */}
          <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
          <Stack.Screen name="Transactions"      component={TransactionsScreen} />
          <Stack.Screen name="Budgets"           component={BudgetsScreen} />
          <Stack.Screen name="Profile"           component={ProfileScreen} />
          <Stack.Screen name="SavingsGoals"      component={SavingsGoalsScreen} />
          <Stack.Screen name="Recurring"         component={RecurringScreen} />
          <Stack.Screen name="Settings"          component={SettingsScreen} />
          <Stack.Screen name="Analytics"         component={AnalyticsScreen} />
          <Stack.Screen name="Accounts"          component={AccountsScreen} />
          <Stack.Screen name="SmartRules"        component={SmartRulesScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({});
