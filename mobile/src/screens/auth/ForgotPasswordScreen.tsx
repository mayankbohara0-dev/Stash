import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Login');
    }
  };

  const handleSend = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000)); // Simulated
    setSent(true);
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="key-outline" size={32} color={Colors.text} />
            </View>
            <Text style={styles.title}>Reset Password</Text>
            {sent ? (
              <>
                <Text style={styles.subtitle}>
                  If an account exists for {email}, you'll receive a password reset link shortly. Please check your inbox.
                </Text>
                <Button title="Back to Login" onPress={handleBack} variant="outline" />
              </>
            ) : (
              <>
                <Text style={styles.subtitle}>Enter your email and we will send you a recovery link to restore access.</Text>
                <Input
                  label="Email address"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  leftIcon="mail-outline"
                />
                <Button title="Send Reset Link" onPress={handleSend} loading={isLoading} style={{ marginTop: Spacing.sm }} />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgBase },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingBottom: Spacing['2xl'] },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  content: { flex: 1 },
  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.borderAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: { fontSize: Typography['3xl'], fontWeight: Typography.extrabold, color: Colors.text, marginBottom: Spacing.xs },
  subtitle: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: Spacing.xl, lineHeight: 20 },
});
