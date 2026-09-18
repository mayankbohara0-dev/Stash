import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, StatusBar,
  KeyboardAvoidingView, Platform, ScrollView, TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password || !confirm) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (!PASSWORD_REGEX.test(password)) {
      Alert.alert('Weak password', 'Password must be 8+ chars with uppercase, lowercase, number and special character.');
      return;
    }
    if (password !== confirm) {
      Alert.alert("Passwords don't match", 'Please make sure both passwords are identical.');
      return;
    }
    setIsLoading(true);
    try {
      await register(email.trim().toLowerCase(), password, fullName.trim());
    } catch (e: any) {
      Alert.alert('Registration failed', e.message || 'Could not create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Onboarding');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.headingTitle}>Create Account</Text>
            <Text style={styles.headingSubtitle}>Start your financial journey with Stash</Text>
          </View>

          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <View style={[styles.inputWrap, focused === 'name' && styles.inputFocused]}>
                <Ionicons name="person-outline" size={17} color={focused === 'name' ? Colors.text : Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Mayank Sharma"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="words"
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <View style={[styles.inputWrap, focused === 'email' && styles.inputFocused]}>
                <Ionicons name="mail-outline" size={17} color={focused === 'email' ? Colors.text : Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={[styles.inputWrap, focused === 'password' && styles.inputFocused]}>
                <Ionicons name="lock-closed-outline" size={17} color={focused === 'password' ? Colors.text : Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPwd}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                />
                <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={styles.eyeBtn} activeOpacity={0.7}>
                  <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
              <Text style={styles.hintText}>8+ chars, uppercase, number &amp; special character</Text>
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Confirm Password</Text>
              <View style={[styles.inputWrap, focused === 'confirm' && styles.inputFocused]}>
                <Ionicons name="shield-checkmark-outline" size={17} color={focused === 'confirm' ? Colors.text : Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPwd}
                  onFocus={() => setFocused('confirm')}
                  onBlur={() => setFocused(null)}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.88}
            >
              {isLoading
                ? <ActivityIndicator size="small" color="#0A0A0B" />
                : <Text style={styles.primaryBtnText}>Create Account</Text>
              }
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>.
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl },

  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    marginTop: Spacing.md, marginBottom: Spacing.xl,
  },
  header: { marginBottom: Spacing['2xl'] },
  headingTitle: {
    fontSize: Typography['3xl'], fontWeight: Typography.extrabold,
    color: Colors.text, letterSpacing: -0.6, marginBottom: Spacing.xs,
  },
  headingSubtitle: { fontSize: Typography.base, color: Colors.textSecondary, lineHeight: 22 },

  form: { gap: Spacing.lg },
  fieldGroup: { gap: Spacing.sm },
  fieldLabel: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textSecondary },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.base, height: 54,
  },
  inputFocused: { borderColor: Colors.borderAlt },
  inputIcon: { marginRight: Spacing.sm },
  input: { flex: 1, fontSize: Typography.base, color: Colors.text },
  eyeBtn: { padding: Spacing.xs },
  hintText: { fontSize: Typography.xs, color: Colors.textMuted },

  primaryBtn: {
    backgroundColor: '#FAFAFB', borderRadius: Radius.full,
    height: 56, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm,
  },
  btnDisabled: { opacity: 0.65 },
  primaryBtnText: { fontSize: Typography.base, fontWeight: Typography.bold, color: '#0A0A0B', letterSpacing: 0.3 },

  termsText: { fontSize: Typography.xs, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
  termsLink: { color: Colors.textSecondary, fontWeight: Typography.medium },

  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: Spacing['2xl'] },
  footerText: { fontSize: Typography.base, color: Colors.textSecondary },
  signInText: { fontSize: Typography.base, fontWeight: Typography.bold, color: '#FFFFFF' },
});
